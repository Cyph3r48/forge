# Engine contracts

Task 04 uses release tags plus immutable commit SHAs. Tests use the fixtures in
`evals/fixtures/`; they never contact a running engine.

## Paperclip

- Repository: https://github.com/paperclipai/paperclip
- Release: `v2026.916.0`
- Commit: `dffc2b3ca1b9e88fa21cb17493083e682dffd1ca`
- Package version at that commit: `0.3.1`

Authoritative sources:

- [Issue input validator](https://github.com/paperclipai/paperclip/blob/dffc2b3ca1b9e88fa21cb17493083e682dffd1ca/packages/shared/src/validators/issue.ts)
- [Issue and heartbeat status constants](https://github.com/paperclipai/paperclip/blob/dffc2b3ca1b9e88fa21cb17493083e682dffd1ca/packages/shared/src/constants.ts)
- [Issue routes](https://github.com/paperclipai/paperclip/blob/dffc2b3ca1b9e88fa21cb17493083e682dffd1ca/server/src/routes/issues.ts)
- [Agent and heartbeat routes](https://github.com/paperclipai/paperclip/blob/dffc2b3ca1b9e88fa21cb17493083e682dffd1ca/server/src/routes/agents.ts)
- [Approval routes](https://github.com/paperclipai/paperclip/blob/dffc2b3ca1b9e88fa21cb17493083e682dffd1ca/server/src/routes/approvals.ts)

`POST /api/companies/:companyId/issues` accepts native `priority`,
`assigneeAgentId`, and UUID `labelIds`. Forge must send `status: "todo"`, the
selected priority, the configured Foreman agent ID, and the `factory:intake`
label ID. The response is the created issue object.

Paperclip status and factory stage are separate. Native issue status is one of
`backlog`, `todo`, `in_progress`, `in_review`, `done`, `blocked`, or
`cancelled`. The factory stage comes from the issue's resolved labels. Approval
state comes from approval records linked to the issue.

Heartbeat terminal statuses are `succeeded`, `interrupted`, `failed`,
`cancelled`, and `timed_out`. A terminal status remains terminal when
`finishedAt` is absent.

## Hermes

- Repository: https://github.com/NousResearch/hermes-agent
- Release: `v2026.9.14`
- Package version: `0.21.3`
- Commit: `345cd2b057a452236de401d3534b8502a7465e8d`

Authoritative sources:

- [API server guide](https://github.com/NousResearch/hermes-agent/blob/345cd2b057a452236de401d3534b8502a7465e8d/website/docs/user-guide/features/api-server.md)
- [API server routes and response envelopes](https://github.com/NousResearch/hermes-agent/blob/345cd2b057a452236de401d3534b8502a7465e8d/gateway/platforms/api_server.py)
- [Run submission and status](https://github.com/NousResearch/hermes-agent/blob/345cd2b057a452236de401d3534b8502a7465e8d/gateway/platforms/api_server_runs.py)

Forge must check authenticated `GET /v1/capabilities` before using the Runs
API. `POST /v1/runs` returns HTTP 202 with
`{run_id, status: "started", replayed: false}`. This admission response is
separate from the pollable record returned by `GET /v1/runs/:run_id`. Hermes
has no endpoint that lists every run. Forge must retain IDs for runs it submits
before Task 07 can join those runs to agents.

Hermes run statuses are `queued`, `running`, `waiting_for_approval`,
`stopping`, `completed`, `failed`, and `cancelled`. Persisted records can also
contain terminal `interrupted`. `GET /api/sessions` returns a list envelope,
not an array.

## Approved fixture outcomes

The Paperclip fixture fixes one Foreman, seven factory labels, native issue
status, approval records, and terminal heartbeat cases. The Hermes fixture
fixes its list envelopes, capabilities, and run states. Each fixture includes
the normalized values Forge must expose.

Task 04 checks must also inject these transport outcomes without adding more
fixture files: an empty collection, malformed successful JSON, a non-JSON error,
an unreachable engine, and one engine failing while the other succeeds. Forge
must preserve the response shapes in `forge/src/lib/api-contract.md` and report
an engine failure instead of converting it to an empty successful result.

The installed Paperclip `/api/openapi.json` remains the final deployment
compatibility check. It is not needed for local Task 04 work.
