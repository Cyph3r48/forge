# Task 06a: transition and claim contract

Status: lead design for local fixture implementation. No live transition or
unattended dispatch is authorized. The [Task 02 acceptance table](TASK-02-ACCEPTANCE.md)
defines the stage gates; this file defines how one transition survives retries.

## Durable record

Use one Paperclip issue document named `factory-control` on a dedicated control
issue for the company. Create and record that issue ID during setup, then exclude
it from factory job selection. Its document holds the current stage and pending
operation for each factory issue, active dispatch claims, and stable outcome IDs.
Paperclip labels remain the visible stage projection. The document is the sole
factory state writer; seats submit outcomes through one Forge transition service.
Do not add a Forge database for the local manual flow.

Every document update supplies the last `latestRevisionId` as `baseRevisionId`.
Paperclip rejects a stale revision; its database also makes each document's
revision number unique. A competing write may surface as a conflict or another
non-success response. On any uncertain response, read the document again before
doing a side effect. Never treat a failed write as a claim. Initial document
creation is setup work, before any tick. If the document is missing, malformed,
or locked, stop dispatch and report `needs-human`.

The record for a transition contains `transitionId`, `issueId`, `outcomeId`,
`actorId`, `fromStage`, `toStage`, `headSha` when code evidence is involved,
`evidenceRefs`, `memoryStatus`, `projectionStatus`, and the time and reason for
each change. `outcomeId` is supplied once by the caller and reused on retry.
The pair `(issueId, outcomeId)` maps to one durable `transitionId`; the same
pair with a different input fingerprint is a conflict. A new outcome for an issue with a
pending transition is rejected. Keep enough history in the document to reject
old outcome IDs; do not silently forget them.

## Transition operation

Input: the issue and outcome IDs, a trusted principal, expected stage,
requested stage, outcome and evidence, current commit when applicable, and an
optional existing transition ID. Return one structured result:
`committed`, `pending-memory`, `pending-projection`, `rejected`, `conflict`, or
`needs-human`, always with the transition ID when one exists and a reason.
The service derives actor ID and seat from the trusted principal, never from
the submitted outcome. Owner acceptance requires an authenticated owner
principal; seat outcomes require a verified agent ID mapped to exactly one of
the four company seats. The current shared Forge token does not establish
either identity, so Task 06b exposes no live transition route. Its synthetic
checks supply explicit trusted principals; live use waits for an identity
boundary that can make these checks.

1. Read the control document and Paperclip issue. Confirm one factory label,
   matching expected stage, no other pending transition, and the applicable
   Task 02 entry and exit requirements. Reject unauthorized stage changes.
2. Write the pending transition with a revision precondition. This is the
   durable point after which retries reuse the same transition ID. A losing
   caller rereads and returns the winner's result or a conflict.
3. Confirm transition memory using that ID as the provider's idempotency key.
   Until confirmed, keep `pending-memory`; do not change the issue label or
   dispatch the next seat. An unconfigured provider leaves this state visible.
4. Persist `memoryStatus: confirmed`, then replace only the factory stage label
   in the synthetic Paperclip adapter. Preserve unrelated labels and native
   issue status. Do not change the assignee or invoke a heartbeat as part of
   this write. Recheck the expected old label immediately before writing; a
   mismatch blocks projection and needs human repair.
5. Persist `projectionStatus: confirmed` and mark the transition committed.
   Only committed transitions enter the manual dispatch queue. If the label
   write or final record write fails, retry from the saved state after reading
   both surfaces. Never write a second memory entry or advance twice.

The memory provider contract in Task 08 must support idempotent confirmation
by transition ID. Until one is selected and tested, Task 06b uses a synthetic
provider and production stage advancement stays disabled. A timeout is unknown,
not success or failure; read/retry with the same ID. If Paperclip's label
disagrees with a committed record, stop dispatch for that issue and surface a
repair request. Do not infer permission from a label alone.
Paperclip's issue PATCH has no conditional label precondition. A read before
PATCH cannot prevent a concurrent board edit from being overwritten. Live
projection stays disabled until an exclusive factory stage writer is enforced
or a conditional update is available and tested. The control document's
revision check does not protect the separate issue-label write.

## Manual claim and run recovery

One tick reads the control document, selects at most one eligible action by
the fixed order in [pipeline.md](../factory/pipeline.md), and writes a claim
with the same revision precondition before starting anything. The claim has
`actionId`, `issueId`, `seat`, `transitionId`, `claimedAt`, `lastActivityAt`,
`runId` if known, and state `claimed`, `started`, or `resolved`. One unresolved
claim per issue and seat, and at most two active Builds per company, are checked
inside this single document update. Tester and Reviewer actions, Intake, merge,
and deployment remain manual at dial 1. A second tick rereads after a failed
claim and cannot submit the same action.

For a Hermes run, derive `Idempotency-Key` from the durable `actionId` and send
the exact same request on retry. The pinned source implements replay, but the
current `/v1/capabilities` fixture advertises only run submission; it does not
prove durable idempotency for an installed engine. Task 06c uses a synthetic
run adapter. Live submission stays disabled until that installed guarantee is
verified. Persist the returned `run_id`, then poll it by
ID. If the response is lost, replay the same key and payload to recover that
ID. A payload conflict, expired idempotency window, missing run, or unknown
execution state leaves the claim held and needs human review; never start a
replacement run automatically. A Paperclip heartbeat without an equivalent
idempotent admission path must also stay manual until its claim and recovery
contract is proved.

On restart, read the control document first. Reconcile pending memory writes,
label projection, and claimed runs in that order. A Build blocker older than
two hours or any working state inactive for four hours records `needs-human`
with the blocker or last output. Do not release an uncertain live claim merely
because its time limit passed. Release only after a terminal run or an explicit
human resolution. No timer runs ticks; a person invokes each tick.

## Required fixture proof before implementation acceptance

- Two simultaneous claims for one issue: one winner, one reread, one run.
- Two simultaneous Build claims when one Build is already active: at most two
  active Builds in total.
- Crash after claim, after run admission, after memory confirmation, and after
  label update: each retry resumes the same IDs and reaches one committed state.
- Stale document revision, mismatched label, missing provider, failed memory
  confirmation, and malformed control document: no stage advancement or run.
- Same outcome ID with changed evidence or commit: conflict. Empty or failed
  Task 02 evidence: rejected. Two-hour Build blocker and four-hour inactivity:
  reasoned escalation without duplicate dispatch.

The document is a single company-wide serialization point. Keep this simple
for the manual flow; split it only if measured size or write contention makes
it insufficient.

## Pinned source basis

- [Paperclip issue document route](https://github.com/paperclipai/paperclip/blob/dffc2b3ca1b9e88fa21cb17493083e682dffd1ca/server/src/routes/issues.ts#L9648-L9695) passes `baseRevisionId` to the document service.
- [Paperclip document service](https://github.com/paperclipai/paperclip/blob/dffc2b3ca1b9e88fa21cb17493083e682dffd1ca/server/src/services/documents.ts#L200-L423) checks that revision in a database transaction.
- [Paperclip revision schema](https://github.com/paperclipai/paperclip/blob/dffc2b3ca1b9e88fa21cb17493083e682dffd1ca/packages/db/src/schema/document_revisions.ts) makes `(documentId, revisionNumber)` unique.
- [Hermes run admission](https://github.com/NousResearch/hermes-agent/blob/345cd2b057a452236de401d3534b8502a7465e8d/gateway/platforms/api_server_runs.py#L271-L479) reserves a stable idempotency key before launching a run and replays the original ID.
