# Task 02 acceptance rules

Status: owner-approved target policy. The owner approved these rules and the
Task 02 alignment edits on September 15, 2026. Runtime enforcement is planned,
not implemented. The checks below specify required behavior for later tasks;
they are not claims that those tests or gates currently exist.

The factory keeps four seats, Foreman, Builder, Tester, and Reviewer, and
seven stages: Intake, Architect, Context, Build, Cleanup, Review, and Ship.
The Foreman orchestrates. Seats submit outcomes. One shared transition action
is the sole state writer. The first governed run stays at dial 1. Owners
accept intake manually. Automatic triage starts only at dial 4 after separate
owner approval. No dial raises itself and no unattended scheduler runs.

## Acceptance table

| Stage | Actor | Entry requirement | Exit evidence | Failure path | Concrete acceptance check |
|---|---|---|---|---|---|
| Intake | Owner, with Foreman | An issue is submitted and within MISSION scope. At dial 1, the owner accepts it. | Accepted issue, scope decision, priority, and next action are recorded. Assigning a triage owner is not required for acceptance. | Reject with a reason or hold at Intake; no automatic intake at dial 1. | A fixture issue cannot advance until the owner accepts it. A dial 4 triage attempt fails without separate owner approval. |
| Architect | Foreman | Intake acceptance and a clear problem statement exist. | A plan splits work into units of at most 500 changed lines, names dependencies, and assigns each unit. | Return to Intake or `needs-human` with the ambiguity or sizing reason. | A fixture plan with one oversized unit is rejected; a plan with two bounded units records both owners. |
| Context | Foreman | An accepted unit has an architectural plan. | Each unit has a reachable source or SDK reference, or explicitly recorded authoritative documentation that is sufficient to verify the contract, plus supplied examples or fixtures. | Hold the unit or send it to `needs-human`; unresolved API contracts block Context. | A documented authoritative fallback that verifies the contract permits Builder dispatch. If neither it nor source/SDK evidence verifies the contract, Context fails. |
| Build | Builder | Context evidence is present. The Builder has a fresh worktree, branch, and exact unit scope. | Working diff, nonempty successful checks, and the Builder outcome are submitted to the transition action. | Return to Build with a named blocker. A blocked build over 2 hours or ambiguity goes to `needs-human`. | A fixture unit cannot exit Build with empty checks, a failing check, or changes outside its assigned scope. |
| Cleanup | Builder, with Tester validation | Build outcome is accepted and its checks pass. | Builder either records the final diff and successful checks after needed cleanup, or records that no cleanup is needed with the existing successful checks. Tester independently validates the final diff and outcome before Cleanup exit. | Return to Build with a cleanup or validation finding; unresolved ambiguity goes to `needs-human`. | A duplicated-mechanics fixture needs a cleanup diff and passing checks. A no-cleanup fixture exits with its documented rationale and existing green checks, without an extraction or second identical run. |
| Review | Reviewer | Cleanup exit is accepted. Tester proof and nonempty successful checks already exist, are attached, and bind to the reviewed commit before Review entry. | Reviewer uses OpenCodeReview delegation to review every changed file from both the reviewable and excluded lists, reads the current diff, judges the proof, issues PASS, and records zero skipped files and zero unresolved findings. | Missing, stale, empty, or failed proof returns to Builder. Reviewer findings return to Builder. After two fix attempts, go to `needs-human`. | Change the commit after Tester evidence: Review rejects it. A Reviewer cannot alter the diff or issue PASS without current evidence, 100% review coverage, zero skipped files, and zero unresolved findings. |
| Ship | Foreman, with two separate human approvals | Review PASS and all review evidence bind to the reviewed head. A merge or squash may produce another SHA, but the merge result must link to that head and reject changed or unreviewed content. | A human separately approves merge and deployment. The verified merge result is deployed, its revision is linked and verified, and rollback instructions pass an executable check. No production rollback is performed just to pass that check. | Hold Ship or send to `needs-human`; never merge or deploy on one approval, broken lineage, stale evidence, or an unavailable check. | A fixture with only merge approval cannot complete Ship. A different squash SHA passes only with verified reviewed-head lineage and unchanged reviewed content, both approvals, deployment verification, and executable rollback instructions. |

## Cross-stage rules

- The transition action validates the submitted outcome and records a pending
  transition identity. No logical stage advancement or next-seat dispatch
  occurs until transition memory is confirmed. Seats cannot write state
  directly, and a failed confirmation stays visible as pending.
- Offline viewing remains available without a memory provider.
- These rules do not solve atomicity, ordering, locking, idempotency, or
  restart recovery. Task 06 must define those mechanics and the durable
  pending transition record before implementation claims them.
- A retry repeats the same outcome against the same commit and transition
  identity. It cannot bypass a failed gate or create a second next-seat
  dispatch. Review fixes belong to the Builder, with at most two attempts.
- A failed review records named blockers and returns to Build. The Reviewer
  never fixes the diff. Missing or failed OpenCodeReview output leaves Review
  blocked; retry the same commit, then escalate with the failure reason. No
  substitute verdict grants Ship.
- Nobody approves a diff they authored or changed.
- At dial 1, Tester and Reviewer runs are manually initiated. They do not run
  from an unattended scheduler. A Build blocker open over 2 hours escalates
  with its blocker reason. Separately, any working state with no activity for
  4 hours escalates with its last output.
- Protected-rule edits require a separate owner-authorized change naming the
  exact files and intent, independent review, and owner approval. Ordinary
  agents cannot change the rules used to evaluate their own work.

## Source conflicts resolved by these rules

These historical references are pinned to base commit
`4ceffdfb77d4a558f5b686493921994f5b866748`, before the alignment edits.

- `factory/pipeline.md:7,16-17` assigns transition movement and Review/Ship
  exits inconsistently with `factory/roles/foreman.md:8-9,17`.
- Cleanup is a pipeline stage at `factory/pipeline.md:15`, but
  `factory/roles/builder.md:8,15` describes it as part of Build.
- Evidence timing conflicts across `factory/pipeline.md:16,45`,
  `docs/spec-v0.4.md:77`, and `factory/roles/tester.md:15`.
- Reviewer fix ownership is unclear at `factory/roles/reviewer.md:8` and
  `FACTORY-LAW.md:16`; Tester reports findings and does not fix at
  `factory/roles/tester.md:18`.
- Ship mixes merge and deployment at `factory/pipeline.md:17,21,49-50` and
  `factory/roles/foreman.md:9,17`.
- Memory is planned but unconfigured at `docs/spec-v0.4.md:20`; transition
  write-back is required at `docs/spec-v0.4.md:81` and `factory/pipeline.md:7`.
- Protected-rule amendment handling remains open at `FACTORY-LAW.md:34` and
  `docs/PROGRESS.md:107`.

The owner authorized this alignment in `FACTORY-LAW.md`, `docs/spec-v0.4.md`,
`factory/pipeline.md`, and all four role charters, plus reconciliation of
PROGRESS and WORK-PACKS with PR #1. This authorizes no merge, deployment,
engine connection, or change to AGENTS or MISSION. Independent PR review and
owner merge approval remain required. Intake record transport, memory
confirmation details, and Task 06 persistence/recovery are later design work.
