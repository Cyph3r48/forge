# Run The Forge

## Local development

Install Node.js and npm. The app was checked with Node.js 24.21.0. Run from
the repository root:

```bash
cd forge
npm ci
npm run dev -- --hostname 127.0.0.1
```

Set `FORGE_AUTH_TOKEN` in your shell, then open `http://localhost:3400` and
enter that token. The browser keeps it in session storage for the current tab.
No running engines are needed. With engine configuration unset, engine clients
make no requests and the views show empty or unconfigured states. Filing tasks
requires a configured Paperclip company.

Use HTTPS outside localhost. The token is readable by same-origin JavaScript,
so do not add third-party scripts or unsafe HTML. A reverse proxy must preserve
the original `Host` and public protocol so Forge can reject cross-origin writes.

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
node evals/auth-boundary.mjs
```

The doctor checks repository documents and skill structure. The client check
verifies that unconfigured engines receive no requests. The auth check starts
isolated local fixture servers and covers every `/api/factory` method before
its route runs. These checks do not prove a complete factory lap or production
readiness.

## Optional engine configuration

Configure engines locally only when you intend to use them. The names below
document the interface; this repository supplies no connection settings or
credentials. A local `forge/.env.local` is ignored by Git.

| Variable | Purpose |
|---|---|
| `FORGE_AUTH_TOKEN` | Required bearer token for every Forge API request |
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
