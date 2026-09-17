# Orchestrator takeover

Use this same file with 5.6 Sol, GLM5.3, or another capable lead model, and any qualified smaller worker. These are responsibilities, not model capability claims. Read this file once, then operate
from the current task and affected source. The owner is ending the prior session
because of usage limits; do not start another task in that session.

## Resume without losing the reviewed work

1. Read AGENTS.md, [PROGRESS.md](PROGRESS.md), [TASK-02-ACCEPTANCE.md](TASK-02-ACCEPTANCE.md),
   and the next section of [WORK-PACKS.md](WORK-PACKS.md). The latter is the
   existing phase-by-phase worker list; do not generate a second roadmap.
2. The distributable repository is private `Cyph3r48/forge`. Never publish the
   original workspace history. Its clean publishing checkout is
   `.artifacts/forge-publish-0915/` in the original workspace.
3. The current lead checkout is `.worktrees/task03-auth-lead-0916/`, branch
   `agent/task03-auth-lead-0916`. It contains Task 03 on top of the Task 02
   branch; the reviewed implementation commit is `14079bd`. Fetch and inspect
   open PRs, base branches, exact heads, and local status before choosing a new base.
4. PR #1 is https://github.com/Cyph3r48/forge/pull/1 and Task 02 is PR #2.
   Task 03 is https://github.com/Cyph3r48/forge/pull/3, stacked on PR #2. Do not
   merge any PR without owner authorization or lose pending changes by blindly
   restarting on main.
5. Start each new task/agent in its own clean worktree from origin/main. If
   required changes are still in an open PR, arrange the dependent branch
   explicitly with the owner. Never reuse another agent's uncommitted work.

Task 03 adds one bearer-token boundary at `forge/src/proxy.ts`, per-tab browser
token transport, origin checks for writes, and a synthetic runtime check. A
separate Tester passed every nonvisual outcome, and independent security review
ended with zero actionable findings. The lead inspected local before/after PNGs;
0x0.st had disabled uploads, so they were not attached through that host.

## Authority and responsibilities

- The lead owns architecture, contract research, task sizing, security design,
  integration, and review. If the lead authors or fixes a diff, another reviewer
  must judge it. A second prompt in the same writer context is not independent review.
- The worker implements only a bounded, READY ticket. It does not choose APIs,
  security policy, persistence/concurrency designs, dependencies, or wider scope.
  Route uncertainty to the lead; route owner decisions back to the human.
- Tester checks outcomes independently; Reviewer judges the exact current diff.
  Builder makes fixes. Reviewer cannot approve its own changes. Keep these roles
  separate even when one model family fills multiple seats in separate contexts.
- The owner approved Task 02's rules and specific law/spec/pipeline/charter edits,
  plus progress/task-pack reconciliation. This is not future blanket permission
  to amend protected rules. No merge, deployment, live engines, or dial raise is authorized.
- Keep four seats, seven stages, dial 1, provider-neutral memory, Next.js/React/
  TypeScript, normal HTML controls, and the limited Three.js scope. No later phase yet.

## First task in the next session

Start Task 04a only after confirming the stacked PR heads and Task 03 checks.
Do not repeat the route inventory, auth review, or completed synthetic tests.

- Pin authoritative Paperclip and Hermes versions and request/response sources.
- Approve small versioned fixtures for malformed data, empty data, non-JSON
  errors, and one engine failing. Do not use personal engines.
- Split labels, native priority, Foreman assignment, pipeline-state mapping,
  and runtime failure reporting into separate tickets after contracts are pinned.
- Preserve the frozen runtime response shape and the shared auth boundary.
- Treat the inventory findings about hardcoded `source: "live"`, silent engine
  fallbacks, duplicate run reads, and the guessed create-issue body as Task 04
  inputs. Do not fix them without authoritative contracts.

## Assignment template

Give the worker one short ticket with: task ID; exact base SHA and assigned
worktree/branch; objective; writable files; explicit exclusions; supplied source
contracts and input/output examples; acceptance checks; allowed commands;
time/usage cap; stop conditions; and required handoff. Mark unresolved decisions
BLOCKED. Default to one worker and a 15-minute first pass; adjust explicitly.
At most two correction attempts, then return the task to the lead.

Handoff requires exact SHA, changed paths, command results and exit codes,
before/after evidence, limitations, and next dependency. Lead checks the diff
and reruns relevant assertions before acceptance. Unknown cost stays unknown.

## Tools and usage discipline

If inside Herdr, verify `HERDR_ENV=1`, read its skill, and rediscover pane IDs
with `herdr agent list`. Inspect the target before prompting. Do not trust old
pane IDs or assume a replacement model shares this session. Use explicit panes,
preserve focus, and never answer another agent's approval dialog without the
required authorization. Without Herdr, the same ticket can be pasted manually.

The previous environment had no `gh` binary; its GitHub connector could not see
this private repository. Git fetch/push worked with existing credentials, and
authenticated GitHub API calls worked. Recheck availability, use only authorized
credentials, and never print them or copy them into handoffs.

Keep outputs targeted: search names first, read only relevant tool schemas and
file sections, and avoid whole-session transcripts. Have workers report concise
results. Do not repeatedly re-fetch or re-audit evidence the lead just verified.
Measure total lead plus worker effort; cheaper worker tokens do not guarantee savings.

Run checks listed in PROGRESS for the actual change. Docs-only work needs doctor,
links, consistency, and diff checks. Code needs the relevant build/typecheck and
one meaningful regression check. No new dependency or broad test suite merely
to support a tiny change. Stop after the assigned task and update the handoff.
