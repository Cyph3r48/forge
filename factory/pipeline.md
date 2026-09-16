# Factory Pipeline

The Software Factory company's planned state machine, dispatcher, gates, and
dial. One Paperclip company; four seats and seven states as issue labels.
The acceptance table in [docs/TASK-02-ACCEPTANCE.md](../docs/TASK-02-ACCEPTANCE.md)
is the source of truth. This document does not claim runtime enforcement.

## States

One Paperclip label represents each state. Seats submit outcomes to one shared
transition action, the sole state writer, coordinated by the Foreman. No
logical advancement or next-seat dispatch occurs before transition memory is
confirmed. A failed confirmation remains visible as pending.

| State | Label | Seat that works it | Exit gate | Failure path |
|---|---|---|---|---|
| Intake | `factory:intake` | Owner, coordinated by Foreman | owner accepts an actionable issue in MISSION scope; triage assignment is not required | rejected with reason or held at Intake |
| Architect | `factory:architect` | Foreman | split into PR-sized units (≤500 lines each), reusable code identified | units can't be made small → needs-human |
| Context | `factory:context` | Foreman | source/SDK reference, or recorded authoritative documentation sufficient to verify the contract, attached per unit | unresolved contract → `factory:needs-human` |
| Build | `factory:build` | Builder (parallel per unit, one worktree each) | minimal working unit, nonempty checks green | blocked over 2h or ambiguity → `factory:needs-human` |
| Cleanup | `factory:cleanup` | Builder, then Tester validates | final diff and checks, or documented no-cleanup-needed with existing successful checks; Tester validates independently | finding → Build; ambiguity → `factory:needs-human` |
| Review | `factory:review` | Reviewer | Tester proof and nonempty successful checks predate entry, bind to current head, and Reviewer records PASS plus Greptile 5/5 with zero unresolved | Builder fixes findings, max 2 attempts, then `factory:needs-human` |
| Ship | `factory:ship` | Foreman coordinates | separate human merge and deployment approvals, verified deployment, and executable rollback instructions | blocked or broken lineage → `factory:needs-human` |

`factory:needs-human` is the only escalation state. Everything lands there with a reason attached; nothing rots silently.

Ship completes only after verified deployment. A merge or squash may produce a
new SHA, so the Ship record links reviewed head → verified merge result →
deployed revision and rejects changed or unreviewed content. Rollback
instructions must be executable; no production rollback is required just to
pass that check.

## Dispatcher (planned, not implemented)

The planned dispatcher reads Paperclip labels and dispatches at most one thing
per seat per tick. No LLM decides what runs. At dial 1, intake is manual and
Tester and Reviewer runs are manually initiated; no unattended scheduler runs.

Fixed priority, in order, finish in-flight before starting new:

1. Fix a unit in `factory:needs-fix` (review feedback loop)
2. Advance a unit waiting in `factory:review`
3. Build the next highest-priority unit in `factory:context`
4. Triage untriaged issues in `factory:intake` (dial ≥ 4 only; below that, intake is human)

Stall reaping every tick: any unit in a working state with no activity for 4 hours → `factory:needs-human` with the last output attached. A dead lap must be visible, never parked.

Parallelism: independent units build concurrently, one worktree and one branch per unit per Builder, max 2 concurrent builds to start (`factory/config`, raise deliberately). Scope check before every build: open PRs' changed files skimmed; on overlap, stop and route to the Foreman.

## Gates (planned, not implemented)

Gates that can be code will be code. The current app does not enforce these
gates. A gate that is only a prompt instruction is a suggestion.

| Gate | Planned enforcement by | Kind |
|---|---|---|
| Unit is ≤500 changed lines | gate script on the PR | code |
| Tester evidence and nonempty checks before Review entry | planned gate script (evidence files present on the issue) | code |
| Review verdict = 5/5, zero unresolved | gate script parses the greploop output | code |
| App started (for product repos) | harness assertion `APP_STARTED` | code |
| Checks green (typecheck, tests) | CI / validate entrypoint | code |
| Merge | planned gate script after all above and separate human merge approval | code + human |
| Ship (deploy) | **separate human deployment approval — never automated** | human |
| Mission scope, law conflict, security judgment | the seats, per FACTORY-LAW | prompt, checked by the Reviewer |

Empty is not pass: gates count the checks that ran, not just the failures.

## Autonomy dial

Per company, one number, set by humans only (the Foreman never raises it). The dispatcher refuses actions above the dial.

| Level | What runs unattended |
|---|---|
| 0 | nothing; run each state by hand |
| 1 | owner accepts intake manually; work, Tester, and Reviewer runs are manually initiated; humans approve merge and deployment |
| 2 | + Tester and Reviewer run and post verdicts; human still merges |
| 3 | + merge is automatic when every code gate is green; **ship stays human** |
| 4 | + Foreman triages its own issues against MISSION; a scheduled regression files its own bugs |
| 5 | + the Foreman writes its own issues from MISSION |

Current operating level is 1. No automatic dial progression is allowed. Any
later automatic merge requires a separate owner-approved policy and evidence.

## Memory write-back points (planned)

| Point | What is written | Generator |
|---|---|---|
| Every state transition | what happened, what surprised the seat, the next seat's briefing | seat charters |
| Run close (any seat) | what was done, divergences from plan, challenges | system-execution-report |
| Architect close | which "small units" turned out not to be small | system-execution-report |
| Builder close | pitfalls hit on this codebase, primed for next time | system-execution-report |
| Reviewer close | verdict, false positives found, calibration notes | system-execution-report |
| Periodic (weekly) | process bugs, not code bugs: what the pipeline itself got wrong | system-evolution-review |

Offline viewing remains available without a memory provider. Governed stage
advancement waits for confirmed transition memory, with a pending identity and
no next-seat dispatch while pending. Atomicity and recovery are deferred to
Task 06.

## PR discipline (all seats)

At most 500 changed lines per PR — split rather than ship unreviewable. Never modify a test to make it pass. Never commit secrets or env files. One issue link per PR (`Fixes #N`). No opportunistic refactors. Rebase onto latest main before review; `--force-with-lease` only, only on your own branch.
