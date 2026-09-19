# Project progress and agent handoff

Updated September 18, 2026. Start here, then read `docs/spec-v0.4.md` and
the code for the assigned task. This file records project work only. Do not
add personal notes, credentials, or deployed host details.

## Current position

Phase 1 is in progress. Task 01, local repository preparation, is complete.
Tasks 02 and 03 are complete locally. Task 03 is open as PR #3. OpenCodeReview
delegation now replaces the unavailable Greptile service for independent review
in stacked PR #4: https://github.com/Cyph3r48/forge/pull/4.
Task 04's engine-contract research is next. No UI redesign, dispatcher, or
real-engine factory lap has been completed.
The bundled memory provider has been removed from code, API fields, UI, and
documentation. The Memory page is now a generic unconfigured view. The Forge is published at https://github.com/Cyph3r48/forge as a private
repository. Its initial source commit is `4c95cdf` and has no parent history.

The Forge should both produce software and manage the agents that build it.
Keep Next.js, React, and TypeScript. Paperclip owns company/work records;
Hermes owns execution. Memory integration is planned with a user-selected
provider; no memory client, credentials, or endpoints are bundled.
The current app mostly displays engine data and can file tasks. Written
pipeline rules are requirements, not implemented enforcement.

## Owner decisions

- Work phase by phase. Finish each task with evidence and a clear handoff.
- Local work does not depend on GitHub. Branch from local main if origin is
  absent. The owner has now authorized creating a GitHub repository and
  publishing reviewed source. Deployment and PR merging still need authorization.
- Commit source and essential documentation only. Keep the factory law,
  role definitions, required skills, licenses, and build/check instructions.
  Exclude personal documents, all environment files, credentials, private
  connection settings, build output, and historical personal material.
- Keep memory provider-neutral. Do not bundle a private provider or establish
  personal engine connections during local development.
- UI should be colorful and straightforward, with a couple of Three.js
  assets and subtle effects. Keep normal HTML controls, responsive layouts,
  keyboard access, and reduced motion. No separate 2D mode or factory simulation.
- Skills are the factory's operating instructions. Runtime gates must verify
  their required outcomes; prompts alone cannot establish a passing gate.
- The owner approved [Task 02's rules](TASK-02-ACCEPTANCE.md) and edits to the
  law, spec, pipeline, and four role charters, plus reconciliation with PR #1.
  This is policy approval, not proof of runtime enforcement or merge permission.
- The owner approved replacing Greptile with local OpenCodeReview delegation and
  stacking that protected-rule amendment on PR #3. Reviews use the local host
  agent; no separate OCR LLM endpoint or GitHub Action is configured.

## Completed work

| Work | Result |
|---|---|
| Spec and implementation review | Reviewed v0.4, app routes/clients, roles, pipeline, doctor, and the separate Wave 4 branch |
| Baseline runtime evidence | Captured local synthetic-engine probes and desktop/mobile screenshots; no production engines contacted |
| Requested skills | Installed all seven from michaelshimeles/skills at revision `513f8a24aae6383b00356fa285144b1bc3730dc1`; the existing 21 vendored files match |
| Local source cleanup | Commit `1b5f9cc` on `agent/repo-hygiene-0914`; removed `.env.example`, extended ignore rules, and documented offline startup |
| Unconfigured client fix | Added shared Paperclip guards and `evals/unconfigured-clients.mjs`; requests went from five before the fix to zero afterward |
| Memory provider removal | Commit `47f63c9` removed the provider client, configuration names, health badges, and provider-specific documentation; the generic route makes no external requests |
| Private GitHub repository | Published `Cyph3r48/forge`, default branch main, from root commit `4c95cdf`; verified private visibility and no parent history |
| Phase task packs and Luna pilot | Tasks 02-16 split into bounded assignments; 02a accepted after one correction round, then a separate high-reasoning handoff review. See [PILOT-02A.md](PILOT-02A.md); coding ability and quota savings remain unproven |
| Task 02 alignment | Owner-approved acceptance table; law, spec, pipeline, four charters, and skill seat mapping aligned. Luna implemented the seven governing-file edits; lead reviewed and corrected remaining wording. Structural and consistency checks pass; runtime gates remain unproven |
| Task 03 authentication | Shared Next.js proxy protects all seven factory methods with one bearer token; browser session storage supports refresh, cross-origin writes fail before routes, missing server auth fails closed, and unconfigured memory stays provider-neutral. Synthetic runtime checks, separate Tester, and independent security review passed with zero actionable findings |
| Local review provider | Commits `191af96` and `447f9ec` deactivated both Greptile skills and assigned OpenCodeReview delegation v1.10.0, pinned by tag and commit. The verified local CLI enumerated the exact range without an OCR model configuration. An independent Reviewer inspected final head `447f9ec`, covering all 14 changed files with zero skipped files, zero unresolved findings, and PASS. PR #4 is open, unmerged, and stacked on PR #3 |
| Clean distributable baseline | Root commit `283a5e9` in a separate local source copy; 133 audited files, no original history and no remote |

The six delivery skills are before-and-after, code-structure,
evidence-driven-testing, new-feature, open-code-review-delegate, and unslop.
The repository contains 20 vendored skill folders in total. The two legacy
Greptile folders remain unassigned so their bulk deletion can be reviewed
separately without breaking the 500-line PR cap. Installation
into remote factory agents and verification of their effective instructions
are still pending.

## Resume procedure

1. Read `AGENTS.md` and this file. Check `git status --short --branch` and
   `git worktree list` before changing anything.
2. For published work, create a unique task/agent worktree from the clean
   GitHub repository's latest `origin/main`. With no remote, local work can
   branch from local `main`; that does not make private history publishable.
   Never modify another agent's worktree or uncommitted work.
3. Read [WORK-PACKS.md](WORK-PACKS.md) for the per-phase assignments and exact
   worktree procedure. Read [ORCHESTRATOR-HANDOFF.md](ORCHESTRATOR-HANDOFF.md)
   for the Sol/GLM-compatible takeover and worker limits. Continue with Task 04a
   after checking pending PRs #1 through #4 and Task 03 evidence.
   [PILOT-02A.md](PILOT-02A.md) records the earlier reading trial.
4. Use isolated fixtures for engine behavior. Do not connect live services or
   raise the autonomy dial. Engine access is not required for documentation
   alignment or local authentication work.
5. Record changed files, checks, failures, decisions, and the next task here.
   Keep raw evidence in ignored artifacts and secrets outside the repository.

Worker assignments are one bounded subtask at a time. The coordinating lead
updates this ledger after independent review; workers return their evidence
and handoff without competing edits here. Phase 2 and later remain blocked.
The phase task packs do not grant authority beyond the owner's recorded choices.

In the original workspace, the detailed review and screenshots are in
`.artifacts/project-review-2026-09-14/`. They are optional local evidence,
not required to resume from a clean clone. The publishing checkout is
`.artifacts/forge-publish-0915/`, connected to the private GitHub repository.
The older `.artifacts/forge-source-0914/` is superseded and must not be pushed.
Do not push the original repository history: it contains old personal material.
Use a fresh branch in the publishing checkout or a fresh GitHub clone for
future PRs; transfer only reviewed changes from the original workspace.

The existing `agent/wave4-flash` branch adds only a company definition and
first-lap runbook. It was read, not merged or changed. Do not mistake that
runbook for an executed lap. GitHub lookup did not establish an accessible
Forge repository before initialization. The private repository has now been
created and its initial source pushed. No PR review or deployment was performed.
Future work should use normal branches and PRs on that clean history. Do not
replace or force-push the published history. No deployment is authorized.

## Task 04: next action

Pin authoritative Paperclip and Hermes versions and request/response contracts
before changing mappings. Use versioned synthetic fixtures for malformed data,
empty data, non-JSON errors, and one-engine failure. Then split labels, priority,
assignment, pipeline-state mapping, and runtime failure reporting into separate
reviewable tickets. Do not contact personal engines or guess an upstream API.

## Phase checklist

### Phase 1: foundations

- [x] 01. Prepare isolated local commits and a source copy without private history.
- [x] 02. Align spec, rules, role boundaries, and acceptance checks locally; PR review pending.
- [x] 03. Add shared Forge authentication and safe memory access.
- [ ] 04. Verify engine contracts; fix labels, priority, assignment, and failure reporting using versioned fixtures. Live verification needs separately authorized access.
- [ ] 05. Make law/skill bundle installation repeatable and verify effective versions. Remote installation needs separately authorized access.

### Phase 2: execution and accounting

- [ ] 06. Implement guarded transitions and a deterministic manual dispatcher, including repeat/restart safety and stall escalation.
- [ ] 07. Correlate jobs, agents, and Hermes runs by stable IDs; preserve the frozen runtime response contract.
- [ ] 08. Record transition memory and per-run tokens/cost with explicit retry and missing-data behavior.

### Phase 3: gates and operational checks

- [ ] 09. Enforce evidence, checks, current-commit review, reviewer independence, and owner deployment approval.
- [ ] 10. Extend doctor/CI to prove gates reject invalid cases, including empty tests and protected-file changes.

### Phase 4: UI and UX

- [ ] 11. Fix mobile layout, form errors, labels, focus, loading, and stale-data states.
- [ ] 12. Add job details, the stage board, and evidence-backed approval interactions.
- [ ] 13. Add agent creation, configuration, skill assignment, evaluation, activation, and retirement.
- [ ] 14. Add color, at most two Three.js assets, and subtle effects; verify desktop/mobile rendering, reduced motion, and asset failure without a separate 2D mode.

### Phase 5: prove the factory

- [ ] 15. Complete a real lap at dial 1, from issue to owner-approved deployment, retaining the evidence, memory, and cost records.
- [ ] 16. Add polling only after the manual lap. Raise autonomy only on owner approval and the required evidence.

Do not start a later phase merely to make the app appear more complete.
There is no scheduled dispatcher or approved unattended operation yet.

## Known failures still open

- Pipeline labels are mistaken for issue status; gates are inferred rather
  than read from actual approvals. Task creation guesses the upstream shape
  and omits native priority and Foreman assignment.
- Live/Runtime omit Hermes runs; a failed run without a finish timestamp can
  appear working. Runtime joins by display name can conflate agents.
- Memory integration, transition write-back, and per-run accounting are absent.
- Failed task submission leaves Filing... disabled with no visible error.
- The Work page measured 641px wide in a 390px viewport.
- Doctor checks document structure only. No executable dispatcher or gates
  enforce the factory definitions, and no completed lap has been demonstrated.

## Commands and evidence

Validated with Node.js 24.21.0. From `forge/`:

```bash
npm ci
npm run build
./node_modules/.bin/tsc --noEmit --incremental false
npm run dev -- --hostname 127.0.0.1
```

From the repository root after installing dependencies:

```bash
python3 evals/doctor.py
node evals/unconfigured-clients.mjs
node evals/auth-boundary.mjs
git diff --check
```

The cleanup build passed. Doctor reported five passes. The unconfigured
client check passed with zero requests. The earlier review visited all seven
pages with synthetic data and reproduced the failures listed above. No live
integration, independent PR verdict, or deployment is proven by those checks.

The provider-removal build and client check also passed. Browser checks
confirmed the generic memory response and removal of the provider from Status,
Live, and Connections. Desktop/mobile before-and-after captures are retained
locally in `.artifacts/memory-removal-0915/`, outside published source.

Task 03 changed anonymous access from `200` on the generic memory route to a
token prompt and `401` before route execution. `evals/auth-boundary.mjs` passed
all seven methods, browser refresh and 401 cleanup, missing server auth,
cross-origin writes, valid contracts, and zero unauthorized upstream calls.
The separate Tester passed every nonvisual outcome. The lead inspected the
settled before/after PNGs in `.artifacts/task03-auth-0916/`; the public upload
host was unavailable, so the images remain local. Independent security review
ended with zero actionable findings. No live engine, merge, or deployment ran.

For a docs-only handoff, check links, consistency, doctor, and the diff.
Do not repeat the full build unless application code or build inputs change.

The earlier Task 02a handoff passed doctor with five passes, local Markdown
link checks, and `git diff --check`. Both Luna worker checkouts remained clean.
Before: no bounded phase assignments in source and an interrupted pilot handoff.
After: per-phase assignments, a reviewed pilot record, and 02b identified as next.
No application code, governing policy, live integration, merge, or deployment
changed. Independent review acceptance is pending and must not be inferred from
these checks.
