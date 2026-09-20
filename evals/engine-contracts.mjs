import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const load = (name) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url)));
const paperclip = load("paperclip-v2026.916.0.json");
const hermes = load("hermes-v2026.9.14.json");

assert.equal(paperclip.source.commit, "dffc2b3ca1b9e88fa21cb17493083e682dffd1ca");
assert.deepEqual(Object.keys(paperclip.createIssue.request).sort(), [
  "assigneeAgentId", "description", "labelIds", "priority", "status", "title",
]);
assert.equal(paperclip.createIssue.request.status, "todo");
assert.match(paperclip.createIssue.request.labelIds[0], /^[0-9a-f-]{36}$/);
assert.ok(paperclip.heartbeatRuns.some((run) => run.status === "failed" && run.finishedAt === null));

assert.equal(hermes.source.commit, "345cd2b057a452236de401d3534b8502a7465e8d");
assert.equal(hermes.sessions.object, "list");
assert.ok(hermes.capabilities.features.run_submission);
assert.deepEqual(new Set(hermes.runs.map((run) => run.status)), new Set([
  "queued", "running", "waiting_for_approval", "stopping",
  "completed", "failed", "cancelled", "interrupted",
]));

console.log("PASS: pinned Paperclip and Hermes fixtures match the approved Task 04a contract");
