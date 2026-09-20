import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";

const require = createRequire(new URL("../forge/package.json", import.meta.url));
const ts = require("typescript");
const fixture = JSON.parse(readFileSync(new URL("./fixtures/paperclip-v2026.916.0.json", import.meta.url)));
const source = readFileSync(new URL("../forge/src/lib/paperclip.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

async function run({ agents = fixture.agents, labels = fixture.labels, issue = fixture.issues[0] } = {}) {
  const requests = [];
  const context = {
    exports: {}, AbortSignal,
    process: { env: { PAPERCLIP_API: "http://paperclip.test/api", PAPERCLIP_TOKEN: "test", PAPERCLIP_COMPANY: fixture.company.id } },
    fetch: async (url, init = {}) => {
      requests.push({ url, init });
      if (url.endsWith("/agents")) return Response.json(agents);
      if (url.endsWith("/labels")) return Response.json(labels);
      if (url.endsWith("/issues") && init.method === "POST") return Response.json(issue);
      throw new Error(`Unexpected request: ${url}`);
    },
  };
  runInNewContext(outputText, context);
  return { result: await context.exports.createIssue(fixture.createIssue.input), requests };
}

const created = await run();
assert.equal(created.result.ok, true);
assert.deepEqual(created.requests.map(({ url }) => url), [
  `http://paperclip.test/api/companies/${fixture.company.id}/agents`,
  `http://paperclip.test/api/companies/${fixture.company.id}/labels`,
  `http://paperclip.test/api/companies/${fixture.company.id}/issues`,
]);
assert.deepEqual(JSON.parse(created.requests.find(({ init }) => init.method === "POST").init.body), fixture.createIssue.request);
assert.equal(created.result.assignee, fixture.createIssue.normalized.assignee);
assert.equal(created.result.state, fixture.createIssue.normalized.state);

for (const [dependencies, error] of [
  [{ agents: {} }, /malformed agents collection$/],
  [{ labels: {} }, /malformed labels collection$/],
  [{ agents: [] }, /Foreman; found 0$/],
  [{ agents: [fixture.agents[0], { ...fixture.agents[0], id: "duplicate-foreman" }] }, /Foreman; found 2$/],
  [{ agents: [{ role: "Foreman", name: "No ID" }] }, /malformed Foreman$/],
  [{ labels: fixture.labels.filter(({ name }) => name !== "factory:intake") }, /factory:intake label; found 0$/],
  [{ labels: [...fixture.labels, { ...fixture.labels[0], id: "duplicate-intake" }] }, /factory:intake label; found 2$/],
  [{ labels: [{ name: "factory:intake" }] }, /malformed factory:intake label$/],
]) {
  const failed = await run(dependencies);
  assert.equal(failed.result.ok, false);
  assert.match(failed.result.error, error);
  assert.equal(failed.requests.some(({ init }) => init.method === "POST"), false);
}

for (const issue of [
  {},
  { ...fixture.issues[0], status: "backlog" },
  { ...fixture.issues[0], priority: "low" },
  { ...fixture.issues[0], assigneeAgentId: "wrong-agent" },
  { ...fixture.issues[0], labelIds: [] },
]) {
  const failed = await run({ issue });
  assert.equal(failed.result.ok, false);
  assert.equal(failed.result.error, "Paperclip returned a malformed created issue");
  assert.equal(failed.requests.filter(({ init }) => init.method === "POST").length, 1);
}

console.log("PASS: task creation resolves one Foreman and intake label before the exact Paperclip POST");
