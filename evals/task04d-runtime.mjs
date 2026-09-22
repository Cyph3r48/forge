import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";

const require = createRequire(new URL("../forge/package.json", import.meta.url));
const ts = require("typescript");
const paperclipFixture = JSON.parse(readFileSync(new URL("./fixtures/paperclip-v2026.916.0.json", import.meta.url)));
const hermesFixture = JSON.parse(readFileSync(new URL("./fixtures/hermes-v2026.9.14.json", import.meta.url)));

function load(name, env, fetch) {
  const source = readFileSync(new URL(`../forge/src/lib/${name}.ts`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const context = { exports: {}, AbortSignal, Response, process: { env }, fetch };
  runInNewContext(outputText, context);
  return context.exports;
}

const env = {
  PAPERCLIP_API: "http://paperclip.test/api",
  PAPERCLIP_TOKEN: "test",
  PAPERCLIP_COMPANY: paperclipFixture.company.id,
  HERMES_API_URL: "http://hermes.test",
  HERMES_API_KEY: "test",
};
const response = (value, status = 200) => Response.json(value, { status });
const emptyPaperclip = (url) => url.endsWith(`/companies/${env.PAPERCLIP_COMPANY}`)
  ? response(paperclipFixture.company)
  : response([]);
const emptyHermes = (url) => url.endsWith("/health")
  ? response({ status: "ok", version: "fixture" })
  : response({ data: [] });

const fixtureRuns = paperclipFixture.heartbeatRuns;
const runs = [...fixtureRuns];
const runtimeSource = readFileSync(new URL("../forge/src/lib/runtime.ts", import.meta.url), "utf8");
const runtimeOutput = ts.transpileModule(runtimeSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const runtimeContext = { exports: {}, AbortSignal, require: () => ({ listRuns: async () => runs }) };
runInNewContext(runtimeOutput, runtimeContext);
for (const status of ["succeeded", "interrupted", "failed", "cancelled", "timed_out"]) {
  const run = fixtureRuns.find((candidate) => candidate.status === status);
  runs.splice(0, runs.length, { ...run, agentId: "agent", finishedAt: null });
  const terminal = (await runtimeContext.exports.deriveRuntime([{ id: "agent", name: "Builder", role: "Builder" }]))[0];
  assert.equal(terminal.state, "done", `${status} without finishedAt must not be working`);
}
runs.splice(0, runs.length);
assert.equal((await runtimeContext.exports.deriveRuntime([{ id: "agent", name: "Builder", role: "Builder" }]))[0].state, "idle");
runs.push({ id: "active", agentId: "agent", status: "running", startedAt: "2026-09-20T16:00:00Z", finishedAt: null });
assert.equal((await runtimeContext.exports.deriveRuntime([{ id: "agent", name: "Builder", role: "Builder" }]))[0].state, "working");

const healthyPaperclip = load("paperclip", env, async (url) => emptyPaperclip(url));
const healthyHermes = load("hermes", env, async (url) => emptyHermes(url));
assert.equal((await healthyPaperclip.paperclipStatus()).ok, true, "empty valid Paperclip collections stay healthy");
assert.equal((await healthyHermes.hermesStatus()).ok, true, "empty valid Hermes collections stay healthy");

for (const [label, fetch] of [
  ["malformed JSON", async () => response([])],
  ["non-JSON error", async () => new Response("bad", { status: 502 })],
  ["unreachable", async () => { throw new Error("offline"); }],
]) {
  assert.equal((await load("paperclip", env, fetch).paperclipStatus()).ok, false, `Paperclip ${label} is unhealthy`);
  assert.equal((await load("hermes", env, fetch).hermesStatus()).ok, false, `Hermes ${label} is unhealthy`);
}

const paperclipFails = load("paperclip", env, async () => { throw new Error("Paperclip offline"); });
const hermesSucceeds = load("hermes", env, async (url) => emptyHermes(url));
assert.equal((await paperclipFails.paperclipStatus()).ok, false);
assert.equal((await hermesSucceeds.hermesStatus()).ok, true);
const paperclipSucceeds = load("paperclip", env, async (url) => emptyPaperclip(url));
const hermesFails = load("hermes", env, async () => { throw new Error("Hermes offline"); });
assert.equal((await paperclipSucceeds.paperclipStatus()).ok, true);
assert.equal((await hermesFails.hermesStatus()).ok, false);

console.log("PASS: terminal runs, valid empty data, transport/schema failures, and partial engine health are classified safely");
