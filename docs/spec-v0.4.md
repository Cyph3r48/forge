# The Forge — Spec v0.4

Current implementation and the phase checklist live in [PROGRESS.md](PROGRESS.md).
The aligned Task 02 target is in [TASK-02-ACCEPTANCE.md](TASK-02-ACCEPTANCE.md).
The owner has narrowed the UI direction to a colorful conventional interface
with a couple of Three.js assets and subtle effects, with no separate 2D mode.
Work proceeds one phase at a time. This spec describes the target system;
it does not establish that the factory has completed a working lap.

September 2026 · Supersedes v0.3. Changes: the control-plane app is built **stand-alone first** (not as an OS2 page first), the runtime layer is **derived, not adopted**, FACTORY-LAW governs the factory, and the dark-factory disciplines (coleam00) are folded in. v0.1's software-factory roles, v0.2's two-factories frame, v0.3's three-engine split and UI layout all carry forward.

**Name: The Forge.** The Forge is the app. The **Factory** stays the Paperclip company it runs.

## 1. What this is

One app that wraps the three engines into a functional whole: create agents, give them work, watch them run, read their memory, approve gates. The Software Factory is not a separate system; it is one Paperclip company this app drives, governed by FACTORY-LAW.md. Any host OS can later add a thin page that consumes this app's API.

- **Paperclip** (org layer) — who exists: agents, roles, heartbeats, issues, approval gates, spend. API at `:3100`.
- **Hermes** (intelligence layer) — what gets done: sessions, runs, tools, subagents. API at `:8642`.
- **Runtime seam** — where agents live. v1 derives state from the engines (§4); no new engine is adopted.
- **Memory provider** — planned integration for transition records and calibration. No provider is bundled; each installation chooses its own.

The engines do not compete and the app does not replace any of them. It is the control plane: read, write, launch, approve, and measure across all three.

## 2. The app (v1)

Stack: Next.js + React + TypeScript. Stateless at first; the engines own the state. Bearer-token auth, one token in env. Deployed on your own host on port **3400**, beside the engines it wraps — Paperclip at `localhost:3100` (a board token you mint) and Hermes at `localhost:8642`. Development happens against stubs; deployment is one systemd unit (`forge/forge.service`, parameterized by `FORGE_BIND_HOST`/`FORGE_PORT` in the `.env`). See `docs/SETUP.md`.

**Zones** (sidebar, from v0.3, unchanged):

| Zone | Backed by | New code |
|---|---|---|
| Agents | Paperclip agents, budgets, heartbeats | read/write client |
| Work | Paperclip issues + task launcher | client + launcher |
| Live | Paperclip runs + Hermes runs, derived states | aggregation |
| Memory | User-selected provider, planned | Generic unconfigured view; adapter pending |
| Connections | hermesMcp + connections libs | compose, no new state |
| Runtime | derived agent states (§4) | the one frozen interface |

**API routes** (all server-side fetch, no CORS):

- `GET /api/factory/agents` — roster + spend + state, merged from Paperclip and Hermes
- `POST /api/factory/tasks` — file an issue in the Software Factory company with the pipeline labels
- `GET /api/factory/status` — one snapshot: agents, issues by state, live runs, gates pending
- `GET /api/factory/runtime` — **frozen interface**: per-agent `{state: working|blocked|idle|done, source, since}`. Backing today: derived from Paperclip heartbeat-runs + Hermes runs. Backing later: a terminal layer, swapped in without changing this route's shape.

**Reuse, don't rebuild** — port from OS2 as thin server libs: `hermesApi.ts` (sessions/runs/skills/toolsets), the Paperclip client pattern from `api/paperclip/overview/route.ts`, `connections.ts`, `hermesMcp.ts`. Open Design skin so it matches the OS2 line.

**Deliberately not built in v1:** a database (add only when a metric needs history a file can't hold), user accounts, any host-OS integration page (Wave 5, a thin consumer of this app's API), an interactive terminal layer (Phase 5).

## 3. The runtime decision (the herdr question, closed for v1)

Nothing is adopted. Working/blocked/idle/done is **derived**: a Paperclip heartbeat-run in flight = working; a run whose latest output asks a question or waits on a gate = blocked; a finished run = done; no run = idle. The day watching a builder's live terminal becomes a real need (Phase 5), either adopt herdr or build a thin in-app tmux layer behind the same `/api/factory/runtime` route. The UI never knows the difference, so the decision costs nothing to defer.

## 4. The Factory — one company, four seats, seven states

Target governance: **FACTORY-LAW.md** is intended for installation as the
company's AGENTS.md content and serving on every heartbeat. It names the
skills vendored in this repo at `skills/`; installation is planned.

**Seats** (agents, not stages). The acceptance table is the source of truth;
runtime enforcement remains planned:

| Seat | Runs | Loads |
|---|---|---|
| Foreman | coordinates all seven states and the shared transition action; splits units, assigns, executes Ship after approval | build-dark-factory (playbook), piv-slice-epic, worktree-create, worktree-merge |
| Builder | Build + distinct Cleanup, one worktree per unit; may record no cleanup needed | new-feature, code-structure, source-code-context, piv-fix-review-findings, prime-codebase |
| Tester | independently validates final diff at Cleanup exit; proof and nonempty checks complete before Review | evidence-driven-testing, piv-validate, prime-codebase |
| Reviewer | reads and judges current diff and proof; never fixes or approves a diff it authored or changed | piv-review-pr, rules-check-drift, open-code-review-delegate, before-and-after |

All seats: unslop for human-facing text, ponytail ladder for everything built.

**States, not seats** — brief v4's seven stages live in the issue machine, visible for free:

`intake → architect → context → build → cleanup → review → ship`

one Paperclip label per state. Seats submit outcomes to the shared transition
action, the sole state writer coordinated by the Foreman. Cleanup is a distinct
Builder-owned stage and may record no cleanup needed.

**Gates (planned enforcement, not implemented in the current app):**

- Cleanup → Review: Tester independently validates the final diff; evidence and nonempty successful checks exist before Review entry.
- Review → Ship: current-head evidence, 100% OpenCodeReview coverage, zero skipped files, and zero unresolved findings are parsed by the planned gate.
- Ship: Reviewer PASS plus separate human merge and deployment approvals; verified deployment completes Ship.

**Planned memory write-back at every transition**, not just review: offline
viewing works without a provider, but governed advancement waits for confirmed
memory with a pending transition identity and no next-seat dispatch. Atomicity
and recovery are deferred to Task 06.

## 5. Dark-factory disciplines adopted (from coleam00, mapped)

These are target requirements. The dispatcher, gates, and runtime enforcement
are planned, not implemented.

1. **Dumb dispatcher** — fixed priority (fix blocked PR → review waiting PR → build next accepted unit → triage), finish in-flight before new work, stall reaping for stranded states. Never an LLM dispatcher; it invents work. → `factory/pipeline.md`
2. **Two gates must be code** — the merge script and an app-started assertion. Every other "gate" is a suggestion. → FACTORY-LAW enforcement
3. **Independence line** — the Tester and Reviewer see the issue and the outcome, never the implementation plan; holdout scenarios live where the Builder can't read them. → seat charters
4. **Autonomy dial 0–5** per company, encoded in the planned dispatcher. The
   current level is 1 with manual owner intake and manually initiated Tester
   and Reviewer runs. No automatic raise is allowed; later automatic merge
   needs a separate owner-approved policy. → FACTORY-LAW + app dial control later
5. **MISSION.md per product** — what it is, out-of-scope-forever list, protected alongside the governance files by a guard script. A protected-file change requires a separate owner-authorized amendment naming exact files and intent, independent review, and owner approval. → FACTORY-LAW + `factory/`
6. **Factory doctor** — deterministic audit (protected files intact, gates are code, empty-is-not-pass, holdout exists, dial matches reality) plus mutation-tested gates. A gate that has never failed is a gate nobody tested. → `evals/`
7. **PR discipline** — ≤500 lines per PR, split rather than ship unreviewable; max 2 fix attempts then escalate to a human; never modify a test to make it pass. → FACTORY_RULES-style additions
8. **Instrumentation from day one** — tokens and cost per run recorded before the first unattended lap; premium model in the Foreman/Reviewer slots, cheap models in triage and extraction. → app metrics + config
9. **Walking skeleton first** — on a greenfield product, ticket one makes it runnable end-to-end (start command, health check, tests) so the harness has something to stand on; logic must sit behind an http/cli/library surface the checks can drive. → Foreman charter
10. **The trigger goes on last** — scheduling only after one full lap has run by hand. Nothing pushes; the scheduler polls. → build order

Not adopted: Archon (Paperclip is our workflow engine), GitHub-labels-as-state (Paperclip is our state machine), their harness scaffold wholesale (evidence-driven-testing covers the prove beat; per-product harnesses get built by the factory itself).

## 6. Acceptance

1. App v1 answers `GET /api/factory/status` with live data from both engines and renders all six zones.
2. A task filed from the Work zone lands as a Paperclip issue with the pipeline labels and is picked up by the right seat.
3. Every state transition writes a memory entry; the Memory zone shows it.
4. Review cannot pass without evidence attached, 100% OpenCodeReview coverage, zero skipped files, and zero unresolved findings; Ship cannot pass without Review PASS + human approval.
5. A Hermes-style agent run through one full lap (intake to ship) with its derived state visible in Live the whole way.
6. The dispatcher, run by hand, completes one lap in the fixed priority order with stalls surfaced as needs-human.
7. Token/cost per run is recorded from the first lap.

## 7. Build order

1. **Wave 1 (this repo, now):** seed repo, vendor skills, spec v0.4, FACTORY-LAW upgrades. *(in flight)*
2. **Wave 2:** `factory/pipeline.md` + `factory/roles/` + `evals/` doctor skeleton. The factory definition, reviewable on paper before any code runs it.
3. **Wave 3:** the app — stubs for the two engine APIs, then real clients, zones in order (Agents → Work → Live → Status/Runtime → Memory → Connections).
4. **Wave 4:** create the company in Paperclip, install the Law + skills, run one lap by hand on the app's own roadmap. Raise the dial only after.
5. **Wave 5:** a host-OS page consuming the Forge API; runtime terminal layer if watching builders live has become a real need.

## 8. Decisions

1. **Name** — The Forge (the app) runs the Factory (the Paperclip company). Any existing "Agent Factory" feature in a host OS keeps its name.
2. **Host** — wherever your engines run; the app binds `FORGE_BIND_HOST:FORGE_PORT` (default `0.0.0.0:3400`) from its `.env`, so binding to a private interface is a config line, not a code change.
3. **First pipeline job** — the Forge's own remaining roadmap: the factory eats its own output from its first lap.
4. **Dial** — level 1 for the hand lap. Any later automatic merge requires a
   separate owner-approved policy and evidence. Encoded in `factory/pipeline.md`.
