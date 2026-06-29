---
title: "Design System — 12-grid layout, golden ratio & visual hierarchy"
slug: design-system-grid-ratio-hierarchy
type: file
status: active
lifecycle: active
created: 2026-06-21
updated: 2026-06-21
author: Brian + Desi
last_agent: claude-session-0421
pairs_with:
  - docs/knowledge/wiki/files/bbl-type-system.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - design-system
  - layout
  - grid
  - golden-ratio
  - visual-hierarchy
  - desi
---

# Design System — 12-grid, golden ratio & visual hierarchy

> **Absorbed into [`design-system-doctrine.md`](../design-system-doctrine.md) §3–§5** (ratified by
> [ADR 0040](../../../architecture/decisions/0040-design-system-doctrine-and-card-architecture.md)).
> The doctrine is canon; this file remains the detailed working notes for the grid/ratio/hierarchy layer.

> The **layout + proportion + hierarchy** layer of the design system. Complements the canonical
> token set + 1-2-3 rhythm + 4px spacing scale in `component-design-system` (lands with PR #137)
> and the type ladder in [`bbl-type-system`](bbl-type-system.md). PWCC: TBD (slot into the spec
> catalog when PR #137 lands — don't pre-assign and collide with that branch's numbering).

## 1 — The 12-column grid (structure)

- **Container:** `max-w-6xl` (~1152px) centered, responsive padding `px-4 sm:px-6 lg:px-10` (matches the BBL footer/landing).
- **Grid:** `grid grid-cols-12 gap-6` on desktop; **collapse to 1 column on mobile** (`grid-cols-1 md:grid-cols-12`).
- **Canonical spans:**
  - content + sidebar → **8 / 4** (the existing `Section.Content` / `Section.Sidebar`).
  - even pair → 6 / 6; triple → 4 / 4 / 4; feature row → 3 / 3 / 3 / 3.
- **Rule:** every block snaps to the 12-grid. Mobile (≤390px) = single column, full-width cards
  (`min-w-0`, no fixed widths) — the SESSION_0337 overflow lesson.

## 2 — Golden ratio (proportion, where the grid doesn't dictate)

φ ≈ **1.618**. The grid handles *structure*; φ handles *proportion* on free elements:

- **Hero / media aspect:** φ:1 (e.g. `aspect-[1.618/1]`) for hero panels and card imagery.
- **Asymmetric splits:** when not a clean grid pair, favor the φ split (~62% / 38%) over 50/50 — it
  reads as "designed," not "centered." (The 8/4 grid span ≈ 2:1 is the structural approximation; use
  true φ for standalone two-pane layouts.)
- **Vertical rhythm:** section-to-section gaps step by φ at the macro scale (`space-y-16` → `space-y-20`
  on `md`, as on `/about`). **Keep the 4px scale for component-internal spacing** — do not
  double-systematize; φ is for macro proportion only.

## 3 — Visual hierarchy (the ladder + levers)

Canonical type ladder (from `components/common/heading.tsx`; defer to [`bbl-type-system`](bbl-type-system.md) for tokens):

| Role | Class | Use |
| --- | --- | --- |
| Eyebrow | `text-xs uppercase tracking-[0.18em] text-primary font-semibold` | section kicker |
| `H1` | `text-3xl md:text-4xl` semibold (gradient) | page title — **one per view** |
| `H2` | `text-2xl md:text-3xl` | section title |
| `H3` | `text-2xl` · `H4` `text-xl` | sub-sections |
| Body | `text-base text-muted-foreground` | prose |
| Meta/label | `text-sm` / `text-xs` `text-muted-foreground` | captions, badges |

**Levers (use in this order):** size → weight → color (`foreground` vs `muted-foreground` vs
`primary`) → space → tracking. **Canonical rhythm:** eyebrow → title → body → **one primary CTA**
(`Button variant="primary"`); everything else `secondary`/`ghost`. One primary action per view.

## 4 — Card visual hierarchy (`m-card` anatomy)

Distilled from the "Burrito Bowl" card progression (a compact text card → the same card enriched with
a hero image). The rules `m-card` should encode (BBL tokens, but the hierarchy is universal):

- **One focal value per card.** Exactly one element gets accent + emphasis (the `$32.45` in blue →
  for us, `text-primary`). The eye lands once. Everything else is identity or supporting meta.
- **Identity cluster reads as one unit:** leading icon/avatar + title + secondary meta (date/time)
  stacked, left-aligned; the focal value right-aligned on the same baseline.
- **Progressive enrichment, one component.** The *same* card data renders **compact** (text-only) or
  **rich** (+ hero image) by a `density`/`variant` prop — never fork into two components. This is the
  same seam as `DataSelect`'s `content?: ReactNode` and the `/changelog` optional-note row.
- **Supporting rows use the connector motif.** Sequential rows (origin → destination, pin-to-pin
  dotted line) reuse the **lineage timeline-tree connector idiom** — don't reinvent it.
- **Secondary meta is muted** (`text-muted-foreground`, `text-sm`/`xs`) and never competes with the
  title or the focal value.
- **Map to the ladder:** title = `H4`/`font-semibold`; focal value = `text-primary` emphasized;
  meta/timestamps = `text-sm text-muted-foreground`.

> Authoring note: an "easy author" card-builder (cf. *iseazy author*) is the right north star for the
> AdminTaskBoard/content lane — author a card by filling the anatomy above, never by writing markup.

## 5 — Desi sweep checklist (audit any surface against this)

- [ ] Every block snaps to the 12-grid; container is `max-w-6xl` with the standard padding.
- [ ] Mobile collapses to 1 column; no fixed widths; cards `min-w-0`.
- [ ] Two-pane / hero proportions use φ (or the 8/4 grid), not 50/50 by default.
- [ ] Exactly **one `H1`** and **one primary CTA** per view.
- [ ] Each card has **one focal value** (accent) + an identity cluster + muted secondary meta (§4).
- [ ] Type follows the ladder; no ad-hoc sizes; hierarchy reads in a 3-second squint test.
- [ ] Color does hierarchy work (`muted-foreground` for secondary), not just decoration.
- [ ] Spacing is on the 4px scale (component) / φ (macro); no magic numbers.
- [ ] Contrast meets WCAG AA; dark/light both pass.

> Run this sweep on a surface by diffing its computed classes against the ladder + grid above
> (curl the SSR HTML or inspect the live DOM — don't eyeball mid-compile; SESSION_0396 lesson).
