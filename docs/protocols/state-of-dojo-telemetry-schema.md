---
title: "State-of-Dojo Telemetry Schema"
slug: state-of-dojo-telemetry-schema
type: protocol
status: active
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0608
pairs_with:
  - docs/protocols/state-of-project-projection.md
  - docs/sprints/SESSION_0608.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - governance
  - dashboard
  - projection
  - token-cost
---

# State-of-Dojo Telemetry Schema

A structured `telemetry:` SESSION-frontmatter block recording per-model token usage + cost for a
session, so the State-of-Dojo **token-cost panel** (G-023 WS-D, `apps/web/components/app/state-of-dojo/token-cost/*`)
can render a real spend trend. Same **projection-only law** as the rest of the State-of-Dojo
surface (`state-of-project-projection.md`): this schema is read-only source data written by the
closing agent at bow-out — the panel never writes back.

## Shape

```yaml
telemetry:
  - model: claude-sonnet-5
    input: 310000
    output: 42000
    costUsd: 1.56
  - model: claude-opus-4.8
    input: 52000
    output: 9000
    costUsd: 1.45
```

One row per model used in the session (a fan-out session with a Sonnet lane + a Fable/Opus
orchestrator gets two-plus rows). All four fields are **required** per row — `token-cost-parse.ts`
drops any row missing a field or with a non-numeric `input`/`output`/`costUsd` (resilient, never
throws). A session with no `telemetry:` block, or only the legacy freeform string (see Migration
note below), contributes zero rows — the panel renders an honest empty, not a crash.

- `model` — the model id/name as it appears in session prose (free string, not an enum — matches
  the informal names already used in session frontmatter/body, e.g. `claude-sonnet-5`,
  `claude-opus-4.8`, `claude-fable-5`).
- `input` / `output` — token counts (integers).
- `costUsd` — the dollar cost for that row, computed by whoever fills in telemetry at close
  (using the `$/token` rate table below). The parser does NOT recompute cost from tokens — it
  trusts the recorded value, same as it trusts recorded frontmatter elsewhere.

## Where it goes

Same frontmatter block as every other session field (`title`, `status`, `lane`, …), placed after
`last_agent:`. A one-line YAML comment (`# ...`) directly above the `telemetry:` key is fine for
provenance notes (e.g. "seed example, not reconciled against a real usage banner") — the parser
scans for the exact `telemetry:` key line and ignores anything before it.

## Migration note — the SESSION_0587 freeform precedent

SESSION_0587 pioneered an **informal freeform string** under the same key:
`telemetry: "lanes=Sonnet 5 (4×, ~1.56M subagent tok); orchestrator=Fable 5 → Opus 4.8…"`. This
schema formalizes that instinct into the structured list above. `token-cost-parse.ts` only reads
the list form — a bare scalar string under `telemetry:` parses to zero rows (the key line itself
doesn't match `TELEMETRY_KEY_RE`'s "key alone on its line" pattern). SESSION_0587 was itself
converted to the structured form as this schema's first real seed (see below) — any other
historical session still carrying a freeform `telemetry:` string is unconverted debt, named here,
not fixed here.

## Seeded sessions (SESSION_0608)

Three sessions carry seed data so the panel has something to render:

| Session | Rows | Source |
| --- | --- | --- |
| `SESSION_0587.md` | 4 (one per overnight lane, all `claude-sonnet-5`) | Real total-token counts from the session's own "What landed" table (278k/256k/474k/553k), split 90/10 input/output — **the 90/10 split is an estimated placeholder** (session banners at the time recorded only a combined total, not an input/output breakdown); the orchestrator's own Fable→Opus usage has no recorded token count and is deliberately left out of the rows (documented via a frontmatter comment) rather than fabricated. |
| `SESSION_0603.md` | 1 (`claude-sonnet-5`) | Illustrative seed estimate — sized to match the overnight lanes' order of magnitude; NOT reconciled against a real usage banner. |
| `SESSION_0598.md` | 1 (`claude-sonnet-5`) | Illustrative seed estimate (a Petey plan session — lighter weight than a build lane); NOT reconciled against a real usage banner. |

Going forward, the honest source is whatever the model's own usage panel reports at session
close — this seed exists only to prove the schema + panel end-to-end (G-023 WS-D scope), not as
an audited cost ledger.

## `$/token` cost table + owner

**Owner: the closing agent, opportunistically, at bow-out** — no dedicated maintainer role.
Whoever fills in `costUsd` for a session should sanity-check the row against this table (or
update the table first if a new model enters rotation). Source of truth is Anthropic's published
API pricing, not a vendor invoice.

| Model | Input $/M tok | Output $/M tok | Status |
| --- | --- | --- | --- |
| `claude-sonnet-5` | $3.00 | $15.00 | **Estimated placeholder** — carried forward from the known Sonnet-tier ratio as of the assistant's training cutoff (Jan 2026); not verified against a real invoice for this specific model version. |
| `claude-opus-4.8` | $15.00 | $75.00 | **Estimated placeholder** — carried forward from the known Opus-tier ratio; same caveat. |
| `claude-fable-5` | $3.00 | $15.00 | **Estimated placeholder** — assumed same tier as Sonnet (house mid-tier default); unverified. |

**This table is honest-but-unverified by design** — reconcile against the Anthropic Console /
Vercel AI Gateway billing dashboard when that data is available, and update the rates (and this
row's "Status" column) at that point.
