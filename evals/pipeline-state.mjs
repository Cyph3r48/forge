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
const context = {
  exports: {}, AbortSignal, Response,
  process: { env: { PAPERCLIP_API: "http://paperclip.test/api", PAPERCLIP_TOKEN: "test", PAPERCLIP_COMPANY: fixture.company.id } },
};
runInNewContext(outputText, context);

const requests = [];
context.fetch = async (url, init = {}) => {
  requests.push({ url, init });
  if (url.endsWith(`/companies/${fixture.company.id}/approvals?status=pending`)) {
    return Response.json([
      { ...fixture.approvals[0], type: " deployment " },
      { id: "approved", status: "approved", type: "review" },
      { id: "not-an-id", status: "pending", type: "review" },
    ]);
  }
  if (url.endsWith(`/approvals/${fixture.approvals[0].id}/issues`)) return Response.json(fixture.approvalIssues[fixture.approvals[0].id]);
  throw new Error(`Unexpected request: ${url}`);
};
const approvals = await context.exports.listApprovals();
assert.deepEqual(JSON.parse(JSON.stringify(approvals)), [{ ...fixture.approvals[0], type: " deployment " }]);
assert.deepEqual(requests.map(({ url }) => url), [
  `http://paperclip.test/api/companies/${fixture.company.id}/approvals?status=pending`,
]);
const linked = await context.exports.listApprovalIssues(approvals[0].id);
assert.deepEqual(JSON.parse(JSON.stringify(linked)), fixture.approvalIssues[fixture.approvals[0].id]);
await context.exports.listApprovalIssues("approved");
await context.exports.listApprovalIssues("not-an-id");
assert.deepEqual(requests.map(({ url }) => url), [
  `http://paperclip.test/api/companies/${fixture.company.id}/approvals?status=pending`,
  `http://paperclip.test/api/approvals/${fixture.approvals[0].id}/issues`,
]);
context.fetch = async () => Response.json({ malformed: true });
assert.deepEqual(JSON.parse(JSON.stringify(await context.exports.listApprovals())), []);
const malformedLinked = await context.exports.listApprovalIssues(fixture.approvals[0].id);
assert.deepEqual(JSON.parse(JSON.stringify(malformedLinked)), []);
assert.deepEqual(JSON.parse(JSON.stringify(context.exports.deriveApprovalGates(
  fixture.approvals,
  { [fixture.approvals[0].id]: malformedLinked },
))), []);

const stage = (issue) => context.exports.factoryStage(issue);
assert.equal(stage(null), "");
assert.equal(stage({ labels: {} }), "");
assert.equal(stage({ status: "done", labels: [{ name: "factory:build" }] }), "factory:build");
assert.equal(stage({ status: "in_review", labels: [] }), "");
assert.equal(stage({ status: "done", labels: [{ name: "factory:review" }, { name: "factory:ship" }] }), "");
assert.equal(stage({ status: "done", labels: [{ name: "unrelated" }] }), "");

assert.equal(fixture.approvals[0].issueId, undefined);
assert.equal(fixture.approvals[0].type, "deployment");
assert.deepEqual(fixture.approvalIssues[fixture.approvals[0].id].map(({ identifier }) => identifier), ["FORGE-1"]);
assert.deepEqual(
  JSON.parse(JSON.stringify(context.exports.deriveApprovalGates(
    [{ ...fixture.approvals[0], type: " deployment " }, { id: "not-pending", status: "approved", type: "review" }],
    fixture.approvalIssues,
  ))),
  [{
    id: `${fixture.approvals[0].id}:${fixture.issues[0].id}`,
    issue: "FORGE-1",
    kind: "deployment",
    waitingOn: "human",
    reason: "pending deployment",
  }],
);
assert.deepEqual(context.exports.deriveApprovalGates([], {}), []);
assert.deepEqual(context.exports.deriveApprovalGates(
  [{ id: "label-only", status: "pending", type: "review" }],
  { "label-only": [] },
), []);

console.log("PASS: factory labels are separate from native status and pending gates require linked approvals");
