# Run The Forge

## Local development

Install Node.js and npm. The app was checked with Node.js 24.21.0. Run from
the repository root:

```bash
cd forge
npm ci
npm run dev -- --hostname 127.0.0.1
```

Open `http://localhost:3400`. No environment file, credentials, or running
engines are needed to start the app. With configuration unset, engine clients
make no requests. The views show empty or unconfigured states. Filing tasks
requires a configured Paperclip company.

## Build and check

From `forge/`:

```bash
npm run build
npm start -- --hostname 127.0.0.1
```

From the repository root after installing the app dependencies:

```bash
python3 evals/doctor.py
node evals/unconfigured-clients.mjs
```

The doctor checks repository documents and skill structure. The client check
verifies that unconfigured engines receive no requests. These checks do not
prove a complete factory lap or production readiness. Forge authentication
is not implemented yet; keep the app on localhost during development.

## Optional engine configuration

Configure engines locally only when you intend to use them. The names below
document the interface; this repository supplies no connection settings or
credentials. A local `forge/.env.local` is ignored by Git.

| Variable | Purpose |
|---|---|
| `PAPERCLIP_API` | Paperclip API base; defaults to localhost port 3100 with path `/api` |
| `PAPERCLIP_TOKEN`, `PAPERCLIP_COMPANY` | Both are required before Paperclip requests are enabled |
| `HERMES_API_URL` | Enables the Hermes client when set |
| `HERMES_API_KEY` | Optional Hermes bearer key; `API_SERVER_KEY` is the fallback |
| `FORGE_BIND_HOST`, `FORGE_PORT` | Bind address and port for the included systemd unit |

No memory provider is bundled. The Memory page remains unconfigured until a
provider is implemented; no memory credentials or endpoints are supplied.

Keep personal notes, environment files, tokens, private keys, and host-specific
configuration outside version control. Ignore rules cover environment files
and common credential filenames, but review staged changes before committing.

## Factory configuration

The intended company, roles, stages, and skills are described in
`docs/spec-v0.4.md`, `FACTORY-LAW.md`, `factory/`, and `skills/INDEX.md`.
Engine setup is separate from starting this app. Follow those definitions
when configuring a company and installing its agent instructions.

## Deployment files

`forge/forge.service` and `forge/deploy.sh` are generic templates for an owner
to configure. They contain no deployed host or credentials. The script requires
a locally configured SSH destination through `FORGE_SSH`; the systemd unit
reads its settings from `/opt/forge/.env`. Review both before using them.
Deployment is a separate owner-approved action.
