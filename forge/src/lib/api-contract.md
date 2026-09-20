# Forge API Contract v1

Every UI page consumes these routes via `src/lib/client.ts`. The stub routes (commit T13a) return fixture JSON with `"source": "stub"`; the real routes (T13b) return the same shapes with `"source": "live"` (or `"engine"` per field). UI must render empty/error states for every list.

## Authentication

Every method below requires `Authorization: Bearer <FORGE_AUTH_TOKEN>`. The
shared proxy returns `401 { "ok": false, "error": "Authentication required" }`
before a route or engine client runs when the header is missing or invalid. It
returns 503 when the server token is unset. Browser writes with an `Origin`
that differs from the Forge origin return 403. Reads and task creation keep
their response shapes after authentication.

The browser stores the Forge token in per-tab session storage so a refresh can
reuse it. This stateless bearer design assumes the origin runs no untrusted
scripts. Engine credentials remain server-only.

| Method | Without a valid header | With `Authorization: Bearer <token>` |
|---|---|---|
| `GET /api/factory/status` | 401 before engine reads | Existing status response |
| `GET /api/factory/agents` | 401 before engine reads | Existing agents response |
| `GET /api/factory/tasks` | 401 before engine reads | Existing tasks response |
| `POST /api/factory/tasks` | 401 before validation or engine writes | Existing success or route error response; cross-origin browser writes return 403 |
| `GET /api/factory/runtime` | 401 before engine reads | Existing runtime response |
| `GET /api/factory/memory` | 401 before route execution | `{ configured: false, agents: [], entries: [] }` until a provider exists |
| `GET /api/factory/connections` | 401 before engine reads | Existing connections response |

## GET /api/factory/status

```ts
{
  source: "stub" | "live",
  company: { id: string, name: string } | null,
  agents: Agent[],
  issues: Issue[],
  runs: Run[],
  gates: Gate[],
  engines: { paperclip: Engine, hermes: Engine }
}
Agent = { id: string, name: string, role: string, seat: string, state: string, model: string,
         spendMonthlyCents: number, budgetMonthlyCents: number, lastHeartbeatAt: string | null }
Issue = { id: string, identifier: string, title: string, state: string, assignee: string | null, priority: string }
Run   = { id: string, agentName: string, engine: "paperclip" | "hermes", status: string,
          startedAt: string | null, finishedAt: string | null, summary: string }
Gate  = { id: string, issue: string, kind: string, waitingOn: "human" | "reviewer" | "tester" | "builder", reason: string }
Engine = { ok: boolean, detail: string }
```

## GET /api/factory/agents — `{ source, agents: Agent[] }` (same Agent shape)

## POST /api/factory/tasks

Request: `{ title: string, description: string, priority: "critical" | "high" | "medium" | "low" }`
Response: `{ ok: true, issue: Issue }` (new issue lands in state `factory:intake`)
Errors: `{ ok: false, error: string }` — missing title, engines unreachable, company unset.

## GET /api/factory/runtime — the frozen interface

```ts
{ source, agents: [{ name: string, seat: string, state: "working" | "blocked" | "idle" | "done",
                     source: "paperclip-run" | "hermes-run" | "none", since: string | null, detail: string }] }
```

## GET /api/factory/memory

```ts
{ configured: boolean, agents: string[], entries: [{ id: string, agent: string, at: string, kind: string, text: string }] }
```
No memory provider is bundled. The route returns `configured: false` and empty lists until a provider is implemented.

## GET /api/factory/connections

```ts
{ engines: { paperclip: Engine, hermes: Engine }, toolsets: [{ name: string, ok: boolean }], skills: [{ name: string, detail: string }] }
```

## Conventions

- Server-side fetch only; the UI never calls Paperclip/Hermes directly.
- All engine failures degrade: the route answers with empty lists + `ok: false` engine entries, never a 500.
- Times are ISO strings. Money is cents.
- Seat values: "Foreman" | "Builder" | "Tester" | "Reviewer" | "" (non-factory agents).
