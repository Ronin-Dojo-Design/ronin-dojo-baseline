---
title: "SESSION 0291 — BrandSettings model + admin brand-settings CRUD + runtime CSS injection"
slug: session-0291
type: session--implement
status: closed
created: 2026-05-29
updated: 2026-05-29
last_agent: copilot-session-0291
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0290.md
  - docs/sprints/petey-plan-0291.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0291 — BrandSettings model + admin brand-settings CRUD + runtime CSS injection

## Date

2026-05-29

## Operator

Brian + copilot-session-0291 (Petey orchestrating, Cody executing, Doug verifying)

## Goal

Create `BrandSettings` Prisma model (per-brand theme colors + asset URLs), extend
`OrgSettings` with nullable theme override fields, build admin CRUD page at
`/admin/brand-settings`, and wire runtime CSS injection in `layout.tsx`. Seed
existing BBL/WEKAF colors from `styles.css`. Foundation for white-label wizard.

## Status

### Status: closed

## Bow-in

### Previous session

- SESSION_0290 (closed). Landed Thread-2 TASK_05/06: per-brand asset paths in
  `brandConfigs`, `resolvePublicMediaUrl`, brand-aware layout/logo/OG. D2 resolved.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `prisma/schema.prisma` (new model + OrgSettings extension), `app/layout.tsx` (CSS injection), `app/admin/` (new page) |
| Extension or replacement | **Extension** — new BrandSettings model, nullable theme fields on OrgSettings, new admin page |
| Why justified | Hardcoded CSS theme tokens block admin customization. DB-driven brand settings enable the white-label wizard without code deploys. |
| Risk if bypassed | Every brand color change requires a developer + deploy. No path to white-label self-service. |

### Graphify check

- Graph status: current (7397 nodes / 11977 edges / 1424 files).

## Petey plan

See [`petey-plan-0291.md`](petey-plan-0291.md) for full plan + decisions.

### Tasks

| ID | Status | Description | Agent |
| --- | --- | --- | --- |
| SESSION_0291_TASK_01 | done | BrandSettings model + OrgSettings theme fields + migration | Cody |
| SESSION_0291_TASK_02 | done | Server queries + actions for BrandSettings CRUD | Cody |
| SESSION_0291_TASK_03 | done | Admin brand-settings page with form | Cody |
| SESSION_0291_TASK_04 | done | Runtime CSS injection in layout.tsx | Cody |
| SESSION_0291_TASK_05 | done | Seed BrandSettings rows for BBL + WEKAF | Cody |
| SESSION_0291_TASK_06 | done | Verification — typecheck + biome clean | Doug |
| SESSION_0291_TASK_07 | done | White-label runbook update (stale entries) | Petey |

## Task log

### SESSION_0291_TASK_01 — BrandSettings model + OrgSettings extension

Added `BrandSettings` model to `prisma/schema.prisma` with `brand Brand @unique`, `primaryColor`, `primaryFgColor`, `accentColor`, `accentFgColor`, `logoUrl`, `faviconUrl`, `ogImageUrl` (all nullable). Extended `OrgSettings` with the same 7 nullable theme fields for future per-org white-label override. Migration `20260529162015_add_brand_settings_and_org_theme_fields` applied.

### SESSION_0291_TASK_02 — Server queries + actions

Created `server/admin/brand-settings/queries.ts` (`findBrandSettings`, `findAllBrandSettings`) and `server/admin/brand-settings/actions.ts` (`upsertBrandSettings` — upsert by brand enum, empty strings → null for DB storage).

### SESSION_0291_TASK_03 — Admin brand-settings page

Created `app/admin/brand-settings/page.tsx` with `withAdminPage` HOC. Shows all 4 brands with `BrandSettingsForm` — RHF + safe-action pattern, live color preview swatches, 4 color fields + 3 asset URL fields per brand.

### SESSION_0291_TASK_04 — Runtime CSS injection

Updated `app/layout.tsx` to query `findBrandSettings(brand)` and emit a `<style dangerouslySetInnerHTML>` tag with CSS custom property overrides when DB values exist. Falls back to `styles.css` static `[data-brand]` selectors when no DB row.

### SESSION_0291_TASK_05 — Seed BrandSettings

Created `scripts/seed-brand-settings.ts`. Seeded BBL (`primaryColor: "1 79% 51%"`, `accentColor: "51 100% 50%"`) and WEKAF (`primaryColor: "0 84% 50%"`) from existing `styles.css` values.

### SESSION_0291_TASK_06 — Verification

Typecheck clean (0 errors). Biome clean (1 line-length fix in `layout.tsx`).

### SESSION_0291_TASK_07 — White-label runbook update

Updated `docs/runbooks/white-label-site-runbook.md`: flipped Favicon/logo/wordmark to ✅ (SESSION_0290), Theme tokens to ✅ (SESSION_0291), added `findBrandSettings` + runtime CSS injection to brand-resolution layer table, updated RDD roadmap with brand assets + admin page status.

## What landed

- `BrandSettings` Prisma model (per-brand theme colors + asset URLs, `brand Brand @unique`)
- `OrgSettings` extended with 7 nullable theme override fields (white-label foundation)
- `server/admin/brand-settings/` — queries + upsert action
- `/admin/brand-settings` page — per-brand form with live color preview
- Runtime CSS injection in `layout.tsx` — DB-driven theme override
- BBL + WEKAF seed data from existing `styles.css` values
- White-label runbook updated (3 stale entries fixed)

## Files touched

- `apps/web/prisma/schema.prisma` — `BrandSettings` model + `OrgSettings` theme fields
- `apps/web/prisma/migrations/20260529162015_add_brand_settings_and_org_theme_fields/migration.sql`
- `apps/web/server/admin/brand-settings/queries.ts` — new
- `apps/web/server/admin/brand-settings/actions.ts` — new
- `apps/web/app/admin/brand-settings/page.tsx` — new
- `apps/web/app/admin/brand-settings/_components/brand-settings-form.tsx` — new
- `apps/web/app/layout.tsx` — runtime CSS injection
- `apps/web/scripts/seed-brand-settings.ts` — new
- `docs/runbooks/white-label-site-runbook.md` — updated
- `docs/sprints/petey-plan-0291.md` — new
- `docs/sprints/SESSION_0291.md` — new

## Decisions resolved

- **D5**: BrandSettings as standalone model (per-brand, `brand Brand @unique`), not extending Organization. Two-tier cascade: `styles.css → BrandSettings → OrgSettings`.
- **D6**: Color naming matches CSS custom properties: `primaryColor` → `--color-primary`, `primaryFgColor` → `--color-primary-foreground`, `accentColor` → `--color-accent`, `accentFgColor` → `--color-accent-foreground`.

## Open decisions / blockers

- **D7**: S3 bucket provisioning — deferred, operator task, needs AWS creds
- **D8**: Org-level theme admin UI — schema ready, UI deferred to next session
- **D9**: Wire DB `logoUrl`/`faviconUrl`/`ogImageUrl` into layout as override layer on top of `config/site.ts`

## Next session

- **Goal**: Playwright e2e test for brand-settings admin page + org-level theme admin UI + S3 bucket provisioning (if AWS creds ready)
- **Inputs to read**: `petey-plan-0291.md`, existing `e2e/admin/` test patterns, org settings page
- **First task**: Playwright e2e test — admin navigates to `/admin/brand-settings`, saves BBL colors, verifies runtime CSS injection on homepage
