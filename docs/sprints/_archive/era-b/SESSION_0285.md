---
title: "SESSION 0285 — Brand-aware page metadata + JSON-LD"
slug: session-0285
type: session--implement
status: closed
created: 2026-05-28
updated: 2026-05-28
last_agent: copilot-session-0285
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0284.md
  - docs/sprints/petey-plan-0285.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0285 — Brand-aware page metadata + JSON-LD

## Date

2026-05-28

## Operator

Brian + copilot-session-0285 (Petey orchestrating, Cody executing)

## Goal

Make page `og:site_name` and JSON-LD organization/website names brand-aware across all pages by brand-threading the two `lib/pages.ts` helpers — no per-page metadata logic duplicated. Execute petey-plan-0285.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0284.md`
- Carryover: SESSION_0284 converted 30/48 `siteConfig.name` refs to brand-aware. Remaining leak: `og:site_name` (from static `metadataConfig`) and JSON-LD org/website names (from `getOrganization()`/`getWebSite()`). Both funnel through `lib/pages.ts` helpers.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | content/SEO (metadata pipeline), theming (brand chrome) |
| Extension or replacement | Extension — brand-threads existing Dirstarter metadata pipeline |
| Why justified | White-label SaaS demo (RDD) and BBL launch require per-brand og:site_name + JSON-LD |
| Risk if bypassed | All brand subpages leak "Baseline Martial Arts" in og:site_name + JSON-LD |

### FAILED_STEPS check

- FS-0001/0008/0014 (L1 component gate): N/A — no UI components this session
- No open/mitigated entries in the metadata/SEO area

## Petey plan

Pre-staged: `docs/sprints/petey-plan-0285.md`. Three tasks:

1. SESSION_0285_TASK_01 — Brand-thread the central metadata/JSON-LD helpers (Cody)
2. SESSION_0285_TASK_02 — Await the 46 callers (Cody)
3. SESSION_0285_TASK_03 — Verify brand isolation (Doug)

## Task log

| ID | Status | Description |
| --- | --- | --- |
| SESSION_0285_TASK_01 | ✅ done | Brand-thread metadata/JSON-LD helpers |
| SESSION_0285_TASK_02 | ✅ done | Await 46 callers |
| SESSION_0285_TASK_03 | ✅ done | Verify brand isolation (typecheck + biome clean) |

## What landed

- `config/metadata.ts`: new `getMetadataConfig(brand?)` function; `metadataConfig` retained as deprecated fallback.
- `lib/structured-data.ts`: `getOrganization(brand?)` and `getWebSite(brand?)` resolve brand name via `getBrandSiteConfig`.
- `lib/pages.ts`: `getPageData` and `getPageMetadata` are now `async`, internally call `getRequestBrand()`, thread brand to metadata + JSON-LD.
- 46 page files: added `await` to all `getPageData`/`getPageMetadata` calls.
- Typecheck: 0 errors. Biome: clean on touched core files.

## Files touched

- `apps/web/config/metadata.ts`
- `apps/web/lib/pages.ts`
- `apps/web/lib/structured-data.ts`
- 46 `apps/web/app/(web)/**/page.tsx` files (await added)
- `docs/sprints/SESSION_0285.md`

## Decisions resolved

- Central async brand resolution: helpers resolve brand internally (no per-page brand plumbing needed).
- Deprecated `metadataConfig` export kept for backward compat; new code uses `getMetadataConfig(brand)`.

## Open decisions / blockers

- Per-brand `url`/`email`/`domain` in JSON-LD (deferred — name only this session).
- Dev server smoke on `bbl.local` not performed (TASK_03 verified via typecheck + static analysis; manual smoke deferred to next session or deploy preview).

## Next session

### Goal

BBL assets → S3 + media-upload CRUD improvement (or manual `bbl.local` smoke to confirm the og:site_name + JSON-LD fix end-to-end).

### Inputs to read

- `docs/runbooks/white-label-site-runbook.md` (flip og:site_name + JSON-LD rows to ✅)
- `docs/architecture/program-plan.md` S6 scope
- SESSION_0285 (this file)

### First task

Start dev server, hit `bbl.local:3000/about` — confirm `og:site_name` = "Black Belt Legacy" and JSON-LD org/website name = "Black Belt Legacy". Flip the runbook audit rows.

## Reflections

- The petey-plan-0285 was extremely well-scoped. Entire execution (3 core files + 46 mechanical awaits) took one commit, zero errors. Pre-writing plans pays off massively for mechanical refactors.
- `sed` was the right tool for the 46-file await addition — no risk of typos, deterministic, and verifiable via grep afterward.
- The `getRequestBrand()` call inside the helpers means no caller needs to change its interface — the async ripple is the only visible change at call sites.
