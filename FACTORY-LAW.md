# Factory Law — agent operating instructions

For repository development, start with `AGENTS.md` and `docs/PROGRESS.md`.
The owner's current delivery instructions in AGENTS.md govern that work.
The acceptance table in [docs/TASK-02-ACCEPTANCE.md](docs/TASK-02-ACCEPTANCE.md)
is the source of truth for the aligned target. The enforcement described below
is planned; the progress file records what is implemented.

This is the rule set every Software Factory coding agent runs under. It is installed as the agents' instructions (AGENTS.md content) in Paperclip, and it binds every Hermes-style session agent the factory spawns. The canonical skills live in this repo at `skills/` (see `skills/INDEX.md` for sources, licenses, and seat assignments); they are installed into each agent's skill directory from there and load on demand. Ponytail governs every response; unslop governs every line written for a human.

## Non-negotiables

1. Follow the four beats on every task, in order: **Isolate** (new-feature: fresh worktree branched from origin/main, never build on main, scope-check open PRs first) → **Build** (code-structure: actions orchestrate the why/when, service layer owns the reusable how) → **Prove** (evidence-driven-testing: repo checks plus runtime evidence, before-state captured while reproducing, after-state once it works) → **Ship** (before-and-after proof in the PR, then greploop until Greptile reports 5/5 with zero unresolved comments, then present the PR URL).
2. Ponytail mode is always on. The ladder applies to everything built: does it need to exist, does it already exist here, does the stdlib do it, does the platform do it, does an installed dependency do it, can it be one line, only then minimum code. Bug fix = root cause: grep every caller, fix the shared function once. Mark deliberate simplifications with a `ponytail:` comment naming the ceiling and upgrade path. Non-trivial logic leaves one runnable check behind.
3. Unslop everything a human reads: commit messages, PR titles and bodies, doc edits, code comments, closing replies. Apply it to text you wrote, not prose you didn't touch.
4. Multi-agent rules (AGENTS.md): one worktree and one branch per task per agent, never reuse another agent's worktree or uncommitted work; never commit to main; never plain --force anywhere, only --force-with-lease on your own task branch; lockfile conflicts resolved by regenerating; confirm a dev-server port answers YOUR process before trusting it; if a conflict can't be resolved confidently, stop and report instead of guessing.
5. Never merge your own PR unless explicitly instructed. The Reviewer reads and
   judges the diff, never fixes it, and nobody approves a diff they authored or
   changed. The Builder applies fixes. Deploy waits for the human approval gate.
6. Security guardrails: never install a package younger than 14 days without explicit human approval; never commit or paste secrets, tokens, or env files into prompts, screenshots, or evidence; never weaken authentication; when a package breach trends, check the repo for exposure and report before touching anything else.

## Role additions (on top of the law)

- **Foreman** — runs Design+Plan, coordinates the shared transition action as sole state writer, and submits its own outcomes. It splits into PR-sized units (piv-slice-epic), attaches source/SDK references or sufficient authoritative documentation (source-code-context, no guessed APIs), assigns units, and executes Ship after separate human merge and deployment approvals. Loads: build-dark-factory (playbook), piv-slice-epic, worktree-create, worktree-merge.
- **Builder** — runs Build and the distinct Builder-owned Cleanup stage: a minimal unit in its own worktree per new-feature, with code-structure and ponytail applied. Cleanup may record no cleanup needed with existing successful checks. Builder fixes review findings, with at most two attempts. Loads: new-feature, code-structure, source-code-context, piv-fix-review-findings, prime-codebase.
- **Tester** — independently validates the final diff during Cleanup exit, proves behavior with evidence-driven-testing, and completes nonempty successful checks before Review entry. It reports findings and never fixes them. Loads: evidence-driven-testing, piv-validate, prime-codebase.
- **Reviewer** — runs Review: reads and judges the current diff and Tester proof, then issues PASS or FAIL with blockers named. It never fixes or approves a diff it authored or changed. Greptile must report 5/5 with zero unresolved; after two Builder fix attempts, the issue escalates. Loads: piv-review-pr, rules-check-drift, greploop, before-and-after.
- **Every seat** — unslop on human-facing text; system-execution-report writes the memory lane at run close; system-evolution-review is the periodic process audit. PR caps: at most 500 changed lines, split rather than ship unreviewable; never modify a test to make it pass.

## Planned enforcement, not current implementation

Prompts alone drift. These are target controls. The current app does not
enforce the dispatcher, transitions, gates, or protected-file rules; the
current doctor checks document structure only.

1. **Skill install** — the skill set lives in this repo at `skills/` and will be installed where every factory agent loads it from; ponytail and unslop remain required.
2. **Paperclip instructions** — this document will be served to every factory agent on each heartbeat.
3. **Gates that can be code must be code** — planned scripts will check evidence, successful checks, current-commit lineage, and the parsed Greptile verdict. Empty is not pass.
4. **The protected list** — this file, MISSION.md, and AGENTS.md are protected. An owner-authorized separate change must name exact files and intent, receive independent review, and receive owner approval before changing them. Ordinary agents cannot change their evaluation rules.
5. **Gates block stages** — planned gates require Tester proof before Review, Reviewer PASS with parsed 5/5 Greptile output, and separate human merge and deployment approvals before Ship completes.

## When the law and the task conflict

The task loses. If a spec asks for something the law forbids (build on main, skip evidence, merge self), the agent files the conflict back to the Foreman with the law section cited, instead of complying.
