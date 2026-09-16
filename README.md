# The Forge

For current implementation status, decisions, and the next task, read
[docs/PROGRESS.md](docs/PROGRESS.md). The factory workflow below is the target;
the app does not yet execute a complete governed factory lap.

The Forge is a stand-alone control-plane app that wraps your coding-agent engines into one place: create agents, give them work, watch them run, read their memory, approve gates. It runs **the Factory**: one Paperclip company where a spec goes in one end and reviewed, validated, shipped software comes out the other, governed by a written law.

A mixture of a software factory (specs in, shipped software out) and an agent factory (the agents that run it are created, monitored, and improved through the same system).

## What's in the repo

| Path | What it is |
|---|---|
| `forge/` | The app: Next.js control plane — Status, Agents, Work, Live, Memory, Connections, Runtime zones + the API routes that wrap your engines |
| `FACTORY-LAW.md` | The constitution every factory agent runs under; install it as your Paperclip company's agent instructions |
| `factory/pipeline.md` | The state machine: seven states, dispatcher rules, gates, autonomy dial, memory write-back points |
| `factory/roles/` | The four seat charters: Foreman, Builder, Tester, Reviewer |
| `skills/` | The vendored canonical skill set the seats load (`skills/INDEX.md` lists sources, licenses, seat assignments) |
| `evals/` | The factory doctor (deterministic audit of this repo) + metrics definitions |
| `AGENTS.md` | The four-beat workflow (isolate → build → prove → ship) for any agent working in this repo |
| `docs/spec-v0.4.md` | The design spec: engine map, zones, derived runtime, the disciplines |
| `docs/SETUP.md` | **Start here to run your own** |
| `docs/UPSTREAM-README.md` | Reference: the upstream skills collection this repo vendors from |

## Set up your own

To run the app locally with no engine connections:

```bash
cd forge
npm ci
npm run dev -- --hostname 127.0.0.1
```

Open `http://localhost:3400`. No environment file is required. With engine
configuration unset, the app shows empty or unconfigured views and makes no
engine requests. Read [SETUP.md](docs/SETUP.md) for build commands and optional
engine configuration. Personal notes, environment files, credentials, and
host-specific connection settings do not belong in this repository.

The Forge is engine-agnostic glue: it expects a running [Paperclip](https://github.com/paperclipai) (org layer) and a Hermes-style agent API (intelligence layer); memory integration is planned and no memory provider is bundled. Full setup — env vars, systemd deploy, first lap — is in [`docs/SETUP.md`](docs/SETUP.md).

## Build order

1. Definition: law, pipeline, seat charters, skills, evals (this repo's `factory/`, `skills/`, `evals/`).
2. The app: engine stubs, then real clients, then zones (`forge/`).
3. The company: create the Paperclip company, install the law, create the four seats, run the first lap by hand at dial 1.
4. Remain at dial 1. Any increase or automatic merge requires a separate owner-approved policy and evidence; deployment always requires approval.

## Working in this repo

One worktree and one branch per task. Never build on main. Read [the takeover guide](docs/ORCHESTRATOR-HANDOFF.md) and [progress](docs/PROGRESS.md) before assigning work. Run `python3 evals/doctor.py` for structural checks; it does not prove runtime enforcement.
