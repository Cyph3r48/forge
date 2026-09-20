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
assert.deepEqual(new Set(paperclip.heartbeatRuns.filter((run) => run.status !== "running").map((run) => run.status)), new Set([
  "succeeded", "interrupted", "failed", "cancelled", "timed_out",
]));
assert.ok(paperclip.heartbeatRuns.some((run) => run.status === "failed" && run.finishedAt === null));
const issue = paperclip.issues.find(({ id }) => id === paperclip.createIssue.normalized.id);
const assignee = paperclip.agents.find(({ id }) => id === paperclip.createIssue.request.assigneeAgentId);
const label = paperclip.labels.find(({ id }) => id === paperclip.createIssue.request.labelIds[0]);
assert.ok(issue && assignee && label);
assert.equal(issue.assigneeAgentId, paperclip.createIssue.request.assigneeAgentId);
assert.ok(issue.labelIds.includes(label.id));
assert.ok(issue.labels.some((resolved) => resolved.id === label.id && resolved.name === label.name));
assert.deepEqual(paperclip.createIssue.normalized, {
  id: issue.id,
  identifier: issue.identifier,
  title: issue.title,
  state: label.name,
  assignee: assignee.name,
  priority: issue.priority,
});

assert.equal(hermes.source.commit, "345cd2b057a452236de401d3534b8502a7465e8d");
assert.equal(hermes.sessions.object, "list");
assert.ok(hermes.capabilities.features.run_submission);
assert.equal(hermes.normalized.healthOk, hermes.health.status === "ok");
assert.equal(hermes.normalized.sessionCount, hermes.sessions.data.length);
assert.deepEqual(hermes.runSubmission, {
  request: { input: "Run the fixture task" },
  status: 202,
  response: { run_id: "run-submitted", status: "started", replayed: false },
});
assert.deepEqual(new Set(hermes.runs.map((run) => run.status)), new Set([
  "queued", "running", "waiting_for_approval", "stopping",
  "completed", "failed", "cancelled", "interrupted",
]));
const active = new Set(["queued", "running", "waiting_for_approval", "stopping"]);
assert.deepEqual(hermes.normalized.activeRunIds, hermes.runs.filter((run) => active.has(run.status)).map((run) => run.run_id));
assert.deepEqual(hermes.normalized.terminalRunIds, hermes.runs.filter((run) => !active.has(run.status)).map((run) => run.run_id));

console.log("PASS: pinned Paperclip and Hermes fixtures match the approved Task 04a contract");
