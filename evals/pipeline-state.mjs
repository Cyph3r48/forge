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
  exports: {}, AbortSignal,
  process: { env: { PAPERCLIP_API: "http://paperclip.test/api", PAPERCLIP_TOKEN: "test", PAPERCLIP_COMPANY: fixture.company.id } },
};
runInNewContext(outputText, context);

const stage = (issue) => context.exports.factoryStage(issue);
assert.equal(stage({ status: "done", labels: [{ name: "factory:build" }] }), "factory:build");
assert.equal(stage({ status: "in_review", labels: [] }), "");
assert.equal(stage({ status: "done", labels: [{ name: "factory:review" }, { name: "factory:ship" }] }), "");
assert.equal(stage({ status: "done", labels: [{ name: "unrelated" }] }), "");

assert.equal(fixture.approvals[0].issueId, undefined);
assert.equal(fixture.approvals[0].type, "deployment");
assert.deepEqual(fixture.approvalIssues[fixture.approvals[0].id].map(({ identifier }) => identifier), ["FORGE-1"]);
assert.deepEqual(
  JSON.parse(JSON.stringify(context.exports.deriveApprovalGates(
    [...fixture.approvals, { id: "not-pending", status: "approved", type: "review" }],
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
