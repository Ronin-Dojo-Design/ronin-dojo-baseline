---
title: "SESSION 0290 — Per-brand assets in brandConfigs + resolvePublicMediaUrl (media epic, Thread-2 TASK_05/06)"
slug: session-0290
type: session--implement
status: closed
created: 2026-05-29
updated: 2026-05-29
last_agent: copilot-session-0290
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0289.md
  - docs/sprints/SESSION_0291.md
  - docs/sprints/petey-plan-0287.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0290 — Per-brand assets in brandConfigs + resolvePublicMediaUrl (media epic, Thread-2 TASK_05/06)

## Date

2026-05-29

## Operator

Brian + copilot-session-0290 (Petey orchestrating, Cody executing, Doug verifying)

## Goal

Implement **Thread-2 TASK_05 + TASK_06** from [`petey-plan-0287.md`](petey-plan-0287.md):
extend `brandConfigs` with per-brand asset paths (`logoSrc`, `faviconSrc`, `ogImageSrc`),
build `resolvePublicMediaUrl()`, and wire layout/logo/OG to serve per-brand assets.
Decide D2 (path convention).

## Status

### Status: closed

## Bow-in

### Previous session

- SESSION_0289 (closed). Landed Thread-1 TASK_03 (MediaAttachment attach/detach CRUD,
  D4 resolved). Thread-1 complete (TASK_01–03). Next session recommended Thread-2 TASK_05/06.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `config/site.ts` (brand config), `app/layout.tsx` (favicon metadata), `components/web/ui/logo.tsx` + `logo-symbol.tsx` (brand logo), `app/api/og/route.tsx` (OG image) |
| Extension or replacement | **Extension** — adds per-brand asset fields to existing `brandConfigs` + a URL resolution helper; does not replace the config structure or metadata pattern |
| Why justified | All 4 brands share a single hardcoded favicon.png, logo SVG, and OG image. BBL (Black Belt Legacy) needs its own branding. The `brandConfigs` type already exists — extending it with asset paths is the natural next step. |
| Risk if bypassed | BBL pages show Baseline branding. All brands look identical. |

### Graphify check

- Graph status: current (7397 nodes / 11977 edges / 1424 files).
- Key files identified: `config/site.ts`, `app/layout.tsx`, `components/web/ui/logo.tsx`,
  `components/web/ui/logo-symbol.tsx`, `components/web/ui/favicon.tsx`, `app/api/og/route.tsx`,
  `lib/media.ts`.

## Petey plan

### D2 Decision — RESOLVED: `/images/brands/<slug>/` convention

Path: `public/images/brands/<slug>/{logo.png, favicon.png, opengraph.png}`.

- Local dev: served from `public/` via Next.js static serving.
- Prod: when `NEXT_PUBLIC_MEDIA_BASE_URL` is set, `resolvePublicMediaUrl()` prepends it
  (S3/CloudFront). When blank, falls back to relative path (local dev).
- This matches the existing `resolvePublicMediaUrl` intent from petey-plan-0287.
- Default brand (Baseline) keeps current root assets (`/favicon.png`, `/logo.png`,
  `/opengraph.png`) as fallback.

### Tasks

| ID | Status | Description | Agent |
| --- | --- | --- | --- |
| SESSION_0290_TASK_01 | done | Add `resolvePublicMediaUrl` to `lib/media.ts` | Cody |
| SESSION_0290_TASK_02 | done | Extend `brandConfigs` with `logoSrc`, `faviconSrc`, `ogImageSrc` per brand | Cody |
| SESSION_0290_TASK_03 | done | Wire `layout.tsx` favicon to use per-brand `faviconSrc` | Cody |
| SESSION_0290_TASK_04 | done | Wire `logo.tsx` to show per-brand logo image (with LogoSymbol fallback) | Cody |
| SESSION_0290_TASK_05 | done | Wire `app/api/og/route.tsx` to use per-brand `ogImageSrc` | Cody |
| SESSION_0290_TASK_06 | done | Create brand asset dirs + copy real BBL assets from monorepo | Cody |
| SESSION_0290_TASK_07 | done | Verification (typecheck + biome — clean) | Doug |

## Task log

### SESSION_0290_TASK_01 — resolvePublicMediaUrl

Added `resolvePublicMediaUrl(path)` to `lib/media.ts`. Reads `NEXT_PUBLIC_MEDIA_BASE_URL` from env, prepends it when set, returns path as-is for local dev. Normalizes double slashes.

### SESSION_0290_TASK_02 — brandConfigs asset fields

Extended `BrandSiteConfig` type and all 4 brand entries in `config/site.ts` with `logoSrc`, `faviconSrc`, `ogImageSrc`. BBL → `/images/brands/black-belt-legacy/...`, WEKAF → `/images/brands/wekaf-usa/...`, Baseline/RDD → root paths.

### SESSION_0290_TASK_03 — layout.tsx favicon

Changed hardcoded `"/favicon.png"` to `resolvePublicMediaUrl(brandConfig.faviconSrc)`.

### SESSION_0290_TASK_04 — logo.tsx per-brand logo

Updated `logo.tsx` to destructure `logoSrc` from `useBrand()`, conditionally render `<Image>` for custom logos with `<LogoSymbol>` fallback. Required updating `brand-context.tsx` to expose asset fields.

### SESSION_0290_TASK_05 — OG route per-brand

Wired `app/api/og/route.tsx` to use `resolvePublicMediaUrl(brandConfig.faviconSrc)` instead of hardcoded path.

### SESSION_0290_TASK_06 — BBL asset dirs + real assets

Created `public/images/brands/black-belt-legacy/` and `public/images/brands/wekaf-usa/`. Copied real BBL assets from `ronin-dojo-monorepo`: `logo.svg` (wordmark), `logo.png` (official), `rigan-machado-badge.svg`.

### SESSION_0290_TASK_07 — Verification

Typecheck clean. Biome clean (one formatting fix in `config/site.ts`).

## What landed

- `resolvePublicMediaUrl()` helper for S3/CDN-aware asset URLs
- Per-brand `logoSrc`, `faviconSrc`, `ogImageSrc` in `brandConfigs`
- Layout favicon, logo component, and OG route all brand-aware
- Real BBL logo assets copied from monorepo
- D2 resolved: `/images/brands/<slug>/` convention

## Files touched

- `apps/web/lib/media.ts` — added `resolvePublicMediaUrl`
- `apps/web/config/site.ts` — extended `BrandSiteConfig` + all 4 entries
- `apps/web/contexts/brand-context.tsx` — added asset fields to context
- `apps/web/app/layout.tsx` — per-brand favicon
- `apps/web/components/web/ui/logo.tsx` — per-brand logo image
- `apps/web/app/api/og/route.tsx` — per-brand OG favicon
- `apps/web/public/images/brands/black-belt-legacy/` — real BBL assets (logo.svg, logo.png, rigan-machado-badge.svg, favicon.png, opengraph.png)
- `apps/web/public/images/brands/wekaf-usa/` — placeholder dir

## Decisions resolved

- **D2**: `/images/brands/<slug>/` convention for per-brand static assets
- **Bucket strategy**: One S3 bucket with brand-prefixed keys (not per-brand buckets) — simpler IAM, one CloudFront distribution, mirrors local path convention

## Open decisions / blockers

- **D5**: Admin brand-settings page — DB-driven logo/favicon/OG + accent/highlight CSS custom properties. Needs new `BrandSettings` model (or extend existing `Organization` settings).

## Next session

- **Goal**: S3 bucket setup for brand assets + admin brand-settings page (DB-driven logo/favicon/OG + accent colors)
- **Inputs to read**: `petey-plan-0287.md` (Thread-3 if exists), `config/site.ts` current brand config, admin media page pattern (`app/admin/media/`)
- **First task**: Petey — plan `BrandSettings` model (fields: `logoUrl`, `faviconUrl`, `ogImageUrl`, `accentColor`, `highlightColor`, brand FK) and admin settings CRUD page. Decide whether to extend `Organization` or create standalone model.
