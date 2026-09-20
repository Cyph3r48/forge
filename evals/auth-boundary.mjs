import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const forge = resolve(root, "forge");
const token = "auth-boundary-test-token";

const require = createRequire(new URL("../forge/package.json", import.meta.url));
const ts = require("typescript");
const storage = new Map();
const browserHeaders = [];
let browserStatus = 200;
let authEvents = 0;

function loadBrowserClient() {
  const source = readFileSync(resolve(forge, "src/lib/client.ts"), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const context = {
    exports: {}, Headers, Response, Event,
    sessionStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
    window: { dispatchEvent: () => { authEvents++; } },
    fetch: async (_path, init) => {
      browserHeaders.push(new Headers(init.headers).get("Authorization"));
      return Response.json({ configured: false, agents: [], entries: [] }, { status: browserStatus });
    },
  };
  runInNewContext(outputText, context);
  return context.exports;
}

const firstPage = loadBrowserClient();
firstPage.setForgeToken(`  ${token}  `);
await firstPage.getMemory();
const refreshedPage = loadBrowserClient();
assert.equal(refreshedPage.hasForgeToken(), true);
await refreshedPage.getMemory();
assert.deepEqual(browserHeaders, [`Bearer ${token}`, `Bearer ${token}`]);
browserStatus = 401;
await assert.rejects(refreshedPage.getMemory(), /failed: 401/);
assert.equal(refreshedPage.hasForgeToken(), false);
assert.equal(authEvents, 1);

async function freePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  server.close();
  await once(server, "close");
  return port;
}

async function startForge(env) {
  const port = await freePort();
  let output = "";
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", String(port)], {
    cwd: forge,
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", (chunk) => { output += chunk; });
  child.stderr.on("data", (chunk) => { output += chunk; });

  const url = `http://127.0.0.1:${port}`;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error(`Forge exited early:\n${output}`);
    try {
      await fetch(`${url}/api/factory/memory`);
      return { child, url, output: () => output };
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  child.kill("SIGTERM");
  throw new Error(`Forge did not start:\n${output}`);
}

async function stopForge(server) {
  server.child.kill("SIGTERM");
  await Promise.race([once(server.child, "exit"), new Promise((resolve) => setTimeout(resolve, 5000))]);
}

async function status(url, path, init) {
  return fetch(`${url}${path}`, init);
}

let upstreamRequests = 0;
const fixture = createServer((request, response) => {
  upstreamRequests++;
  response.setHeader("Content-Type", "application/json");
  if (request.url === "/api/companies/test-company") {
    response.end('{"id":"test-company","name":"Fixture"}');
  } else if (request.method === "POST") {
    response.end('{"id":"issue-1","status":"factory:intake"}');
  } else {
    response.end("[]");
  }
});
fixture.listen(0, "127.0.0.1");
await once(fixture, "listening");
const fixturePort = fixture.address().port;

const unconfigured = await startForge({ FORGE_AUTH_TOKEN: "" });
try {
  const response = await status(unconfigured.url, "/api/factory/memory", {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { ok: false, error: "Forge authentication is not configured" });
  const post = await status(unconfigured.url, "/api/factory/tasks", { method: "POST" });
  assert.equal(post.status, 503);
} finally {
  await stopForge(unconfigured);
}

const configured = await startForge({
  FORGE_AUTH_TOKEN: `  ${token}  `,
  PAPERCLIP_API: `http://127.0.0.1:${fixturePort}/api`,
  PAPERCLIP_TOKEN: "fixture-token",
  PAPERCLIP_COMPANY: "test-company",
});

try {
  for (const path of ["status", "agents", "tasks", "runtime", "memory", "connections"]) {
    const response = await status(configured.url, `/api/factory/${path}`);
    assert.equal(response.status, 401, `anonymous GET ${path}`);
    assert.equal(response.headers.get("www-authenticate"), "Bearer");
  }
  const anonymousPost = await status(configured.url, "/api/factory/tasks", { method: "POST" });
  assert.equal(anonymousPost.status, 401);
  assert.equal(upstreamRequests, 0, "unauthorized requests must stop before engine clients");

  for (const authorization of ["Bearer wrong", `bearer ${token}`, token]) {
    const invalid = await status(configured.url, "/api/factory/memory", {
      headers: { Authorization: authorization },
    });
    assert.equal(invalid.status, 401);
  }
  assert.equal(upstreamRequests, 0);

  const authorization = { Authorization: `Bearer ${token}` };
  let memory;
  for (const path of ["status", "agents", "tasks", "runtime", "memory", "connections"]) {
    const response = await status(configured.url, `/api/factory/${path}`, { headers: authorization });
    assert.equal(response.status, 200, `authenticated GET ${path}`);
    if (path === "memory") memory = response;
  }
  assert.deepEqual(await memory.json(), { configured: false, agents: [], entries: [] });
  assert.ok(upstreamRequests > 0, "valid auth must preserve engine-backed routes");

  const beforeCrossOrigin = upstreamRequests;
  const crossOrigin = await status(configured.url, "/api/factory/tasks", {
    method: "POST",
    headers: { ...authorization, "Content-Type": "application/json", Origin: "https://attacker.example" },
    body: '{"title":"blocked"}',
  });
  assert.equal(crossOrigin.status, 403);
  assert.equal(upstreamRequests, beforeCrossOrigin);

  const crossSite = await status(configured.url, "/api/factory/tasks", {
    method: "POST",
    headers: { ...authorization, "Content-Type": "application/json", Origin: configured.url, "Sec-Fetch-Site": "cross-site" },
    body: '{"title":"blocked"}',
  });
  assert.equal(crossSite.status, 403);
  assert.equal(upstreamRequests, beforeCrossOrigin);

  const sameOrigin = await status(configured.url, "/api/factory/tasks", {
    method: "POST",
    headers: {
      ...authorization,
      "Content-Type": "application/json",
      Origin: configured.url,
      "Sec-Fetch-Site": "same-origin",
      "X-Forwarded-Host": "attacker.example",
      "X-Forwarded-Proto": "https",
    },
    body: '{"title":"accepted","description":"","priority":"medium"}',
  });
  assert.equal(sameOrigin.status, 200);
  assert.equal((await sameOrigin.json()).ok, true);
  assert.equal(upstreamRequests, beforeCrossOrigin + 1);
} catch (error) {
  console.error(configured.output());
  throw error;
} finally {
  await stopForge(configured);
  fixture.close();
  await once(fixture, "close");
}

console.log("PASS: auth protects all seven methods, browser refresh, origins, and upstream call order");
