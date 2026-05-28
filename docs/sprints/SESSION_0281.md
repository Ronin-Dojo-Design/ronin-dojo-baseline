---
title: "SESSION 0281 — Wire BBL brand chrome"
slug: session-0281
type: session--open
status: in-progress
created: 2026-05-28
updated: 2026-05-28
last_agent: copilot-session-0281
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0280.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0281 — Wire BBL brand chrome

## Date

2026-05-28

## Operator

Brian + copilot-session-0281 (Petey orchestrating, Cody executing)

## Goal

Wire BBL brand chrome (header, footer, theme tokens) so `bbl.local` shows "Black Belt Legacy" instead of "Baseline Martial Arts."

## Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Theming — brand-aware chrome in Dirstarter shell components (header, footer, logo) |
| Extension or replacement | Extension — adding brand-aware rendering to existing Dirstarter layout components |
| Why justified | SESSION_0280 smoke test confirmed header shows wrong brand name on bbl.local; must resolve before launch |
| Risk if bypassed | BBL users see "Baseline Martial Arts" branding — confusing, unprofessional, blocks BBL launch |

## Graphify note

Graphify CLI not available in sandbox. Used direct file access for brand-context.ts, proxy.ts, config/site.ts, header.tsx, footer.tsx, logo.tsx, styles.css, layout.tsx files identified from SESSION_0280 next-session inputs and code inspection.

## Petey plan

### Goal

Make the web shell (header, footer, logo, page title, theme colors) brand-aware so each brand domain renders its own name, tagline, and primary color.

### Tasks

#### SESSION_0281_TASK_01 — Create BrandProvider context

Create `contexts/brand-context.tsx` with a React context + `useBrand()` hook. The server layout resolves the brand via `getRequestBrand()` and passes it as a prop; the provider makes it available to all client components.

- Owner: Cody
- Done: `useBrand()` returns the current `Brand` enum in any client component

#### SESSION_0281_TASK_02 — Wire brand into Logo, Header, Footer

- Update `Logo` to accept brand or read from `useBrand()` and display the correct name via `getBrandSiteConfig()`
- Update `Header` "Join Legacy" CTA text to be brand-aware
- Update `Footer` to use brand-aware config for email/links
- Owner: Cody
- Done: `bbl.local` header shows "Black Belt Legacy", footer shows BBL info

#### SESSION_0281_TASK_03 — Add BBL theme CSS tokens

Add `[data-brand="BBL"]` CSS custom property overrides in `styles.css` so BBL gets its own primary color (gold/black theme).

- Owner: Cody
- Done: BBL primary color differs from Baseline blue

#### SESSION_0281_TASK_04 — Wire server layout → BrandProvider

Update `app/layout.tsx` to call `getRequestBrand()` and wrap children in `<BrandProvider>`. Add `data-brand` attribute to `<html>` element for CSS targeting.

- Owner: Cody
- Done: `data-brand="BBL"` appears on `<html>` when visiting `bbl.local`

#### SESSION_0281_TASK_05 — ADR + close

Write ADR for brand chrome resolution pattern. Full close.

- Owner: Petey
- Done: ADR committed, session closed

### Risks

- Graphify unavailable — used direct file access instead
- No dev server to smoke test in sandbox — changes are code-verified only

### Dependencies

- Brand resolution already works (proxy.ts → brand-context.ts) ✅
- `getBrandSiteConfig()` already has BBL config ✅
- `siteConfig` static export is the only thing blocking brand-awareness ✅

## Task log

| ID | Owner | Status | Notes |
| --- | --- | --- | --- |
| SESSION_0281_TASK_01 | Cody | pending | BrandProvider context |
| SESSION_0281_TASK_02 | Cody | pending | Wire brand into shell components |
| SESSION_0281_TASK_03 | Cody | pending | BBL theme CSS tokens |
| SESSION_0281_TASK_04 | Cody | pending | Server layout → BrandProvider |
| SESSION_0281_TASK_05 | Petey | pending | ADR + close |
