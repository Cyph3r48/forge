import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";

const require = createRequire(new URL("../forge/package.json", import.meta.url));
const ts = require("typescript");
const source = readFileSync(new URL("../forge/src/lib/transition.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const context = { exports: {} };
runInNewContext(outputText, context);
const { transition } = context.exports;

function fixture({ stage = "factory:intake", memory = true, stale = false, failFinal = false, readControl = false, readStage = false } = {}) {
  let revision = 1;
  let record = { transitions: {} };
  let currentStage = stage;
  let casCalls = 0;
  let memoryCalls = 0;
  let stageCalls = 0;
  return {
    counts: () => ({ casCalls, memoryCalls, stageCalls }),
    record: () => record,
    stage: () => currentStage,
    setStage: (value) => { currentStage = value; },
    control: {
      async read() { if (readControl) throw new Error("control unavailable"); return { revisionId: `r${revision}`, record }; },
      async compareAndSet(base, next) {
        casCalls += 1;
        if (stale && casCalls === 1) return false;
        if (failFinal && casCalls === 3) return false;
        if (base !== `r${revision}`) return false;
        record = next;
        revision += 1;
        return true;
      },
    },
    confirmMemory: async () => { memoryCalls += 1; return memory; },
    readStage: async () => { if (readStage) throw new Error("stage unavailable"); return currentStage; },
    compareAndSetStage: async (_issue, expected, requested) => {
      stageCalls += 1;
      if (currentStage !== expected) return false;
      currentStage = requested;
      return true;
    },
  };
}

const base = {
  issueId: "issue-1",
  outcomeId: "outcome-1",
  principal: { kind: "owner", id: "owner-1" },
  expectedStage: "factory:intake",
  requestedStage: "factory:architect",
  acceptance: {
    decision: "accepted",
    scope: "in-scope",
    priority: "high",
    nextAction: "create architect unit",
    evidenceRef: "owner-note-1",
  },
  evidence: { scope: "MISSION" },
  currentCommit: "abc123",
};

const cases = [
  {
    name: "happy path",
    run: async () => { const f = fixture(); return { result: await transition(base, f), f }; },
    check: ({ result, f }) => { assert.equal(result.status, "committed"); assert.equal(f.stage(), "factory:architect"); },
  },
  {
    name: "unauthenticated or not owner",
    run: async () => ({ result: await transition({ ...base, principal: { kind: "agent", id: "agent-1" } }, fixture()) }),
    check: ({ result }) => assert.equal(result.status, "rejected"),
  },
  {
    name: "missing acceptance evidence",
    run: async () => ({ result: await transition({ ...base, acceptance: { ...base.acceptance, nextAction: "" } }, fixture()) }),
    check: ({ result }) => assert.equal(result.status, "rejected"),
  },
  {
    name: "committed record retains owner acceptance",
    run: async () => { const f = fixture(); const result = await transition(base, f); return { result, record: Object.values(f.record().transitions)[0] }; },
    check: ({ result, record }) => { assert.equal(result.status, "committed"); assert.equal(record.actorId, "owner-1"); assert.deepEqual(record.acceptance, base.acceptance); },
  },
  {
    name: "wrong stage has no side effect",
    run: async () => { const f = fixture({ stage: "factory:context" }); return { result: await transition(base, f), f }; },
    check: ({ result, f }) => { assert.equal(result.status, "rejected"); assert.deepEqual(f.counts(), { casCalls: 0, memoryCalls: 0, stageCalls: 0 }); },
  },
  {
    name: "missing stage has no side effect",
    run: async () => { const f = fixture({ stage: "" }); return { result: await transition(base, f), f }; },
    check: ({ result, f }) => { assert.equal(result.status, "rejected"); assert.deepEqual(f.counts(), { casCalls: 0, memoryCalls: 0, stageCalls: 0 }); },
  },
  {
    name: "control read failure is closed",
    run: async () => { const f = fixture({ readControl: true }); return { result: await transition(base, f), f }; },
    check: ({ result, f }) => { assert.equal(result.status, "rejected"); assert.equal(f.counts().casCalls, 0); assert.equal(f.counts().memoryCalls, 0); },
  },
  {
    name: "stage read failure is closed",
    run: async () => { const f = fixture({ readStage: true }); return { result: await transition(base, f), f }; },
    check: ({ result, f }) => { assert.equal(result.status, "rejected"); assert.equal(f.counts().casCalls, 0); assert.equal(f.counts().memoryCalls, 0); },
  },
  {
    name: "invalid scope or priority is rejected",
    run: async () => ({
      scope: await transition({ ...base, acceptance: { ...base.acceptance, scope: "out-of-scope" } }, fixture()),
      priority: await transition({ ...base, acceptance: { ...base.acceptance, priority: "urgent" } }, fixture()),
    }),
    check: ({ scope, priority }) => { assert.equal(scope.status, "rejected"); assert.equal(priority.status, "rejected"); },
  },
  {
    name: "second pending outcome is rejected",
    run: async () => { const f = fixture({ memory: false }); await transition(base, f); const result = await transition({ ...base, outcomeId: "outcome-2" }, f); return { result, f }; },
    check: ({ result, f }) => { assert.equal(result.status, "rejected"); assert.match(result.reason, /another transition/); assert.equal(f.counts().memoryCalls, 1); assert.equal(f.counts().stageCalls, 0); },
  },
  {
    name: "stale CAS has no side effect",
    run: async () => { const f = fixture({ stale: true }); return { result: await transition(base, f), f }; },
    check: ({ result, f }) => { assert.equal(result.status, "conflict"); assert.deepEqual(f.counts(), { casCalls: 1, memoryCalls: 0, stageCalls: 0 }); assert.equal(f.stage(), "factory:intake"); },
  },
  {
    name: "memory failure leaves old label",
    run: async () => { const f = fixture({ memory: false }); return { result: await transition(base, f), f }; },
    check: ({ result, f }) => { assert.equal(result.status, "pending-memory"); assert.equal(f.stage(), "factory:intake"); assert.equal(f.counts().stageCalls, 0); },
  },
  {
    name: "same identity retries the committed result",
    run: async () => { const f = fixture(); const first = await transition(base, f); const second = await transition(base, f); return { first, second, f }; },
    check: ({ first, second, f }) => { assert.equal(first.status, "committed"); assert.deepEqual(second, first); assert.equal(f.counts().memoryCalls, 1); assert.equal(f.counts().stageCalls, 1); },
  },
  {
    name: "committed retry detects stage drift",
    run: async () => { const f = fixture(); await transition(base, f); f.setStage("factory:context"); return { result: await transition(base, f) }; },
    check: ({ result }) => assert.equal(result.status, "pending-projection"),
  },
  {
    name: "changed input conflicts",
    run: async () => { const f = fixture(); await transition(base, f); return { result: await transition({ ...base, evidence: { scope: "OTHER" } }, f) }; },
    check: ({ result }) => assert.equal(result.status, "conflict"),
  },
  {
    name: "resume after label write",
    run: async () => { const f = fixture({ failFinal: true }); const first = await transition(base, f); const second = await transition(base, f); return { first, second, f }; },
    check: ({ first, second, f }) => { assert.equal(first.status, "pending-projection"); assert.equal(second.status, "committed"); assert.equal(f.stage(), "factory:architect"); assert.equal(f.counts().stageCalls, 1); },
  },
  {
    name: "pair identity does not collide",
    run: async () => { const f = fixture(); const first = await transition({ ...base, issueId: "a:b", outcomeId: "c" }, f); f.setStage("factory:intake"); const second = await transition({ ...base, issueId: "a", outcomeId: "b:c" }, f); return { first, second }; },
    check: ({ first, second }) => { assert.equal(first.status, "committed"); assert.equal(second.status, "committed"); assert.notEqual(first.transitionId, second.transitionId); },
  },
];

for (const test of cases) test.check(await test.run());
console.log(`PASS: ${cases.length} transition cases`);
