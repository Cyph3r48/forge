# Factory Pipeline

The Software Factory company's state machine, dispatcher, gates, and dial. One Paperclip company; four seats (charters in `factory/roles/`); seven states as issue labels. Governed by FACTORY-LAW.md.

## States

One Paperclip label per state, moved by the seat that owns the exit. Every transition writes the issue's memory lane (what happened, what surprised the seat, what the next seat should know).

| State | Label | Seat that works it | Exit gate | Failure path |
|---|---|---|---|---|
| Intake | `factory:intake` | Foreman | issue is actionable and in MISSION scope | rejected with reason, or `factory:needs-human` |
| Architect | `factory:architect` | Foreman | split into PR-sized units (≤500 lines each), reusable code identified | units can't be made small → needs-human |
| Context | `factory:context` | Foreman | real source/SDK references attached per unit (source-code-context) | reference unreachable → note and proceed with docs, never guess APIs silently |
| Build | `factory:build` | Builder (parallel per unit, one worktree each) | minimal working unit, checks green | blocked >2h or ambiguity → `factory:needs-human` |
| Cleanup | `factory:cleanup` | Builder | duplicated mechanics extracted, behavior unchanged | — |
| Review | `factory:review` | Tester then Reviewer | evidence attached + parsed 5/5 greploop verdict + PASS | ≤2 fix attempts, then needs-human with reason |
| Ship | `factory:ship` | Foreman | merged; summary of what changed, what was tested, what needs human judgment, sent to the owner | deploy blocked → needs-human |

`factory:needs-human` is the only escalation state. Everything lands there with a reason attached; nothing rots silently.

**Ship ends at deployed code, not a merged PR** — a factory whose merges never reach a user is a PR generator. Deployment strategy per product: blue-green (two instances, update standby, flip) when real users are served; for single-host internal tools, a systemd/Docker restart after the human approval is the proportionate version. The Ship summary names what was deployed, where, and how to roll it back.

## Dispatcher

Dumb on purpose: a script on a timer that reads Paperclip labels and dispatches at most one thing per seat per tick. **No LLM ever decides what runs** — a model asked "what work is pending?" invents work.

Fixed priority, in order, finish in-flight before starting new:

1. Fix a unit in `factory:needs-fix` (review feedback loop)
2. Advance a unit waiting in `factory:review`
3. Build the next highest-priority unit in `factory:context`
4. Triage untriaged issues in `factory:intake` (dial ≥ 4 only; below that, intake is human)

Stall reaping every tick: any unit in a working state with no activity for 4 hours → `factory:needs-human` with the last output attached. A dead lap must be visible, never parked.

Parallelism: independent units build concurrently, one worktree and one branch per unit per Builder, max 2 concurrent builds to start (`factory/config`, raise deliberately). Scope check before every build: open PRs' changed files skimmed; on overlap, stop and route to the Foreman.

## Gates

Gates that can be code are code. A gate that is only a prompt instruction is a suggestion.

| Gate | Enforced by | Kind |
|---|---|---|
| Unit is ≤500 changed lines | gate script on the PR | code |
| Evidence attached before review exits | gate script (evidence files present on the issue) | code |
| Review verdict = 5/5, zero unresolved | gate script parses the greploop output | code |
| App started (for product repos) | harness assertion `APP_STARTED` | code |
| Checks green (typecheck, tests) | CI / validate entrypoint | code |
| Merge | gate script after all above | code |
| Ship (deploy) | **human approval in Paperclip — never automated** | human |
| Mission scope, law conflict, security judgment | the seats, per FACTORY-LAW | prompt, checked by the Reviewer |

Empty is not pass: gates count the checks that ran, not just the failures.

## Autonomy dial

Per company, one number, set by humans only (the Foreman never raises it). The dispatcher refuses actions above the dial.

| Level | What runs unattended |
|---|---|
| 0 | nothing; run each state by hand |
| 1 | intake → units built → PRs open; human reviews and merges everything |
| 2 | + Tester and Reviewer run and post verdicts; human still merges |
| 3 | + merge is automatic when every code gate is green; **ship stays human** |
| 4 | + Foreman triages its own issues against MISSION; a scheduled regression files its own bugs |
| 5 | + the Foreman writes its own issues from MISSION |

**Target is 3.** Start the first hand lap at 1, raise to 2 after one green lap, to 3 after a week of clean merges. Each raise is a deliberate human act, recorded in the memory company lane with the evidence that earned it.

## memory write-back points

| Point | What is written | Generator |
|---|---|---|
| Every state transition | what happened, what surprised the seat, the next seat's briefing | seat charters |
| Run close (any seat) | what was done, divergences from plan, challenges | system-execution-report |
| Architect close | which "small units" turned out not to be small | system-execution-report |
| Builder close | pitfalls hit on this codebase, primed for next time | system-execution-report |
| Reviewer close | verdict, false positives found, calibration notes | system-execution-report |
| Periodic (weekly) | process bugs, not code bugs: what the pipeline itself got wrong | system-evolution-review |

## PR discipline (all seats)

At most 500 changed lines per PR — split rather than ship unreviewable. Never modify a test to make it pass. Never commit secrets or env files. One issue link per PR (`Fixes #N`). No opportunistic refactors. Rebase onto latest main before review; `--force-with-lease` only, only on your own branch.
