---
title: "SESSION 0283 — BBL brand smoke: exact token, brand-aware metadata & ads"
slug: session-0283
type: session--implement
status: closed
created: 2026-05-28
updated: 2026-05-28
last_agent: copilot-session-0283
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0282.md
  - docs/architecture/decisions/0022-brand-chrome-resolution.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0283 — BBL brand smoke: exact token, brand-aware metadata & ads

## Date

2026-05-28

## Operator

Brian + copilot-session-0283 (Petey orchestrating, Cody executing)

## Goal

Fix BBL primary color to exact `#E52421` from monorepo design tear sheet, make `og:site_name` and ad labels brand-aware, and complete browser smoke on `bbl.local:3000`.

## Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `styles.css` (brand tokens), `layout.tsx` (metadata), `server/web/ads/actions.ts` (ad labels), `app/(web)/(home)/page.tsx` (structured data title) |
| Extension or replacement | Extension — brand-aware overrides on existing Dirstarter patterns |
| Why justified | SESSION_0282 left the exact BBL hex unconfirmed and ad/meta surfaces still showed "Baseline Martial Arts" on `bbl.local` |
| Risk if bypassed | BBL launch surfaces show wrong brand name and approximate color |

## Task log

| ID | Owner | Status | Notes |
| --- | --- | --- | --- |
| SESSION_0283_TASK_01 | Cody | complete | Fixed BBL CSS token to exact `#E52421` = `hsl(1 79% 51%)`, added accent gold `#FFD700` |
| SESSION_0283_TASK_02 | Cody | complete | Made `og:site_name` brand-aware in `generateMetadata` |
| SESSION_0283_TASK_03 | Cody | complete | Made ad default `buttonLabel` brand-aware via `getRequestBrand()` |
| SESSION_0283_TASK_04 | Cody | complete | Made home page structured data title brand-aware |

## What landed

- `apps/web/app/styles.css` — BBL primary corrected to `hsl(1 79% 51%)` (#E52421), accent gold added `hsl(51 100% 50%)` (#FFD700)
- `apps/web/app/layout.tsx` — `og:site_name` now reads `brandConfig.name` instead of static `siteConfig.name`
- `apps/web/server/web/ads/actions.ts` — ad default `buttonLabel` uses `getBrandSiteConfig(brand).name`
- `apps/web/app/(web)/(home)/page.tsx` — home page title uses brand name

## Files touched

| Path | Note |
| --- | --- |
| `apps/web/app/styles.css` | BBL token correction + accent gold |
| `apps/web/app/layout.tsx` | Brand-aware og:site_name |
| `apps/web/server/web/ads/actions.ts` | Brand-aware ad label |
| `apps/web/app/(web)/(home)/page.tsx` | Brand-aware home title |
| `docs/sprints/SESSION_0283.md` | This session |

## Verification

| Check | Result |
| --- | --- |
| `data-brand="BBL"` | ✅ Present on `<html>` |
| `<title>` | ✅ "Honor the Lineage. Build the Future. – Black Belt Legacy" |
| Header logo text | ✅ "Black Belt Legacy" |
| `og:site_name` | ✅ "Black Belt Legacy" (was "Baseline Martial Arts") |
| Ad button labels | ✅ "Advertise on Black Belt Legacy" (was "Advertise on Baseline Martial Arts") |
| Home page title | ✅ "Black Belt Legacy - …" (was "Baseline Martial Arts - …") |
| BBL primary CSS token | ✅ `hsl(1 79% 51%)` = exact `#E52421` from monorepo design tear sheet |
| Remaining "Baseline" refs | 4 — all in JSON-LD structured data (`lib/structured-data.ts`), not user-visible. Documented as follow-up. |

## Browser smoke evidence

### bbl.local:3000 (home page)
- URL: `http://bbl.local:3000/`
- Header: "Black Belt Legacy" ✅
- Title: "Honor the Lineage. Build the Future. – Black Belt Legacy" ✅
- og:site_name: "Black Belt Legacy" ✅
- Ad CTAs: "Advertise on Black Belt Legacy" ✅
- Primary color: Red (#E52421) via CSS custom property ✅
- "Black Belt Legacy" count: 21 occurrences
- "Baseline Martial Arts" count: 4 (JSON-LD only, not user-facing)

## Open decisions / blockers

- **JSON-LD structured data:** `lib/structured-data.ts` `getOrganization()` and `getWebSite()` still use static `siteConfig.name`. Low priority — only affects search engine crawlers, not user-visible. Track for future session.
- **Other pages:** Many `app/(web)/*/page.tsx` files use `siteConfig.name` in metadata descriptions. Brand-aware metadata across all pages is a broader refactor for a future sprint.
- **Admin accent color picker:** Still a future feature candidate from SESSION_0282.

## Decisions resolved

- BBL exact hex confirmed: `#E52421` (BBL Red) from `DESIGN_SYSTEM_TEAR_SHEET_BLACKBELTLEGACY.md` in monorepo.
- Accent gold: `#FFD700` (Achievement Gold) — added as CSS token for future use.

## Hostile close review

- Dirstarter alignment: maintained — all changes are brand-aware extensions of existing patterns.
- Security/data integrity: unaffected — no auth, schema, or payment logic changes.
- Verification honesty: browser smoke confirmed via `curl` on live dev server with `bbl.local` host routing.
- Score cap: not applied.

## Reflections

- Finding the exact BBL hex required accessing the old monorepo design tear sheet — this kind of cross-repo design-token lookup should be documented in the brand config file itself to avoid future hunts.
- The `siteConfig.name` static export pattern creates a long tail of brand-unaware surfaces. A systematic audit + refactor to use `brandConfig.name` everywhere would be valuable but is a larger effort.

## Next session

**Goal:** Systematic audit of `siteConfig.name` usage across all page metadata — replace with brand-aware `getBrandSiteConfig(brand).name` where server context is available.

**Inputs to read:**
- `docs/sprints/SESSION_0283.md`
- `grep -rn "siteConfig.name" apps/web/` output

**First task:** Create a checklist of all `siteConfig.name` occurrences and categorize as brand-aware-possible vs static-only.
