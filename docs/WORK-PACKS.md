# Phase task packs

Read [PROGRESS.md](PROGRESS.md) first. These packs break its numbered tasks
into assignments; they do not replace the spec. The owner-approved Task 02
policy is recorded in [TASK-02-ACCEPTANCE.md](TASK-02-ACCEPTANCE.md).
Only Phase 1 is open. Later packs are a backlog, not permission to start.

## Assignment rules

- Lead owns architecture, contracts, security review, and acceptance decisions.
  Owner approves policy changes, live connections, merging, and deployment.
- A worker implements one approved subtask. Start with bounded document,
  fixture, form, and mapping work. Do not assign an entire phase to one run.
- Before assignment, lead records task ID, base SHA, exact writable files,
  prerequisites, input/output examples, checks, and a time/usage cap. Paths
  below are starting points, not permission to edit every file in a directory.
- A ticket is READY only after its dependencies and decisions are resolved.
  An API without verified source references or a supplied fixture is not READY.
- Worker reads the affected flow and searches all callers before editing.
  Reuse installed tools and existing helpers. No speculative abstractions,
  dependency additions, private providers, or unrelated refactors.
- Stop for scope overlap, conflicting instructions, missing contracts,
  credentials, protected-file edits, or a required security decision. Report
  the exact blocker. Do not guess, weaken a check, or proceed to another task.
- Use synthetic data and isolated local services. Never test against personal
  engines. Do not commit environment files, secrets, raw transcripts, or media.
- Worker cannot approve its own output. Tester checks requirements independently;
  Reviewer inspects the exact diff and current SHA. Holdout cases stay outside
  the worker's accessible workspace. Worktrees alone are not a security boundary.
- Allow at most two correction attempts. Then return the task to the lead.
  A successful pilot earns similar work, not authority over security or policy.
- Only the coordinating lead updates the shared progress ledger after review.
  Workers return their handoff in the PR or response, preventing ledger conflicts.

## Worker eligibility and next queue

These assignments apply to any smaller, faster replacement model. A model name
does not establish competence. The observed Luna trials cover document reading,
drafting, and alignment with lead corrections; coding remains untested.

| Assignment | Eligibility and limit |
|---|---|
| 03a inventory | Ready for a fresh worker trial: list the six route files and seven exported methods, callers, upstream reads/writes, and existing errors. Read-only; lead verifies every row. No auth design. |
| 03b boundary | Lead only: credential transport, shared auth guard, origin/CSRF rules, secret handling, and error policy. |
| 03b route wiring | Blocked until the boundary passes independent security review and the worker passes a coding trial. One route per ticket, supplied example and negative cases, lead reviews every call order. |
| 03c checks | Worker may run approved synthetic cases and report raw results. Independent Tester/Reviewer owns acceptance; worker does not certify its own changes. |
| 04 fixtures/mappings | Blocked until Task 03 and verified engine contracts. One fixture or normalization function per ticket; lead supplies exact expected output. |
| 05 bundle manifest | Blocked until its dependencies and approved seat assignments. Small deterministic local task; no remote installation. |
| Tasks 06-16 | Backlog only. Lead splits eligible mechanical work after the preceding phase passes. Never assign a whole dispatcher, gate system, security boundary, or UI redesign to an unproven worker. |

For each new model, first run a read-only trial against known source evidence.
Then use one isolated, reversible coding exercise with a known failure and an
independent check before permitting production code. The exercise grants no
permission to skip project phases or write security logic. Record correction
count and review effort, not just a self-reported pass. If either exceeds the
benefit, keep that model on reading/fixtures or have the lead do the task.
Two failed correction attempts end the assignment. Do not spend repeated runs
trying to teach an unsuitable model during delivery.

## Worktree procedure

Use the clean `Cyph3r48/forge` repository. In the original workspace its
publishing checkout is `.artifacts/forge-publish-0915/`. Never push the original
workspace history or an older source snapshot. A normal clean GitHub clone is
also suitable. Run the following from that clean repository, not an old checkout:

```bash
git status --short --branch
git worktree list --porcelain
git fetch origin
gh pr list --state open
# Repeat for each open PR, using its actual number:
gh pr diff <number> --name-only
# Choose a new unique name per task AND per worker. Never use --force here.
git worktree add .worktrees/<task-worker-unique> -b agent/<task-worker-unique> origin/main
cd .worktrees/<task-worker-unique>
git branch --show-current
git rev-parse HEAD
git status --short
```

The angle-bracket values are placeholders; replace them before running.
Inspect status in every registered checkout and compare assigned paths with
active tasks and PRs. On overlap, stop and ask the lead. Ensure `.worktrees/`
is ignored before creating it. No origin means local work can branch from local
`main`, but does not authorize publishing that history. Stop if no safe base exists.
Never reuse another agent's checkout, branch, index, or uncommitted changes.

Install dependencies in your own worktree only when the task needs them.
Use a unique server port, identify its owning process, and use a separate
fixture directory/database. Do not kill another worker's server. Keep the
worktree until its PR is merged or closed; only then remove your own worktree.
Rebase onto current clean `origin/main` before review and rerun affected checks.
No force-push to main, no automatic merge, and no deployment from a worker run.

## Completion evidence

Every handoff includes task ID, model/settings, base/head SHA, changed files,
commands with exit status and assertions, before/after evidence, known gaps,
and the next dependency. Report actual duration, correction attempts, and usage
when the tool exposes it. Unknown cost stays unknown; do not estimate subscription
quota from API prices. Never count a self-reported success as reviewed acceptance.

For code tasks, from `forge/` after `npm ci`:

```bash
npm run build
./node_modules/.bin/tsc --noEmit --incremental false
```

From the repository root:

```bash
python3 evals/doctor.py
node evals/unconfigured-clients.mjs
git diff --check
```

Leave one focused runnable regression check for changed logic. The current
doctor only checks document structure; its success does not prove runtime gates.
Docs-only tasks need doctor, diff checks, and verified references, not a build.
UI tasks also need real browser actions and desktop/mobile evidence. Use
`before-and-after` for visible changes; do not upload private evidence publicly.
Follow AGENTS.md for PR and independent OpenCodeReview delegation. Missing or
incomplete review is pending, never PASS.

## Phase 1: foundations

Task 01 is complete. Do not redo repository cleanup or reinstall existing skills.

### 02. Align rules

- [x] 02a, worker pilot: read the spec, law, pipeline, and four role charters.
  Return a conflict table with exact file/line pairs and owner questions.
  Distinguish contradictions from missing decisions. Change no files. The
  [pilot response](PILOT-02A.md) passed after one correction round.
- [x] 02b, lead + owner: resolve transition ownership, Cleanup semantics,
  Tester timing, Reviewer independence, manual intake, merge/deploy authority,
  memory failure behavior, and the protected-rule amendment process. The owner
  approved [the acceptance rules](TASK-02-ACCEPTANCE.md) and the alignment edits.
- [x] 02c, worker after approval: apply the recorded decisions only to
  `docs/spec-v0.4.md`, `FACTORY-LAW.md`, `factory/pipeline.md`, and named role
  charters. Protected-rule edits require explicit owner authorization first.
- Pass: a single acceptance table names the actor, prerequisite, output,
  failure path, and test for every transition. Four seats and seven stages
  remain. All documents agree and mark planned enforcement as planned.

### 03. Authentication and safe reads

Depends on 02. Lead designs the shared boundary, browser credential transport,
CSRF/origin policy, safe errors, and unconfigured behavior before coding.

- [x] 03a, lead: enumerate all `forge/src/app/api/factory/*/route.ts` methods
  and approve authenticated/unauthenticated request examples for each.
- [x] 03b, lead: implement and obtain independent review of the shared guard.
  A qualified worker may then wire one route per approved ticket. No per-route auth copies,
  browser-exposed engine credentials, or committed environment files.
- [x] 03c, independent tester: invalid/missing auth fails before any upstream
  request; valid auth preserves route contracts. Check browser refresh and
  mutations, cross-origin rejection as specified, and redacted errors.
- Pass: every API method is covered, including memory; no configured provider
  means no external memory requests. Provider implementation belongs to 08.

### 04. Engine contracts

Depends on 03. Start at `forge/src/lib/paperclip.ts`, `hermes.ts`, `runtime.ts`,
`api-contract.md`, and their route callers. Do not guess an upstream API.

- [x] 04a, lead: pin engine versions and attach authoritative request/response
  references. Approve minimal synthetic fixtures and expected normalized output.
- [x] 04b, worker: fix task labels, native priority, and Foreman assignment
  against those fixtures. Keep task input validation at the server boundary.
- [x] 04c, worker, separate ticket: map pipeline labels independently of issue
  status; derive pending gates from actual approval records, not text guesses.
- [ ] 04d, worker, separate ticket: represent failed/cancelled runs and partial
  engine outages correctly. A failed run without a finish time is not working.
- Pass: runnable request/normalization checks cover malformed responses, empty
  data, non-JSON errors, and one engine failing. No frozen runtime shape changes.

### 05. Law and skill bundles

Depends on 02 and 04. Read `skills/INDEX.md`, role charters, and current engine
skill APIs. Use the vendored contents and licenses; no second skill catalog.

- [ ] 05a, worker: produce an expected file/version manifest for each seat
  from approved assignments. Report absent files rather than inventing skills.
- [ ] 05b, worker: implement local bundle assembly/verification at a lead-named
  script path. Verify installed contents, not just an installer exit code.
- [ ] 05c, lead: verify effective instructions with fixture agents; remote
  installation remains blocked until owner-authorized access is supplied.
- Pass: two local runs produce identical bundles; tampered/missing skills fail;
  provenance and licenses remain intact. No runtime enforcement is claimed yet.

Phase exit: 02-05 accepted locally, security reviewed, outstanding live checks
explicitly listed. Lead authorizes Phase 2; no unattended work enabled.

## Phase 2: execution and accounting

All tickets are BLOCKED until Phase 1 acceptance. Lead must first choose how
the existing engines store durable transition IDs and concurrency claims.

### 06. Transitions and manual dispatch

- [ ] 06a, lead: turn the approved 02 table into transition inputs/results and
  persistence semantics. Specify failure recovery and what prevents two workers
  claiming the same job. Do not introduce a database without a demonstrated need.
- [ ] 06b, worker: implement one transition operation and table-driven checks
  in lead-named service/eval files. All callers use that operation.
- [ ] 06c, worker: implement one manual dispatcher tick using the approved
  priority order, dial restrictions, concurrency limit, and stall timeout.
- Pass: invalid transitions reject; repeated/concurrent ticks do not duplicate
  work; restart after a partially completed action recovers; stalls escalate
  with a reason. No timer or LLM-based scheduling is added.

### 07. Stable run identity

Depends on 06 and 04. Scope starts at `forge/src/lib/runtime.ts`, the two engine
clients, and status/runtime route callers.

- [ ] 07a, lead: approve job/agent/run ID relationships and precedence when
  engines disagree. Define unmatched and out-of-order run behavior.
- [ ] 07b, worker: join by approved IDs, retain engine provenance, and include
  Hermes runs. Keep the frozen `/api/factory/runtime` response compatible.
- Pass: same-name agents remain distinct; renamed agents retain their runs;
  delayed events and failed runs do not overwrite newer active state. Contract
  regression checks prove existing callers still receive the expected shape.

### 08. Memory and accounting

Depends on 06-07. Read `evals/metrics.md` and the generic memory route. Lead
chooses the user-selected provider contract and durable retry design first.

- [ ] 08a, worker: implement transition/run-close records against a synthetic
  provider fixture, using approved IDs, timestamps, and redaction rules.
- [ ] 08b, worker, separate ticket: ingest per-run token/cost values with
  explicit units, source, and missing-data state. Unknown cost is not zero.
- [ ] 08c, independent tester: retry after timeout and restart; duplicate
  events neither double-bill nor duplicate memory. Test provider outages.
- Pass: recorded behavior matches 02's writeback failure policy, totals
  reconcile to known fixture runs, and no private provider is bundled.

Phase exit: one synthetic manual sequence survives retry/restart, with stable
IDs and reconciled accounting. This is not the real-engine lap in Phase 5.

## Phase 3: gates and operational checks

Blocked until Phase 2. Lead owns authorization and evidence provenance design.

### 09. Enforced gates

- [ ] 09a, lead: specify evidence schema, trusted check/review sources, and
  binding to repository, issue, current commit, reviewer identity, and action.
- [ ] 09b, worker: implement one gate at a time in the lead-named shared gate
  service. Require nonempty successful checks, evidence, and current review.
- [ ] 09c, lead + tester: enforce reviewer independence and owner deployment
  approval server-side. A UI flag or supplied PASS string grants no authority.
- Pass: reject stale SHA, fabricated evidence/verdict, self-approval, unresolved
  findings, empty checks, and missing/replayed deployment approval. Verify a
  new commit invalidates prior approval. Remain at dial 1 with human merges.

### 10. Doctor and CI

Depends on 09. Scope starts at `evals/doctor.py`, `evals/`, and a lead-approved
CI file. Separate document lint from operational readiness.

- [ ] 10a, worker: expose deterministic gate checks and useful failure output;
  missing services and skipped checks must not appear as passes.
- [ ] 10b, independent tester: add negative/mutation checks for each gate,
  protected-file edits, zero discovered tests, and stale review evidence.
- Pass: each deliberately broken gate causes a nonzero check; restored code
  passes. Clean offline checkout can run fixture checks without credentials.

Phase exit: lead reviews the actual negative-test output and all security
paths. Green document lint alone cannot open Phase 4.

## Phase 4: UI and UX

Blocked until Phase 3 unless the owner explicitly approves an isolated pilot.
Use current HTML controls and components. Do not build a marketing landing page.

### 11. Usability repairs

- [ ] 11a, worker: trace `createTask` and all callers; fix the Work submission
  flow in `forge/src/app/work/page.tsx`. Clear pending state on every outcome,
  show an accessible error, retain failed inputs, and allow manual retry.
- [ ] 11b, worker, separate ticket: fix Work mobile overflow using existing
  layout patterns in `globals.css` and the affected page. No redesign yet.
- [ ] 11c, worker, one view at a time: labels, keyboard focus, loading, empty,
  error, and stale-data states. Do not present unreachable engines as healthy.
- Pass: browser checks cover success, structured rejection, network failure,
  invalid JSON, pending duplicate submission, and retry. At 390px and 1440px,
  controls/text do not overlap and the document has no horizontal overflow.

### 12. Jobs and approvals

Depends on 11 and 09. Lead supplies approved API examples and exact page paths.

- [ ] 12a, worker: add job details with stage history, assignment, runs, evidence,
  and cost from server records. Link into and back from Work without losing state.
- [ ] 12b, worker: add the seven-stage board with empty/error states; preserve
  unknown stages as explicit errors, not silently reassigned jobs.
- [ ] 12c, worker: approval controls show current evidence and submit to the
  guarded server operation. Rejection/stale approval refreshes the display.
- Pass: navigation and keyboard operation work; declined or stale gates remain
  blocked; no optimistic UI can bypass server authorization.

### 13. Agent lifecycle

Depends on 12, 04, and 05. Start at `forge/src/app/agents/page.tsx` and its API.
Lead must supply real mutation contracts before a worker builds forms.

- [ ] 13a, worker: create/edit configuration with server validation and budget
  limits. Do not expose engine secrets through form defaults or API responses.
- [ ] 13b, worker: assign approved skills and show verified effective versions.
- [ ] 13c, worker: evaluation, activation, and retirement with explicit pending,
  failed, and completed states. Lead defines treatment of active runs first.
- Pass: evaluation failure blocks activation; retiring agents retain history;
  failed mutations preserve inputs and do not falsely report success.

### 14. Color and limited Three.js

Depends on 11-13. Lead approves a small visual sample and asset locations first.

- [ ] 14a, worker: apply a colorful, readable palette to existing controls,
  navigation, and status indicators. Keep text/symbols alongside status color.
- [ ] 14b, worker: add at most two Three.js assets with subtle motion, using
  lead-approved dependencies/assets. No 3D factory simulation or 2D mode toggle.
- [ ] 14c, independent tester: capture desktop/mobile frames and canvas-pixel
  checks proving nonblank rendering and movement. Verify asset failure,
  reduced motion, WebGL failure, resize, and component cleanup.
- Pass: normal HTML controls remain usable without WebGL; animation does not
  overlap content, trap input, or run after unmount. Record actual rendering
  evidence, not only a successful JavaScript build.

Phase exit: core workflows pass real browser checks with fixture engines,
including failure paths. Owner reviews the modest visual scope before Phase 5.

## Phase 5: prove the factory

Blocked until Phase 4 acceptance and explicit access/deployment authorization.

### 15. One real manual lap

- [ ] 15a, lead + owner: select a small real issue, spending cap, engine access,
  target deployment, rollback method, and isolated execution resources.
- [ ] 15b, worker seats: execute only assigned steps at dial 1. Preserve issue,
  branch, PR, commit, run, evidence, memory, and accounting correlations.
- [ ] 15c, independent tester/reviewer: verify actual outcomes at every gate.
  Owner approves merge and deployment separately; record deployment/rollback proof.
- Pass: a real issue reaches the approved running revision with reconciled
  records. A runbook, mocked lap, or merged PR alone does not complete this task.

### 16. Polling and later autonomy

Depends on 15. Lead supplies approved interval, claims, retry limits, shutdown,
and observability behavior. Reuse the proven manual tick from 06.

- [ ] 16a, worker: add a thin polling wrapper with no new dispatch decisions.
- [ ] 16b, tester: overlapping polls, engine outage, restart, spending limit,
  shutdown, and dial restrictions fail safely without duplicate work.
- [ ] 16c, owner: consider any dial increase using the required lap evidence.
  No worker raises the dial; polling does not grant additional authority.
- Pass: the approved operating level is enforced and deployment stays human.
  Stop here; host integrations and terminal products need separate scope.
