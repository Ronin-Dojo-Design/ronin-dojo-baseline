---
title: Lineage Responsive Mode Switch Port Spec
slug: lineage-responsive-switch-port-spec
type: spec
status: proven
created: 2026-06-03
updated: 2026-06-03
last_agent: codex-session-0338
pairs_with:
  - docs/petey-plan-0337-lineage-responsive-carousel.md
  - docs/sprints/SESSION_0337.md
  - docs/sprints/SESSION_0338.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - component-porting
  - lineage
  - responsive
---

# Lineage Responsive Mode Switch — Port Spec

> Slice 1 / PORTMAP-0002 / authored SESSION_0337 / proven SESSION_0338. Hard rule: adapt, never port-verbatim. Take the BBL responsive DECISION (which layout for which viewport); rebuild on the layout state we already have. No new component.

```
┌─────────────────────────────────────────────────────────────────────┐
│ COMPONENT PORT SPEC                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ Component name: Lineage responsive mode switch (board < md / tree)  │
│ Legacy source ref: ronin-dojo-monorepo/src/brands/blackbeltlegacy/  │
│                  components/lineage/MobileLineageList.jsx (header    │
│                  documents the < 640px boundary) + parent route     │
│                  switch (desktop-tree vs MobileLineageList)         │
│ Target route:   /lineage/[treeSlug], /disciplines/[slug] (Baseline) │
│ Target file:    apps/web/components/web/lineage/                     │
│                  lineage-tree-canvas.tsx (initial `layout` state —   │
│                  NO new component)                                  │
└─────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────┐
│ Observed Behavior (from BBL)                                        │
├─────────────────────────────────────────────────────────────────────┤
│ - The old app renders the desktop lineage TREE on wide viewports    │
│   and swaps to `MobileLineageList` on narrow ones.                  │
│ - The switch is viewport-driven; the `MobileLineageList` header     │
│   documents the boundary as < 640px.                               │
│ - The decision is binary and viewport-only — no data is fetched to  │
│   decide it; it is purely a render-mode branch.                    │
│ - BBL does NOT expose a user toggle between the two; the viewport    │
│   alone decides. (We improve on this — see Rebuild Plan.)          │
└─────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────┐
│ Rebuild Plan                                                        │
├─────────────────────────────────────────────────────────────────────┤
│ Dirstarter primitives:                                              │
│   - none new. Reuse the existing `layout` state already in          │
│     lineage-tree-canvas.tsx (modes: `tree` and `board`).           │
│     * board = compact vertical inline child-lists, no SVG           │
│       connectors (always fits, scroll-free width).                 │
│     * tree  = wide canvas with the SESSION_0336 SVG connectors.    │
│   - existing Tree/Board toggle in the toolbar (user override).      │
│                                                                     │
│ Custom delta (NOT a new primitive — behavior wiring):               │
│   - viewport-aware DEFAULT for `layout`: `board` below `md`         │
│     (768px), `tree` at/above `md`. (BBL's < 640px maps to the      │
│     mobile LIST, which is Slice 2; this slice only sets the         │
│     board-vs-tree default.)                                        │
│   - read the breakpoint via a `useMediaQuery`/`@container` check    │
│     (client). Seed the initial `layout` from it.                   │
│   - an EXPLICIT user toggle must WIN over the breakpoint default    │
│     for the session: once the viewer picks Tree or Board, that      │
│     choice sticks and is not re-overridden on resize.              │
│   - do NOT fight the existing `autoFittedRef` zoom seed — the       │
│     mode default must not re-trigger or reset the one-shot auto-    │
│     fit. Order: pick layout, then let auto-fit seed as today.      │
│                                                                     │
│ Strategy: adapt (behavior only). No connector change, no zoom       │
│   change, no new component, no schema touch.                       │
│                                                                     │
│ Proof: navigate /lineage/[slug]; resize 390/768/1280; assert the    │
│   default mode + the card-fits geometry; confirm toggle persists.  │
└─────────────────────────────────────────────────────────────────────┘
```

## Data shape this component consumes

None new. This slice is pure client viewport logic; it consumes the same member payload the canvas already renders and adds no server query, action, or schema change. The only "input" is the viewport width (via `useMediaQuery`/`@container`) and the existing user-toggle state.

## Responsive behavior

- **< md (768px):** default `layout = board` — the compact, vertical, always-fits idiom (no SVG connectors). Card never exceeds the viewport.
- **≥ md (768px):** default `layout = tree` — the wide SVG-connector canvas.
- **User override:** the existing Tree/Board toggle still works; once the viewer chooses, the explicit choice wins over the breakpoint default for the rest of the session (resize does not stomp it).
- The < sm (640px) mobile flatten-list is a SEPARATE render path (Slice 2) layered inside the same canvas — out of scope here.

## Accessibility / keyboard

- No new interactive surface — the Tree/Board toggle already exists and is keyboard-reachable; this slice only changes its initial value.
- The toggle's pressed/selected state must reflect the current mode (including when the mode came from the breakpoint default) so screen-reader users hear the active layout.
- Switching modes must not move keyboard focus unexpectedly; honor the existing focus behavior.

## Behavior states (all four boxed)

| State | Render |
| --- | --- |
| Loading | Existing canvas skeleton; mode default is decided before data paints (viewport is known synchronously on the client). |
| Empty (no members) | Existing empty render; mode default still applies but renders the empty state in either layout. |
| Loaded | < md → board by default; ≥ md → tree by default; user toggle overrides and persists for the session. |
| Error | Existing canvas error boundary; unchanged — mode logic does not introduce a new error path. |

## What is NOT in scope (Slice 1)

- The mobile flatten-and-indent list itself (that is Slice 2 / PORTMAP-0003).
- Any change to the SVG connector overlay or its measured-anchor model.
- Any zoom / `autoFittedRef` behavior change (must not be disturbed).
- Persisting the choice beyond the session (no storage write in this slice).
- Adding a new component or any server/schema change.

## Proof status

Proven in SESSION_0338:

- 390px default: board; card 327px within a 390px viewport.
- 768px default: tree; card 462px within a 768px viewport; canvas scrolls horizontally.
- 1280px default: tree; card 672px within a 1280px viewport; canvas scrolls horizontally.
- Manual Tree toggle from 390px persisted through 1280px and back to 390px.
- Manual Board toggle from 1280px persisted through 390px and back to 1280px.
- `bun run typecheck`, `bun biome ci` on touched files, and `bun test lib/lineage/` passed.

## Cross-references

- Epic plan: [Petey Plan 0337 — Lineage Responsiveness + Carousel](../../../../petey-plan-0337-lineage-responsive-carousel.md) (Slice 1).
- Proof session: [SESSION_0338](../../../../sprints/SESSION_0338.md).
- Port map record: PORTMAP-0002 in [Graphify Component Port Map](../graphify-component-port-map.md).
- Next slice: [Lineage Mobile List port spec](./lineage-mobile-list-port-spec.md) (< sm fallback).
- BBL prior art (read for behavior only): `ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/lineage/MobileLineageList.jsx` (the < 640px boundary in its header) + the parent route's desktop-tree-vs-mobile-list switch.
