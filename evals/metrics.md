# Factory Metrics — definitions and sources

| Metric | Definition | Source | Memory lane |
|---|---|---|---|
| State cycle time (issue time per state) | Wall-clock time an issue spends in each pipeline state (intake → architect → context → build → cleanup → review → ship), per transition. | Paperclip `:3100` issue `status` + run `startedAt`/`finishedAt`/`createdAt` (verified in the OS2 Paperclip client); the label-history endpoint is not verified — verify against stubs in Wave 3. | metrics |
| Run duration | Finished-minus-started per engine run. | Paperclip `:3100` run `startedAt`/`finishedAt` (verified); Hermes `:8642` run `created_at` (verified) — Hermes end timestamp not in the verified field set — verify against stubs in Wave 3. | metrics |
| Tokens per run | Input + output tokens consumed per run. | Hermes `:8642` `GET /v1/runs/{run_id}` field `usage` exists but its shape is unverified in `hermesApi.ts` — verify against stubs in Wave 3. | metrics |
| Cost per run | USD cost per run from provider pricing. | Paperclip `:3100` agent spend surface (spec v0.4 §1); no verified field in the Paperclip client — verify against stubs in Wave 3. | metrics |
| Review iterations (fix attempts) | Review → fix loops per PR before PASS; capped at 2, then escalates. | Count of review-state re-entries on the Paperclip `:3100` issue; review-run outputs carry OpenCodeReview coverage and unresolved-finding counts — verify against stubs in Wave 3. | calibration |
| Blocked time | Time a run sits waiting on a question or gate, per the derived blocked state. | Hermes `:8642` run `status: waiting_for_approval` (verified enum value) + the derived `GET /api/factory/runtime` state `since` (frozen interface, spec v0.4 §2–3). | metrics |
| PR size in changed lines | Changed-line count of the PR under review; cap 500, split rather than ship unreviewable. | Paperclip `:3100` run `resultJson` written by the review run (field verified; the size convention is not) — verify against stubs in Wave 3. | metrics |
| Escalations to human | Issues escalated to a human gate per period, with the reason named. | Paperclip `:3100` approval gates (spec v0.4 §1); no verified field — verify against stubs in Wave 3. | calibration |
| Dispatcher laps per day | Count of dispatcher laps per day in the fixed priority order; stalls surfaced as needs-human. | Paperclip `:3100` heartbeat-runs of the dispatcher agent (spec v0.4 §3); exact run query unverified — verify against stubs in Wave 3. | metrics |

Memory write-back is planned. Define and verify the chosen provider's API before implementing these lanes; no provider client or endpoint is bundled.
