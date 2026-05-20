---
title: "Dirstarter Upstream Uplift — Lane Ledger"
slug: dirstarter-uplift-lane-ledger
type: ledger
status: active
created: 2026-05-19
updated: 2026-05-19
last_agent: codex-session-0204
pairs_with:
  - docs/architecture/uplift/epic-2026-05-19.md
  - docs/architecture/uplift/L1-env-deploy-diff-report.md
  - docs/architecture/dirstarter-upstream-sync-2026-05-14.md
  - docs/architecture/dirstarter-baseline-index.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0203.md
  - docs/sprints/SESSION_0204.md
---

# Dirstarter Upstream Uplift — Lane Ledger

Append-only audit ledger for the Dirstarter Upstream Uplift Epic (`epic-2026-05-19.md`).

One row per lane on bow-out of that lane's session. Final row at L15 records epic close.

## Row format

Each row appends below the table. Required columns:

| Lane | Session | Lane name | Upstream commits ported | Files touched (count) | Ronin commit (short SHA) | `.dirstarter-upstream` marker before | `.dirstarter-upstream` marker after | Verification proof | Doug verdict | Notes |
| --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- | --- |

- **Upstream commits ported:** comma-separated upstream short SHAs that this lane absorbed (or `n/a — doc-only` for L1, ADR-only for L10).
- **`.dirstarter-upstream` marker:** the `copied_at_sha` line. Only L15 changes the SHA. SESSION_0204 records the partial-port intent in this ledger only; it does not edit `apps/web/.dirstarter-upstream`.
- **Verification proof:** `vercel ls Ready @ <url>` / `bun test … 10/10` / `Playwright suite green` / `pg_locks clean` / `curl /sitemap.xml valid` etc.
- **Doug verdict:** `pass` / `pass-with-followup` / `fail` (fail blocks ledger row append).

## Pre-epic baseline

- Branch: `main` @ `ee359c4` (SESSION_0202 close).
- `apps/web/.dirstarter-upstream` `copied_at_sha = c42e8bb` (original copy 2026-04-25).
- Local Dirstarter checkout: `upstream/dirstarter-main-20260514` @ `7e724b6`.
- Epic source-of-truth doc: `docs/architecture/uplift/epic-2026-05-19.md`.

## Entries

| Lane | Session | Lane name | Upstream commits ported | Files | Ronin commit | Marker before | Marker after | Verification proof | Doug | Notes |
| --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- | --- |
| L1 | SESSION_0204 | Baseline map refresh + lane-ledger init + env/deploy diff report | `n/a — doc-only; upstream 7e724b6 compared, no upstream files copied` | 8 | final SHA reported in bow-out response | `copied_at_sha = c42e8bbc9a093daa8bb70faebfc552399134ee13` | `copied_at_sha = c42e8bbc9a093daa8bb70faebfc552399134ee13` | `wiki:lint` 0 errors / 497 warnings; latest Production deploy Ready via `vercel ls`; Graphify refresh after git hygiene | pass | Partial-port intent for env/deploy recorded in `L1-env-deploy-diff-report.md`; `.dirstarter-upstream` intentionally unchanged until L15. |

## Epic summary

> Filled at L15 (SESSION_0218) bow-out.
