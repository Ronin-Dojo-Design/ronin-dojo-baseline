---
title: Lineage Carousel Rail Port Spec
slug: lineage-carousel-rail-port-spec
type: spec
status: draft
created: 2026-06-03
updated: 2026-06-03
last_agent: claude-session-0337
pairs_with:
  - docs/petey-plan-0337-lineage-responsive-carousel.md
  - docs/sprints/SESSION_0337.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - component-porting
  - lineage
  - carousel
---

# Lineage Carousel Rail — Port Spec

> Slice 3 / PORTMAP-0004 / SESSION_0337. Hard rule: **adapt, never port-verbatim** — take BBL
> `CarouselRail` BEHAVIOR and rebuild it on the existing Embla primitive. Reuse-before-port: there is
> already ONE carousel (`components/common/carousel.tsx`); we EXTEND it, we do not add a second.

```
┌─────────────────────────────────────────────────────────────────────┐
│ COMPONENT PORT SPEC                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ Component name: Carousel rail (dense-rail mode on Embla Carousel)   │
│ Old source ref: ronin-dojo-monorepo/src/brands/blackbeltlegacy/    │
│                  components/shared/CarouselRail.jsx                 │
│ Existing prim:  apps/web/components/common/carousel.tsx (~66 LOC,   │
│                  exports Carousel + CarouselSlide; Embla-backed)    │
│ Target file:    apps/web/components/common/carousel.tsx (EXTEND,    │
│                  back-compatible — same file, no new component)     │
│ Target route:   lineage rails (Slice 4) + any future rail consumer │
│ Strategy:       wrap/extend; adapt BBL behavior onto Embla.        │
└─────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────┐
│ Observed Behavior (BBL CarouselRail.jsx)                           │
├─────────────────────────────────────────────────────────────────────┤
│ - Scroller: flex gap-3 overflow-x-auto snap-x snap-mandatory.      │
│ - Items: flex-shrink-0 snap-start w-[248px] (caller-overridable    │
│   to 168 or 280px).                                                │
│ - Chevrons: hidden md:flex (desktop ≥ 768px only); shown ONLY      │
│   when the rail is scrollable; UNMOUNTED at the respective end     │
│   (no left chevron at start, no right chevron at end).            │
│ - Scroll-step on chevron click: Math.max(220, itemWidth + 12),    │
│   fallback 280; itemWidth measured off the first                  │
│   [data-carousel-item].                                           │
│ - Scrollability detection: scroll + resize listeners with a 4px   │
│   end dead-zone (treat within 4px of either end as "at end").     │
│ - Edge gradient fades: w-8 pointer-events-none, only when         │
│   scrollable (left fade hidden at start, right fade at end).      │
│ - role="region" + aria-label on the rail wrapper.                 │
│ - Empty-state slot: when there are no items, render the supplied  │
│   empty node and NO rail (no scroller, no chevrons).             │
└─────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────┐
│ Rebuild Plan (primitives + delta + strategy)                       │
├─────────────────────────────────────────────────────────────────────┤
│ Already provided by Embla `Carousel`/`CarouselSlide`:              │
│   - snap + drag scrolling (Embla engine).                         │
│   - canScrollPrev/canScrollNext → chevrons already mount ONLY     │
│     when scrollable and unmount at the ends (lines 43–63).        │
│   - reInit hook already wired to `onSelect` (lines 30–35).        │
│   - CarouselSlide already a flex-[0_0_280px] sized slide.         │
│                                                                   │
│ Custom delta (extend the SAME file, back-compatible):             │
│   - CarouselSlide gains a `width`/basis prop → 168 | 248 | 280    │
│     (default 280, so existing callers are unchanged). Maps to     │
│     flex-[0_0_<n>px]; caller-overridable like BBL's w-[248px].   │
│   - `emptyState?: ReactNode` prop on Carousel → when children is  │
│     empty, render emptyState and skip the rail entirely.         │
│   - `role="region"` + `aria-label` props on the Carousel wrapper. │
│   - optional `edgeFades` flag → w-8 pointer-events-none gradients  │
│     mounted on the same canScrollPrev/canScrollNext conditions    │
│     that already gate the chevrons.                              │
│   - DELIBERATE IMPROVEMENT: a ResizeObserver on the viewport that │
│     calls emblaApi.reInit() so DYNAMIC content (filtered lists)   │
│     re-evaluates scrollability reliably. BBL relied on scroll +   │
│     resize listeners only and missed in-place content swaps —    │
│     this closes that portability gap (PORTMAP-0004 note).        │
│                                                                   │
│ Strategy: extend, never duplicate. Embla owns snap + step, so we  │
│   do NOT re-implement BBL's manual scroll-step or 4px dead-zone — │
│   that math is subsumed by Embla's snap targets. We adapt the     │
│   AFFORDANCES (sizing variants, empty slot, aria, fades, RO).    │
│                                                                   │
│ Back-compat: existing `Carousel` consumers (e.g. /courses) must   │
│   not regress — all new props are optional with prior defaults.   │
│   "Verify existing consumers" is a done-criterion (enumerate +    │
│   smoke each).                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

## Data shape this component consumes

Purely presentational — no domain payload. The rail is content-agnostic: callers pass `CarouselSlide`
children. Lineage callers (Slice 4) will pass member cards; belt colour inside those cards ALWAYS comes
from `Rank.colorHex` data, never a hardcoded belt map — but that colour resolution is the CALLER's
concern, not the rail's. The rail only needs:

```ts
// Conceptual — props delta on the existing Carousel/CarouselSlide
type CarouselExtras = {
  emptyState?: React.ReactNode  // rendered instead of the rail when no slides
  role?: "region"               // a11y landmark
  ariaLabel?: string            // required when role="region"
  edgeFades?: boolean           // mount w-8 gradient fades on scroll edges
}
type CarouselSlideExtras = {
  width?: 168 | 248 | 280       // flex-basis variant; default 280 (back-compat)
}
```

## Responsive behavior

- **Desktop ≥ md (768px):** chevrons mount (`hidden md:flex` idiom) when scrollable; edge fades (if
  enabled) mount on the scrollable edge; drag + snap active.
- **Mobile (< md):** chevrons suppressed (touch users swipe); snap-x keeps slides aligned; rail remains
  horizontally swipeable. Edge fades may stay (purely visual affordance).
- **Dynamic content:** filtering the slide set in place triggers the ResizeObserver `reInit`, so chevrons
  and fades recompute without a remount — the gap BBL's listener-only approach left open.

## Accessibility / keyboard

- Rail wrapper carries `role="region"` + a meaningful `aria-label` (e.g. "Students of <name>").
- Chevron buttons are the existing `Button` primitive (already keyboard-focusable, announce as buttons).
- Slides are real focusable content (the caller's cards/links); Embla does not trap focus.
- Empty state renders as ordinary flow content — no region landmark when there is no rail.

## Behavior states

| State | Render |
| --- | --- |
| Empty (no slides) | `emptyState` node only; no scroller, no chevrons, no region landmark. |
| Loaded, not scrollable | Rail with all slides visible; NO chevrons, NO edge fades. |
| Loaded, scrollable at start | Right chevron + right fade only; left chevron/fade unmounted. |
| Loaded, scrollable mid | Both chevrons + both fades mounted. |
| Loaded, scrollable at end | Left chevron + left fade only; right chevron/fade unmounted. |
| Content filtered in place | ResizeObserver → `reInit` recomputes scrollability; chevrons/fades update. |

## What is NOT in scope (Slice 3)

- Lineage placement of the rail (honor strip / board groups) — that is Slice 4 (PORTMAP-0005).
- StudentsCarousel's self-fetching + belt-bucketing logic — that is Slice 4 DATA, not this primitive.
- Any connector / SVG overlay work — that is Slice 5 (PORTMAP-0006).
- A second carousel component, a new dependency, or a verbatim copy of BBL JSX (runbook forbids all three).
- Hardcoded belt-colour maps — colour is the caller's `Rank.colorHex` concern.

## Done-means (measured Playwright proof)

Navigate a live route rendering the extended rail; resize to 390 / 768 / 1280; `browser_evaluate` geometry
assertions; screenshot before/after:

- a dense rail snaps (slide offsets align to snap targets);
- chevrons appear ONLY when scrollable and disappear/disable at each end;
- the empty-state slot renders when no slides are supplied (no rail in the DOM);
- `role="region"` + `aria-label` present on the rail wrapper;
- existing `Carousel` consumers unregressed — enumerate every current consumer (e.g. `/courses`) and smoke
  each at the three breakpoints.

## Cross-references

- Epic: [Petey Plan 0337 — Lineage Responsiveness + Carousel](../../../../petey-plan-0337-lineage-responsive-carousel.md)
- Port map: [PORTMAP-0004 — Carousel rail (Embla extension)](../graphify-component-port-map.md)
- Session: [SESSION_0337](../../../../sprints/SESSION_0337.md)
- BBL source (read for behavior only):
  `ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/shared/CarouselRail.jsx`
- Existing primitive being extended: `apps/web/components/common/carousel.tsx`
- Inventory: `docs/knowledge/wiki/dirstarter-component-inventory.md` (rail variant entry)
