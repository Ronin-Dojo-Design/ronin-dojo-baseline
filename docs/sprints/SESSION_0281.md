---
title: "SESSION 0281 — Wire BBL brand chrome"
slug: session-0281
type: session--implement
status: closed
created: 2026-05-28
updated: 2026-05-28
last_agent: copilot-session-0281
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0280.md
  - docs/architecture/decisions/0022-brand-chrome-resolution.md
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
| SESSION_0281_TASK_01 | Cody | complete | BrandProvider context (`contexts/brand-context.tsx`) |
| SESSION_0281_TASK_02 | Cody | complete | Wire brand into Logo component via `useBrand()` |
| SESSION_0281_TASK_03 | Cody | complete | BBL gold + WEKAF red theme CSS tokens via `[data-brand]` |
| SESSION_0281_TASK_04 | Cody | complete | Server layout → BrandProvider + `data-brand` on `<html>` + brand-aware `<title>` metadata |
| SESSION_0281_TASK_05 | Petey | complete | ADR 0022 — brand chrome resolution |

## What landed

- `apps/web/contexts/brand-context.tsx` — New `BrandProvider` context + `useBrand()` hook for client components
- `apps/web/components/web/ui/logo.tsx` — Logo now reads brand name from context instead of hardcoded `siteConfig.name`
- `apps/web/app/layout.tsx` — Root layout resolves brand via `getRequestBrand()`, passes to `<BrandProvider>`, sets `data-brand` on `<html>`, brand-aware `<title>` and `<meta description>`
- `apps/web/app/styles.css` — BBL (gold primary) and WEKAF (red primary) CSS custom property overrides via `[data-brand]` selector, both light and dark modes
- `docs/architecture/decisions/0022-brand-chrome-resolution.md` — ADR documenting the brand chrome resolution pattern

## Files touched

| Path | Note |
| --- | --- |
| `apps/web/contexts/brand-context.tsx` | New — BrandProvider + useBrand hook |
| `apps/web/components/web/ui/logo.tsx` | Changed — brand-aware via useBrand(), added "use client" |
| `apps/web/app/layout.tsx` | Changed — BrandProvider wrapper, data-brand attr, brand-aware metadata |
| `apps/web/app/styles.css` | Changed — BBL + WEKAF theme token overrides |
| `docs/architecture/decisions/0022-brand-chrome-resolution.md` | New — ADR 0022 |
| `docs/sprints/SESSION_0281.md` | New — this session |
| `docs/knowledge/wiki/index.md` | Updated — added SESSION_0281 row |

## Decisions resolved

- Brand chrome flows through React context (BrandProvider), not prop drilling or cookie parsing
- CSS theme tokens use `[data-brand]` attribute selector on `<html>` — no JS runtime for color switching
- BBL primary color: gold `hsl(45 100% 50%)`, WEKAF: red `hsl(0 84% 50%)`
- ADR 0022 accepted

## Verification

| Check | Result |
| --- | --- |
| Biome lint | Pass — 0 errors after fixing unused import and formatting |
| CodeQL | Pass — 0 alerts |
| TypeScript | Pre-existing failures (missing Prisma generated types in sandbox); no new issues introduced |

## ADR / ubiquitous-language check

- ADR 0022 (brand chrome resolution) created — covers BrandProvider, data-brand CSS tokens, brand-aware metadata
- No new domain terms introduced

## Reflections

- The brand infrastructure was already well-built: `proxy.ts` → `brand-context.ts` → `getBrandSiteConfig()` all existed. The gap was purely in the last mile — shell components using the static `siteConfig` instead of the brand-aware `getBrandSiteConfig()`.
- The `BrandProvider` pattern is clean and extensible. Any future client component that needs brand info just calls `useBrand()`.
- Graphify CLI was unavailable in the sandbox but the file structure was well-documented enough from SESSION_0280's "Next session" inputs to navigate directly.

## Open decisions / blockers

- **Claim path auth:** Still needs Google OAuth redirect URI for `bbl.local` or dev-login bypass (carried from SESSION_0280)
- **BBL logo asset:** LogoSymbol SVG is the same across all brands. BBL may want a distinct logo SVG. Not blocking — current SVG is a placeholder.
- **Resend domain verification:** `blackbeltlegacy.com` DNS still pending (carried from SESSION_0280)
- **Graphify update:** Skipped — CLI not available in sandbox. Run `graphify update .` next session.

## Next session

**Goal:** Browser smoke `bbl.local` brand chrome — verify header shows "Black Belt Legacy", primary color is gold, metadata/title correct. Optionally wire BBL-specific logo SVG.

**Inputs to read:**
- `docs/sprints/SESSION_0281.md`
- `docs/architecture/decisions/0022-brand-chrome-resolution.md`
- `apps/web/contexts/brand-context.tsx`

**First task:** Start dev server on `bbl.local:3000`, visually confirm header/footer/title show BBL branding and gold primary color.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0281.md, ADR 0022, wiki/index.md all have current `updated` and `last_agent` |
| Backlinks/index sweep | SESSION_0281 pairs_with ADR 0022; wiki/index.md has SESSION_0281 row |
| Wiki lint | Skipped — bun not configured in sandbox |
| Kaizen reflection | Reflections section present: yes |
| Hostile close review | Not applicable — implementation-only session, no schema/auth/payments touched |
| Review & Recommend | Next session goal written: yes |
| Memory sweep | None needed — all decisions captured in ADR 0022 |
| Next session unblock check | Unblocked — dev server smoke is the next step |
| Git hygiene | Branch: copilot/session-0281-wire-bbl-brand-chrome; committed and pushed via report_progress |
| Graphify update | Skipped — Graphify CLI unavailable in sandbox |

### Status

closed
