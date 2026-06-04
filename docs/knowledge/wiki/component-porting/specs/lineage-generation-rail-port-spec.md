---
title: Lineage Generation Rail Port Spec
slug: lineage-generation-rail-port-spec
type: spec
status: proven
created: 2026-06-03
updated: 2026-06-04
last_agent: codex-session-0341
pairs_with:
  - docs/petey-plan-0337-lineage-responsive-carousel.md
  - docs/sprints/SESSION_0337.md
  - docs/sprints/SESSION_0341.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - component-porting
  - lineage
  - carousel
  - rail
---

# Lineage Generation Rail — Port Spec

> Slice 4 / PORTMAP-0005 / SESSION_0337. Hard rule: adapt, never port-verbatim. Take BBL's rail BEHAVIOR (browse wide sibling sets, belt-grouped buckets) onto the Slice-3 extended Embla `Carousel`, in CONNECTOR-FREE zones only. No new rail dependency.

```
┌─────────────────────────────────────────────────────────────────────┐
│ COMPONENT PORT SPEC                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ Component name: Lineage generation rail (connector-free zones)      │
│ Legacy source ref: ronin-dojo-monorepo/src/brands/blackbeltlegacy/  │
│                  components/lineage/{StudentsCarousel,              │
│                  SchoolCarousel}.jsx (both on shared/CarouselRail)  │
│ Target route:   /lineage/[treeSlug] (honor strip + board groups)    │
│ Target file:    apps/web/components/web/lineage/                     │
│                  lineage-honor-strip.tsx (swap raw overflow strip   │
│                  → rail), lineage-compact-child-list.tsx (rail wide │
│                  groups), maybe a thin lineage-generation-rail.tsx  │
│                  wrapper — all on the Slice-3 extended Carousel     │
└─────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────┐
│ Observed Behavior (from BBL)                                        │
├─────────────────────────────────────────────────────────────────────┤
│ StudentsCarousel.jsx:                                               │
│ - Groups students into BELT BUCKETS, high → low rank.               │
│ - Each bucket is a collapsible card; students inside are chunked     │
│   into PAGES OF 4, rendered as `grid grid-cols-2` (a 2×2 slide)     │
│   per page at `w-[168px]` — "iPhone contact-picker" idiom.         │
│ - Selecting an avatar opens an inline detail panel.                 │
│ - Has search + belt filter + expand/collapse-all controls.         │
│                                                                     │
│ SchoolCarousel.jsx:                                                 │
│ - Dedupes schools by `name::location`.                             │
│ - Rails `SchoolCard`s at `w-[280px]`.                              │
│                                                                     │
│ Both use the reusable shared `CarouselRail` (chevron-when-          │
│ scrollable, snap, aria) — which our Slice-3 Embla extension         │
│ replaces.                                                          │
└─────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────┐
│ Rebuild Plan                                                        │
├─────────────────────────────────────────────────────────────────────┤
│ Dirstarter primitives:                                              │
│   - the Slice-3 EXTENDED Embla `Carousel` / `CarouselSlide`         │
│     (components/common/carousel.tsx) — dense-rail mode, sized       │
│     slides, chevrons, empty slot, ResizeObserver, aria. Do NOT      │
│     add a new rail component or a second carousel.                 │
│   - Stack / Card / Avatar / Badge for slide bodies (existing).      │
│                                                                     │
│ Custom delta (NOT a new primitive — domain composition):            │
│   - lineage-honor-strip.tsx: replace the current raw                │
│     `overflow-x-auto` strip with the rail (gains chevrons / snap /  │
│     a11y). CONNECTOR-FREE zone.                                    │
│   - lineage-compact-child-list.tsx: rail WIDE board child-lists;    │
│     optionally adopt a belt-grouped BUCKET idiom (StudentsCarousel  │
│     behavior) for large single-rank cohorts — belt colour from     │
│     `Rank.colorHex` DATA, never a hardcoded belt map. CONNECTOR-    │
│     FREE zone (board has no SVG connectors).                       │
│   - maybe a thin lineage-generation-rail.tsx wrapper that binds     │
│     a generation's members to the extended Carousel with the        │
│     sizing variant — only if it reduces duplication.              │
│                                                                     │
│ Coexistence note: these zones have NO SVG connectors (board has     │
│   none; honor strip has none), so the rail is SAFE here. Rails      │
│   INSIDE connector-bearing tree generations are Slice 5 (the        │
│   adaptive-connector spike) and are OUT OF SCOPE here.             │
│                                                                     │
│ Strategy: adapt. Pass data as props (no BBL self-fetch). Selection  │
│   opens the existing lineage drawer (not a bespoke inline panel).  │
│                                                                     │
│ Proof: navigate /lineage/[slug]; resize 390/768/1280; assert the    │
│   honor strip + wide board groups are snap rails with reachable     │
│   chevrons + aria, no overflow, connector layer untouched.         │
└─────────────────────────────────────────────────────────────────────┘
```

## Data shape this component consumes

Consumes the EXISTING canvas members passed as PROPS (no BBL-style self-fetch). The honor strip rails its honor-member list; board child-lists rail a generation's child members. For an optional belt-grouped bucket idiom, members are bucketed by their `Rank` and the bucket accent/initials colour comes from `Rank.colorHex` data — never a hardcoded belt map. School dedupe (if a school rail is reused) keys on `name::location`. No new server query, action, or schema.

## Responsive behavior

- **390 / 768 / 1280:** the honor strip and wide board groups render as horizontal SNAP rails with reachable chevrons; content never overflows or clips the shell. Sized slides use the Slice-3 variants (e.g. `168/280px`).
- The rail shows/hides chevrons at the ends per the Slice-3 `ResizeObserver` (re-evaluates scrollability when content or viewport changes).
- These zones are connector-free at every breakpoint, so railing here never interacts with the SVG overlay.

## Accessibility / keyboard

- Use the Slice-3 carousel's `role="region"` + `aria-label` per rail (e.g. "Honor roll", "Generation N students").
- Chevrons are real `Button`s — keyboard-reachable; rail is operable with keyboard and announces position to screen readers.
- Slides are individually focusable; selecting one opens the existing lineage drawer (focus management is the drawer primitive's responsibility).
- Belt colour is decorative reinforcement only — rank is also conveyed as text/label, never colour alone.

## Behavior states (all four boxed)

| State | Render |
| --- | --- |
| Loading | Existing canvas skeleton; rails mount with the same member payload the canvas uses. |
| Empty (no members in a zone) | The Slice-3 carousel EMPTY SLOT (e.g. "No members in this generation"); the rail does not render chevrons. |
| Loaded | Honor strip + wide board groups as snap rails; chevrons toggle at the ends; optional belt-grouped buckets for large cohorts. |
| Error | Existing canvas error boundary; unchanged — rails are presentational and pass data via props. |

## What is NOT in scope (Slice 4)

- Rails INSIDE tree generations or any connector interaction (that is Slice 5 / PORTMAP-0006, the adaptive-connector spike).
- Any change to the SVG `LineageConnectorLayer` (untouched — connector-free zones only).
- BBL's self-fetching data model — data arrives as props.
- Native HTML5 drag-and-drop (we use dnd-kit) and BBL's inline detail panel (we reuse the lineage drawer).
- A new carousel dependency or a second rail component (reuse the Slice-3 Embla extension).

## SESSION_0341 Proof

PORTMAP-0005 is proven in SESSION_0341. `LineageHonorStrip` now replaces its raw horizontal
`overflow-x-auto` strip with the shared `Carousel` / `CarouselSlide` primitive. Wide board child groups in
`LineageCompactChildList` render as labelled carousel rails once the sibling set reaches the rail threshold;
smaller groups remain the existing compact vertical rows.

Playwright proof on `/lineage/rigan-machado-bjj-lineage`:

- **1280px:** no page overflow; honor rail labelled `role="region"` with 6 slides and visible right control;
  board mode exposed 2 child rails (`Dirty Dozen`, `Coral Belt Ceremony`) with 7 / 4 slides, visible controls,
  existing profile click opened the drawer, and board connector SVG path count was 0.
- **768px:** no page overflow; same honor + board rails proven with visible controls and 0 connector SVG paths.
- **390px:** no page overflow; honor rail remained labelled and scrollable with mobile controls hidden by the
  shared `desktop` control mode; board rails were absent because the existing mobile lineage list branch owns
  `< sm` rendering.

No schema, server, `LineageConnectorLayer`, tree-generation SVG overlay, autoplay/marquee motion, or BBL
hardcoded belt map changed.

## Cross-references

- Epic plan: [Petey Plan 0337 — Lineage Responsiveness + Carousel](../../../../petey-plan-0337-lineage-responsive-carousel.md) (Slice 4).
- Port map record: PORTMAP-0005 in [Graphify Component Port Map](../graphify-component-port-map.md).
- Depends on: the Slice-3 extended Embla carousel (PORTMAP-0004) — do not add a second rail.
- Out-of-scope sibling: PORTMAP-0006 (Slice 5) — rails inside connector-bearing generations.
- BBL prior art (read for behavior only): `ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/lineage/StudentsCarousel.jsx` + `SchoolCarousel.jsx` (both on `shared/CarouselRail.jsx`).
