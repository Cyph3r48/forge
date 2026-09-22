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
3. The current lead checkout is `.worktrees/task04b-task-create-0920/`, branch
   `agent/task04b-task-create-0920`, stacked on Task 04a PR #5. Resume from the
   branch's current clean head.
4. The owner authorized merging PRs #1 through #4. They landed on `main` in
   dependency order on September 20 after GitHub reported each exact head clean
   and mergeable. Do not merge later PRs or deploy without fresh authorization.
5. Start each new task/agent in its own clean worktree from origin/main. If
   required changes are still in an open PR, arrange the dependent branch
   explicitly with the owner. Never reuse another agent's uncommitted work.

Task 03 adds one bearer-token boundary at `forge/src/proxy.ts`, per-tab browser
token transport, origin checks for writes, and a synthetic runtime check. A
separate Tester passed every nonvisual outcome, and independent security review
ended with zero actionable findings. The lead inspected local before/after PNGs;
0x0.st had disabled uploads, so they were not attached through that host.

Greptile was never installed. The owner chose local OpenCodeReview delegation
instead and authorized the protected workflow edits on a branch stacked over PR
#3. The host has verified `ocr` v1.10.0 in `~/.local/bin`, and Codex has the
pinned upstream `open-code-review-delegate` skill for future sessions. The
repository contains its shorter factory-specific delegation skill. No OCR LLM
endpoint or GitHub Action is set.
A separate Tester passed migration head `6827e3f`. An independent read-only
Reviewer inspected all 14 files, including OCR-excluded Markdown, and reported
100% coverage, zero skipped files, and zero findings. PR #4 is merged.

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
- The owner separately approved replacing Greptile with OpenCodeReview delegation
  and stacking that change on PR #3. Further protected-rule changes still require
  explicit owner authorization.
- Keep four seats, seven stages, dial 1, provider-neutral memory, Next.js/React/
  TypeScript, normal HTML controls, and the limited Three.js scope. No later phase yet.

## Current task

Tasks 04a, 04b, and 04c are complete locally. Do not repeat the contract
research, task-creation fix, pipeline-state mapping, route inventory, auth
review, or completed tests.

- Use [ENGINE-CONTRACTS.md](ENGINE-CONTRACTS.md) and the two versioned fixtures.
- Publish Task 04c as a dependent PR on Task 04b, then create a unique
  dependent worktree for Task 04d.
- Fix terminal run classification and partial engine failures without changing
  the frozen runtime response shape.
- Add malformed JSON, empty data, non-JSON error, and one-engine-down cases to
  the runnable contract check. Do not use personal engines.
- Preserve the frozen runtime response shape and the shared auth boundary.
- Treat the inventory findings about hardcoded `source: "live"`, silent engine
  fallbacks, and duplicate run reads as Task 04 inputs. Do not fix them without
  authoritative contracts.

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
