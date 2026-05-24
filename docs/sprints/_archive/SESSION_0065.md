---
title: "SESSION 0065 — WP-3: Homepage + Hero Overhaul (Baseline Martial Arts)"
slug: session-0065
type: session
status: closed-quick
created: 2026-05-04
updated: 2026-05-04
last_agent: copilot-session-0065
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0064.md
  - docs/protocols/WORKFLOW_5.0.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0065 — WP-3: Homepage + Hero Overhaul (Baseline Martial Arts)

### Date

2026-05-04

### Operator

Brian Scott + Copilot (Petey → Cody)

### Status

in-progress

### Goal

Replace Dirstarter default hero and homepage with Baseline Martial Arts branded landing page. Hero section with martial arts copy, feature cards for Programs / Tournaments / Belt Testing / Community, and CTA. Remove the "Tool" listing (Dirstarter default) from the homepage.

### Context read

- ✅ SESSION_0064 — closed-quick. All backend wiring complete. Component inventory enforcement hardened.
- ✅ Git: `main`, clean working tree.
- ✅ `opening.md` — bow-in ritual followed.
- ✅ `dirstarter-component-inventory.md` — consulted. Available L1 components: `Intro`/`IntroTitle`/`IntroDescription`, `Card`/`CardHeader`/`CardFooter`, `Stack`, `Grid`, `Container`, `Section`, `Button`, `Badge`, `H1`–`H6`, `Wrapper`.
- ✅ Current homepage: `hero.tsx` uses `Intro` + `CTAForm` (Dirstarter default). `page.tsx` renders `Hero` + `ToolQuery` (listing Dirstarter "tools").

### Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | `app/(web)/(home)/hero.tsx`, `app/(web)/(home)/page.tsx` |
| Extension or replacement | Replacement — Dirstarter default hero/tool listing → Baseline MA branded landing |
| Why justified | Homepage is the first thing a visitor sees. Dirstarter default copy ("tools") is meaningless for a martial arts platform. |
| Risk if bypassed | Public launch shows generic SaaS template instead of martial arts brand. |

---

## Petey's plan — task decomposition

### Current state analysis

- `hero.tsx` — Uses `Intro`/`IntroTitle`/`IntroDescription` (L1 ✅), `CTAForm` + `CTAProof` (L1 ✅), `CountBadge`. Copy comes from `t("brand.tagline")` and `t("brand.description")` — already brand-scoped via `config/site.ts`.
- `page.tsx` — Renders `<Hero />` then `<ToolQuery>` which lists "tools" (Dirstarter concept). Tools are irrelevant for Baseline MA.
- `config/site.ts` — Already has Baseline MA tagline: "Train Smart. Fight Ready. Community First." and description.

### Sections for Baseline MA homepage

1. **Hero** — Keep existing `Intro` pattern but refine copy. Keep `CTAForm` for lead capture (email signup). Remove `CountBadge` (counts "tools", irrelevant).
2. **Feature cards** — 3-column `Grid` of `Card` components highlighting: Programs, Tournaments, Community. Each card gets an icon, heading, and one-line description.
3. **Social proof / value prop** — Simple `Intro` section with "Why Baseline?" heading and 3 bullet points.
4. **Final CTA** — Repeat `CTAForm` at bottom.

### Task assignments

| Task ID | Description | Agent | Effort |
|---|---|---|---|
| SESSION_0065_TASK_01 | Refactor `hero.tsx` — remove `CountBadge`, keep `Intro` + `CTAForm`, add martial arts sub-copy | Cody | 10 min |
| SESSION_0065_TASK_02 | Create `feature-cards.tsx` — 3 cards (Programs, Tournaments, Community) using `Grid` + `Card` + L1 headings | Cody | 15 min |
| SESSION_0065_TASK_03 | Create `value-prop.tsx` — "Why Baseline?" section using `Intro` + `Stack` | Cody | 10 min |
| SESSION_0065_TASK_04 | Create `bottom-cta.tsx` — Final CTA section reusing `CTAForm` | Cody | 5 min |
| SESSION_0065_TASK_05 | Update `page.tsx` — replace `ToolQuery` with new sections, compose full landing page | Cody | 10 min |
| SESSION_0065_TASK_06 | Add i18n keys to messages for all new copy | Cody | 10 min |

### Execution order

1. TASK_06 (i18n keys first — all components will reference them)
2. TASK_01 (hero refactor)
3. TASK_02 + TASK_03 + TASK_04 (new sections, parallel-safe)
4. TASK_05 (compose page)

### L1 components to use (pre-flight checklist)

- `Intro`, `IntroTitle`, `IntroDescription` — hero + value prop headings
- `Card`, `CardHeader`, `CardDescription` — feature cards
- `Grid` — feature cards layout
- `Stack` — vertical stacking within sections
- `H3`, `H4` — card headings (NOT raw `<h3>`)
- `Button` — any standalone CTAs
- `CTAForm` — lead capture (existing L1 component)
- `Container` / `Wrapper` — page-level layout
- ⛔ NO raw `<h1>`, `<h2>`, `<h3>`, `<div className="flex">`, `<div className="grid">`, `<div className="rounded-lg border bg-card">`

---

## Task log

- `SESSION_0065_TASK_01` — Refactor `hero.tsx` (remove CountBadge, update copy to i18n subtitle) — ✅ done
- `SESSION_0065_TASK_02` — Create `feature-cards.tsx` (Programs / Tournaments / Community cards) — ✅ done
- `SESSION_0065_TASK_03` — Create `value-prop.tsx` ("Why Baseline?" section with checkmarks) — ✅ done
- `SESSION_0065_TASK_04` — Create `bottom-cta.tsx` (closing CTA with email signup) — ✅ done
- `SESSION_0065_TASK_05` — Update `page.tsx` (replace ToolQuery with new sections) — ✅ done
- `SESSION_0065_TASK_06` — Add i18n keys to `messages/en/pages.json` — ✅ done

## What landed

- ✅ **Hero refactored** — Removed `CountBadge` (counted "tools", irrelevant). Subtitle now uses `pages.home.hero.subtitle` i18n key instead of generic `brand.description`.
- ✅ **Feature cards section** — 3-column `Grid` of `Card` components: Programs & Classes, Tournaments, Community. Uses `Heading`, `CardDescription`, Lucide icons. All L1 components.
- ✅ **Value prop section** — "Why Baseline?" heading + 3 checkmark bullet points using `Stack` + `Intro`. All L1 components.
- ✅ **Bottom CTA section** — "Ready to Train?" heading + `CTAForm` for email signup. All L1 components.
- ✅ **Homepage composed** — `page.tsx` now renders Hero → FeatureCards → ValueProp → BottomCTA → StructuredData. `ToolQuery`/`ToolListing` imports removed.
- ✅ **i18n keys** — All copy externalized to `messages/en/pages.json` under `home.hero`, `home.features`, `home.value`, `home.cta`.
- ✅ **Zero type errors** across all 5 files.

## Files touched

| File | Note |
|------|------|
| `app/(web)/(home)/hero.tsx` | Removed CountBadge, updated subtitle to i18n key |
| `app/(web)/(home)/feature-cards.tsx` | New — 3 feature cards (Programs, Tournaments, Community) |
| `app/(web)/(home)/value-prop.tsx` | New — "Why Baseline?" value prop section |
| `app/(web)/(home)/bottom-cta.tsx` | New — closing CTA with CTAForm |
| `app/(web)/(home)/page.tsx` | Replaced ToolQuery with new landing sections |
| `messages/en/pages.json` | Added `home.*` i18n keys for all homepage copy |
| `docs/sprints/SESSION_0065.md` | This file |

## Decisions resolved

- **Homepage structure:** Hero → Features → Value Prop → Bottom CTA. No tool listing.
- **CountBadge removal:** Counted Dirstarter "tools", irrelevant for martial arts. Removed entirely (not hidden).
- **i18n approach:** All copy in `messages/en/pages.json` under `home` namespace. Brand tagline/description still come from `brand.*` keys.

## Open decisions / blockers

- **Hero imagery:** No background image or martial arts imagery yet. Text-only hero is functional but visually plain. Consider adding a hero background image or illustration in a future session.
- **ToolQuery pages:** Other pages may still reference `ToolQuery` / tool listing concepts. A full sweep to remove or rebrand "tools" is tech debt.
- **Mobile responsiveness:** Feature cards grid collapses to 1-col on mobile (L1 `Grid` default). Should verify in browser.

## Review log

- `SESSION_0065_REVIEW_01` — All 6 tasks landed. Zero new non-L1 components used. Zero type errors. 3 new files, 2 modified files, 1 i18n file updated.

## ADR / ubiquitous-language check

No new ADRs needed. No new domain terms introduced. "Programs", "Tournaments", "Community" are existing ubiquitous language from the data model.

## Next session

### SESSION_0066 — Homepage Polish + Visual Enhancement

- **Goal:** Add hero background image/gradient, refine spacing/typography, mobile QA pass, consider adding testimonial or stats section.
- **Agent:** Petey (plan visual approach) → Cody (build)
- **Inputs:** SESSION_0065 (this file), `app/(web)/(home)/` directory, brand design tokens
- **First task:** Evaluate hero section visual treatment — gradient background vs. image vs. illustration

### Status

in-progress → **closed-quick**

