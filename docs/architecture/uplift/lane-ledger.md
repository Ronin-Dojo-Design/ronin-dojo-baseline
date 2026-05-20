---
title: "Dirstarter Upstream Uplift — Lane Ledger"
slug: dirstarter-uplift-lane-ledger
type: ledger
status: active
created: 2026-05-19
updated: 2026-05-20
last_agent: claude-session-0208
pairs_with:
  - docs/architecture/uplift/epic-2026-05-19.md
  - docs/architecture/uplift/L1-env-deploy-diff-report.md
  - docs/architecture/dirstarter-upstream-sync-2026-05-14.md
  - docs/architecture/dirstarter-baseline-index.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0203.md
  - docs/sprints/SESSION_0204.md
  - docs/sprints/SESSION_0205.md
  - docs/sprints/SESSION_0206.md
  - docs/sprints/SESSION_0207.md
  - docs/sprints/SESSION_0208.md
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
| L2 | SESSION_0205 | Env/deploy implementation | `7e724b6 env/deploy subset: env.ts, .env.example, services/db.ts, prisma.config.ts, next.config.ts reviewed and selectively ported` | 18 | final SHA reported in bow-out response | `copied_at_sha = c42e8bbc9a093daa8bb70faebfc552399134ee13` | `copied_at_sha = c42e8bbc9a093daa8bb70faebfc552399134ee13` | `typecheck` clean; `biome` clean; app `bun test --isolate --path-ignore-patterns='e2e/**'` 236/236; `wiki:lint` 0 errors; Vercel Ready proof in bow-out response | pass | Added optional `DATABASE_PUBLIC_URL` and `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`; removed dead Google env declaration; added defensive Neon direct URL normalization for Prisma CLI; kept `REDIS_REST_*`, `RESEND_AUDIENCE_ID`, app-root Vercel config, and cron path stable. |
| L3 | SESSION_0206 | Schema port wave | `7e724b6 schema/server subset: ToolTier enum + generated tierPriority, Rejected/Deleted, Bookmark, DB-backed Post reads, report enum, slug helpers` | 42 | final SHA reported in bow-out response | `copied_at_sha = c42e8bbc9a093daa8bb70faebfc552399134ee13` | `copied_at_sha = c42e8bbc9a093daa8bb70faebfc552399134ee13` | `db:generate`, Prisma validate/migrate reset/dev/deploy clean; `pg_locks` 0; `typecheck` clean; `biome` clean; focused tests 6/6; app tests 242/242; Vercel Ready proof in bow-out response | pass | Followed upstream enum tier shape rather than the epic sketch's model; kept Ronin `isFeatured` and `ReportType.Feedback` compatibility; branch push used per owner prompt, main not touched. |
| L4 | SESSION_0207 | Baseline listings relabel + tier flow | `7e724b6 listing-tier UI/admin subset: public tier/status badges, bookmark affordance, admin tier control, tier-aware submit/dashboard/featured logic` | 35 | final SHA reported in bow-out response | `copied_at_sha = c42e8bbc9a093daa8bb70faebfc552399134ee13` | `copied_at_sha = c42e8bbc9a093daa8bb70faebfc552399134ee13` | Focused tests 6/6; `typecheck` clean; touched-file `biome` clean; production `build` clean with one pre-existing Turbopack/NFT warning; app tests 244/244; curl smoke public tiers/bookmark; Vercel latest Production + Preview Ready | pass | Kept `Tool` model and `/admin/tools` routes; public/admin copy says Listing where touched; `Tool.tier` is source of truth and `isFeatured` is a Premium compatibility projection. |
| L5 | SESSION_0208 | UI primitives Part 1 (upstream-derived) | `7e724b6 components/common subset: field, button-group, tool-status; tools-table refactored to consume toolStatusBadgeProps + toolStatusIcon` | 7 | final SHA reported in bow-out response | `copied_at_sha = c42e8bbc9a093daa8bb70faebfc552399134ee13` | `copied_at_sha = c42e8bbc9a093daa8bb70faebfc552399134ee13` | `typecheck` clean; touched-file `biome` clean; app tests 244/244 (`bun test --isolate --path-ignore-patterns='e2e/**'`); production `build` clean; `wiki:lint` 0 errors / 495 warnings; Vercel readiness reported in bow-out response | pass | No `tailwind-variants` install (Ronin's `cva` object-form API is signature-compatible with upstream's `tv`-aliased calls; no `lib/tv.ts` wrapper needed). Data-table helpers `data-table-faceted-filter.tsx` and `data-table-view-options.tsx` already match upstream behavior; the `render={…}` vs `asChild` Popover API drift is deferred to a future Radix-API lane. `providers/` and `relation-selector.tsx` (also missing in Ronin's `common/`) deferred to L6/L8. |

## Epic summary

> Filled at L15 (SESSION_0218) bow-out.
