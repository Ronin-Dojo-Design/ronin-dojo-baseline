---
title: "Baseline Design System — Hub"
slug: baseline-design-system
type: runbook
status: active
created: 2026-05-29
updated: 2026-06-28
last_agent: claude-session-0467
pairs_with:
  - docs/knowledge/wiki/design-system-doctrine.md
  - docs/architecture/decisions/0022-brand-chrome-resolution.md
  - docs/runbooks/design/ui-library-candidates.md
  - apps/web/app/styles.css
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/runbooks/README.md
---

# Baseline Design System — Hub

> **Superseded as the design-system hub by [`design-system-doctrine.md`](../../knowledge/wiki/design-system-doctrine.md)**
> (ratified by [ADR 0040](../../architecture/decisions/0040-design-system-doctrine-and-card-architecture.md), SESSION_0467).
> This file is now the **Baseline-specific** runbook (Baseline tokens + the white-label override model);
> the cross-brand doctrine, all six tear sheets, the card architecture, and the kernel boundary live in the
> doctrine. The legacy `docs/_imports/monorepo-design-system/` corpus referenced below was **deleted as
> confidently-wrong** (gold BBL, a `useDesignSystem()` hook) — derive only from the live app + the doctrine.

## Summary

The single reference for Baseline Martial Arts' design tokens, type/spacing scales, component
idioms, and the multi-brand override model. Baseline is **dirstarter-derivative and intentionally
minimal** — it is the clean **Ronin Dojo Design (RDD) white-label boilerplate** that every future
white-labeled client site forks from. The richer Tuff Buffs / BBL / WEKAF token systems
(see the [doctrine tear sheets](../../knowledge/wiki/design-system-doctrine.md)) are the **eventual visual reference**, layered on later
to demonstrate RDD's customization capability — they are *not* applied to Baseline today.

**Token architecture is frozen** under [ADR 0022 — Brand Chrome Resolution](../../architecture/decisions/0022-brand-chrome-resolution.md).
Do not introduce brand-specific tokens into Baseline ad hoc.

## Authority and scope

- **Live source of truth (code):** [`apps/web/app/styles.css`](../../../apps/web/app/styles.css) —
  Tailwind v4 `@theme` block. Identity strings: [`apps/web/config/site.ts`](../../../apps/web/config/site.ts) (`brandConfigs`).
- **Governing decision:** [ADR 0022](../../architecture/decisions/0022-brand-chrome-resolution.md) —
  `data-brand` attribute on `<html>`, CSS custom-property overrides per brand, `BrandProvider` context.
- **Cross-brand canon:** [`design-system-doctrine.md`](../../knowledge/wiki/design-system-doctrine.md) — the
  ratified doctrine with all six tear sheets derived from the live app (the legacy
  `_imports/monorepo-design-system/` corpus was deleted as wrong; do not look for it).

## Layering strategy (read this first)

**Baseline v1 (design-wise) = dirstarter base boilerplate + dirstarter extensions + (possibly)
bklit / trophy.so integrations.** The black / white / **blue** boilerplate palette stays as-is for
v1 — it is fine and intentional. v1 is *not* a custom brand build; it's the polished generic RDD
white-label, enriched with dirstarter extensions and optional UI-library integrations (see
[UI Library Integration Candidates](ui-library-candidates.md)).

| Phase | What | Why |
| --- | --- | --- |
| **Baseline v1 (now)** | Dirstarter base tokens (black / white / **blue** `hsl(234 98% 61%)`) + dirstarter extensions + possible bklit/trophy integrations. | This is the RDD white-label baseline. Keep the palette minimal; add capability via extensions, not brand color. |
| **Later** | Layer Tuff Buffs (and other brand) tokens on top. | The contrast between plain v1 boilerplate and a fully-branded build is the RDD customization demo / sales asset. |

**Do not pull Tuff Buffs colors into Baseline prematurely.** Audit and tighten consistency against
the *existing* minimal tokens. Tuff Buffs alignment is a separately-scoped later phase.

## Baseline tokens (current — from `app/styles.css`)

### Color (semantic, Tailwind v4 `@theme`)

| Token | Light | Dark | Usage |
| --- | --- | --- | --- |
| `--color-background` | `hsl(0 0% 100%)` | `hsl(0 0% 5%)` | Page background |
| `--color-foreground` | `hsl(0 0% 12%)` | `hsl(0 0% 90%)` | Body text |
| `--color-primary` | `hsl(234 98% 61%)` | `hsl(234 98% 61%)` | **Baseline blue** — CTAs, active states |
| `--color-primary-foreground` | `hsl(0 0% 98%)` | `hsl(0 0% 98%)` | Text on primary |
| `--color-secondary` | `hsl(0 0% 96%)` | `hsl(0 0% 10%)` | Secondary surfaces |
| `--color-muted` / `-foreground` | `hsl(0 0% 96%)` / `45.1%` | `hsl(0 0% 10%)` / `60%` | Muted surfaces / metadata text |
| `--color-accent` / `-foreground` | `hsl(0 0% 96%)` / `9%` | `hsl(0 0% 10%)` / `90%` | Accent surfaces |
| `--color-card` / `-foreground` | `hsl(0 0% 98%)` / `12%` | `hsl(0 0% 8%)` / `90%` | Cards |
| `--color-border` / `--color-input` | `hsl(0 0% 88%)` | `hsl(0 0% 15%)` | Borders / input borders |
| `--color-ring` | `hsl(0 0% 83%)` | `hsl(0 0% 20%)` | Focus ring |
| `--color-destructive` / `-foreground` | `hsl(0 84.2% 60.2%)` / `98%` | `hsl(0 62.8% 30.6%)` / `98%` | Errors / danger |
| `--color-chart-1..5` | see file | see file | Data viz |

**Rule:** consume tokens via semantic Tailwind classes (`bg-primary`, `text-muted-foreground`,
`border-border`, `bg-card`, `text-destructive`). **No raw hex / `rgb()` / `text-[#...]` / `bg-[#...]`**
in public pages — that is the #1 drift this design review hunts for.

### Brand overrides (`[data-brand]`)

Baseline = the default token set (no `data-brand` block). Other brands override `--color-primary` /
`--color-accent` only:

- `[data-brand="BBL"]` → primary `hsl(1 79% 51%)` (BBL red `#E52421`); accent inherits the base neutral token — **no gold** (deep-black surfaces; gold was a wrong-tear-sheet import, corrected SESSION_0357).
- `[data-brand="WEKAF"]` → primary `hsl(0 84% 50%)` (red).

Both have `.dark` parity blocks. Adding a brand: (1) `Brand` enum in Prisma, (2) host map in
`brand-context.ts`, (3) config in `config/site.ts`, (4) optional `[data-brand]` tokens here.

> **Runtime override — brand color SoT is the DB, not this file (SESSION_0357).** These `styles.css`
> blocks are the **fallback**. The live source of truth is the **`BrandSettings` DB table**, injected by
> `app/layout.tsx` as a `<style>` that overrides `styles.css` (admin-editable per brand — first-party
> included — by design, so white-label clients tune colors without a deploy). **If a color looks wrong on
> a live page but `styles.css` looks right, check `BrandSettings` + `scripts/seed-brand-settings.ts` — the
> DB wins.** (The BBL "gold accent" bug was a wrong seeded DB value, not a CSS bug.)

### Typography

- `--font-sans` / `--font-display` — both map to the app sans var (Geist). Display = sans today;
  a distinct display face is a future brand-layer decision.
- `--text-5xl` overridden to `2.75rem`; `--tracking-micro: -0.0125em`. Otherwise Tailwind default scale.

### Spacing & layout

- Fluid spacing tokens: `--spacing-fluid-xs|sm|md|lg|xl` (clamp-based, responsive). Prefer these for
  section rhythm over ad-hoc margins.
- Responsive grid templates: `--grid-template-columns-2xs..2xl` (`auto-fill` `minmax` patterns) for card grids.
- Header geometry tokens: `--header-height`, `--header-*-offset`, `--sidebar-max-height`.

### Motion

`--animate-fade-in`, `--animate-ping`, `--animate-reveal` (scroll-driven via `view()`),
`--animate-accordion-up/down`. Global `a/button` ease-out 100ms, underline-offset, cursor rules in `@layer base`.

## Component idioms

- **Compose Dirstarter L1 primitives** (Button, Card, Stack, Filters/Sort, etc.) — never build scratch
  HTML where a primitive exists (see [FS-0001](../../protocols/failed-steps-log.md)).
- Icons: Lucide, auto-sized to `1em` and stroke `1.75` via base layer; arrow icons get hover-translate idioms.
- `prose` utility extends Tailwind Typography with heading-anchor affordances.

## Brand token canon (reference only — derived from live canon)

> These are the **later** alignment targets, not current Baseline tokens. Full per-brand tear sheets (BBL,
> Baseline, Mammoth, Tuff Buffs, WEKAF + the Ronin umbrella) live in
> [`design-system-doctrine.md` §7](../../knowledge/wiki/design-system-doctrine.md).

| Brand | Primary | Secondary / Accent | Notes |
| --- | --- | --- | --- |
| **Tuff Buffs** (CU) | `cu-gold #CFB87C` | black `#000`, dark-gray `#434343` | Eventual Baseline visual reference. Helvetica Neue display. Pre-sprint token score 7.9→9.0. |
| **Black Belt Legacy** | `bbl-red #E52421` | neutral/dark — deep-black surfaces (**no gold**) | Poppins headings / Inter body. Italic-uppercase hero. Maps to `[data-brand="BBL"]`. Gold `#FFD700` was a wrong-tear-sheet import (corrected SESSION_0357). |
| **WEKAF USA** | `wekaf-red #BF0A30` | blue `#002868`, gold `#FCD116` | Filipino-flag palette, gradient surfaces. Maps to `[data-brand="WEKAF"]`. |

Recurring lessons from the legacy tear sheets worth carrying into Baseline now:

- **Focus-visible discipline** was the single largest polish gap in the legacy build (5/81 files
  covered pre-sprint). Baseline should keep `focus-visible` on every interactive control from the start.
- **Token-first, no arbitrary hex** — the legacy "DON'T" list leads with "don't hardcode colors,
  spacing, or font sizes." Same rule here.
- **Loading states** — skeletons over spinners for list/card surfaces.

## Relationships

- [ADR 0022 — Brand Chrome Resolution](../../architecture/decisions/0022-brand-chrome-resolution.md) — token architecture.
- [UI Library Integration Candidates](ui-library-candidates.md) — bklit / trophy.so evaluation.
- [White-label site runbook](../deploy/white-label-site-runbook.md) — standing up a new brand site.
- [FAILED_STEPS log](../../protocols/failed-steps-log.md) — FS-0001 (compose L1, don't build scratch).

## Open questions

- When Tuff Buffs alignment begins: does Baseline keep blue as its own boilerplate identity while
  Tuff Buffs ships as a `[data-brand="TUFFBUFFS"]` overlay, or does Baseline rebrand to gold? (Defer.)
- Should `--font-display` diverge from `--font-sans` for stronger hierarchy at the Baseline layer?

## Sources

- [`design-system-doctrine.md`](../../knowledge/wiki/design-system-doctrine.md) — the ratified cross-brand canon (ADR 0040).
- `apps/web/app/styles.css`, `apps/web/lib/brand-theme.ts` + `BrandSettings` (DB), `apps/web/config/site.ts`, ADR 0022 (live repo).
- `packages/ui-kit/src/tokens/tokens.css` (kernel `--mk-*`), `clients/mammoth-build-crm/app/globals.css` (Mammoth).
