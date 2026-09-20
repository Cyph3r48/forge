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
3. The current lead checkout is `.worktrees/task02-lead-0915/`, branch
   `agent/task02-lead-0915`. It includes PR #1's task packs and the Task 02
   alignment. These changes may not be on main. Fetch and inspect open PRs,
   base branches, exact heads, and local status before choosing a new base.
4. PR #1 is https://github.com/Cyph3r48/forge/pull/1. The alignment PR is
   stacked on its branch until that PR is merged. Do not merge either without
   owner authorization. Do not lose pending changes by blindly restarting on main.
5. Start each new task/agent in its own clean worktree from origin/main. If
   required changes are still in an open PR, arrange the dependent branch
   explicitly with the owner. Never reuse another agent's uncommitted work.

Task 02 is document alignment, not a working dispatcher or gate system. The
recorded checks prove structure and consistency only. Greptile gave no response
on PR #1 during the earlier ten-minute wait. Missing review is pending, never
5/5; investigate repository integration/access before repeating long waits.

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

Start Task 03a only after confirming the Task 02 handoff and any pending review
limitations. Do not repeat the full repository audit or the completed Luna trial.
The lead must design authentication before authorizing security code.

- Inventory `forge/src/app/api/factory/{agents,connections,memory,runtime,status,tasks}/route.ts`.
  Baseline is six GET methods and tasks POST, seven methods total. Verify this
  against the actual checkout; inventory drift is a finding, not permission to guess.
- Trace callers through `forge/src/lib/client.ts`, route handlers, and engine
  clients. Include the generic unconfigured memory route. Current API access
  lacks authentication; do not connect personal engines while reproducing it.
- Decide shared auth placement, browser credential transport, missing server
  configuration behavior, safe errors, and CSRF/origin rules. Keep engine secrets
  server-side. Document request/response examples before assigning route edits.
- Preserve offline viewing without a memory provider. That does not grant
  anonymous access to protected APIs. No user-account system or new provider is requested.
- Require unauthorized requests to fail before upstream work. Check missing,
  invalid, and valid credentials; configured/unconfigured fixtures; cross-origin
  mutation policy; browser refresh; redacted errors; and all seven methods.
- Lead implements the shared boundary and obtains independent security review.
  Use the worker eligibility table in WORK-PACKS before assigning mechanical wiring.
  Authentication is not the first coding test for a replacement worker.

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
