---
title: Lineage Mobile List Port Spec
slug: lineage-mobile-list-port-spec
type: spec
status: proven
created: 2026-06-03
updated: 2026-06-04
last_agent: codex-session-0339
pairs_with:
  - docs/petey-plan-0337-lineage-responsive-carousel.md
  - docs/sprints/SESSION_0337.md
  - docs/sprints/SESSION_0339.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - component-porting
  - lineage
  - responsive
  - mobile
---

# Lineage Mobile List — Port Spec

> Slice 2 / PORTMAP-0003 / SESSION_0337. Hard rule: adapt, never port-verbatim. Take BBL's flatten-and-indent BEHAVIOR; rebuild on our row shape + `Rank.colorHex`. NOT an accordion — a single flat indented column.
>
> **Status:** proven in SESSION_0339. At 390px the public Rigan Machado tree renders as a single
> flattened list with indent levels `0/16/32/48`, no page or canvas horizontal overflow, no SVG connector
> columns or zoom controls, and row selection opens the existing profile drawer/path context.

```
┌─────────────────────────────────────────────────────────────────────┐
│ COMPONENT PORT SPEC                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ Component name: Lineage mobile list (flatten + indent, < sm)        │
│ Legacy source ref: ronin-dojo-monorepo/src/brands/blackbeltlegacy/  │
│                  components/lineage/MobileLineageList.jsx           │
│ Target route:   /lineage/[treeSlug] (Baseline, < sm render)         │
│ Target file:    apps/web/components/web/lineage/                     │
│                  lineage-mobile-list.tsx (new) +                    │
│                  apps/web/lib/lineage/flatten-lineage.ts (new, pure,  │
│                  unit-tested); wired as the < sm branch inside       │
│                  lineage-tree-canvas.tsx                            │
└─────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────┐
│ Observed Behavior (from BBL MobileLineageList.jsx)                  │
├─────────────────────────────────────────────────────────────────────┤
│ - NOT an accordion — a single FLAT indented vertical list.          │
│ - `buildFlattenedTree(nodes)` builds a parent→child map, then DFS-   │
│   flattens roots into a flat array; each item carries a computed     │
│   integer `depth`.                                                  │
│ - List renders `space-y-2`.                                         │
│ - Depth shown via left margin, CAPPED:                              │
│     marginLeft = min(depth * 16, 48)px                              │
│     (16px per level, ceiling 48 = ~3 visible indent levels).       │
│ - For depth > 0, a small inline L-connector drawn with DIVs         │
│   (vertical bar + horizontal stub, aria-hidden) fakes the tree      │
│   edge per-row WITHOUT any wide SVG/canvas.                        │
│ - Per row: ~48px avatar (lazy photo OR belt-colour initials),       │
│   name (+ green ✓ verified / amber ★ founder), rank line, optional   │
│   school line, trailing → chevron.                                 │
│ - Selected row = ring + bg tint.                                   │
│ - Empty state = bordered card "No lineage data available".         │
│ - Header strip: "{N} Practitioners" + a hint line.                 │
└─────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────┐
│ Rebuild Plan                                                        │
├─────────────────────────────────────────────────────────────────────┤
│ Dirstarter primitives:                                              │
│   - Stack (common/stack) — the column + each row's flex layout.     │
│   - Avatar / AvatarImage / AvatarFallback (common/avatar) — the     │
│     ~48px avatar; fallback initials tinted from `Rank.colorHex`.    │
│   - Badge (common/badge) — verified ✓, founder ★, the "{N}          │
│     Practitioners" count.                                          │
│   - Button (common/button) — each row is a button → drawer.        │
│                                                                     │
│ Custom delta (NOT a new primitive — domain composition):            │
│   - lib/lineage/flatten-lineage.ts — PURE TS:                        │
│       flattenLineage(members) → { member, depth }[]                 │
│     re-derived from BBL's buildFlattenedTree (parent→child map +     │
│     DFS) — NOT a copy of the JSX. Unit-tested (roots, depth,        │
│     ordering, cycles guarded).                                     │
│   - components/web/lineage/lineage-mobile-list.tsx — renders        │
│     `space-y-2`, marginLeft = min(depth*16, 48)px, per-row div      │
│     L-connector (aria-hidden) for depth > 0.                       │
│   - REUSE our existing `LineageNodeCard` / compact-row shape for    │
│     the row body — do NOT copy BBL's card.                         │
│   - Belt colour from `Rank.colorHex` DATA only — never a hardcoded  │
│     belt map (BBL `BELT_COLORS` / `#CFB87C` are what NOT to copy). │
│                                                                     │
│ Wiring: render this as the < sm (640px) branch inside              │
│   lineage-tree-canvas.tsx. The measured SVG connector overlay is    │
│   DISABLED on this branch (different idiom — per-row div            │
│   connectors, no wide SVG).                                        │
│                                                                     │
│ Strategy: adapt (re-derive the flatten algorithm; reuse our row).   │
│   Supports story BBL-LINEAGE-002 (ancestor chain legible).         │
│                                                                     │
│ Proof: navigate /lineage/[slug] at 390px; assert single indented    │
│   column (≤ 3 indent levels), each row opens the drawer, no         │
│   horizontal overflow/clip; screenshot.                            │
└─────────────────────────────────────────────────────────────────────┘
```

## Data shape this component consumes

Consumes the EXISTING canvas member payload (the same list the tree/board modes already render); no new server query or schema. `flattenLineage` takes that member array (each member exposing its id, parent/instructor linkage, name, image, `Rank` with `colorHex`, verified/founder flags, optional school) and returns `{ member, depth }[]` with a computed integer `depth`. No backend change.

SESSION_0339 implementation note: the helper lives at `apps/web/lib/lineage/flatten-lineage.ts` to match
the repo's existing kebab-case lineage lib filenames while exporting the requested `flattenLineage`
function.

## Responsive behavior

- **< sm (640px):** this list is the active render — a single indented vertical column, indent capped at 3 visible levels (`min(depth*16, 48)px`). No wide SVG; per-row div L-connectors only. Never overflows horizontally.
- **≥ sm:** this component does not render; the board (Slice 1) or tree mode owns the surface.

## Accessibility / keyboard

- Each row is a `Button` (keyboard-reachable, announces as a button) whose activation opens the lineage drawer.
- The per-row L-connector divs are decorative: `aria-hidden`.
- Depth is conveyed semantically (the list reads top-to-bottom in DFS order); consider `aria-level` or a visually-hidden "Generation N" cue so the ancestor chain is legible to screen readers (supports BBL-LINEAGE-002).
- Selected row's ring + bg tint must also carry an accessible selected state (e.g. `aria-current`/`aria-selected`), not colour alone.

## Behavior states (all four boxed)

| State | Render |
| --- | --- |
| Loading | Existing canvas skeleton (the list mounts after the same payload the other modes use). |
| Empty (no members) | Bordered card "No lineage data available" (parity with BBL's empty card). |
| Loaded | Single flat indented column; rows DFS-ordered with computed depth; each row → drawer. |
| Error | Existing canvas error boundary; unchanged — the pure flatten has no fetch of its own. |

## What is NOT in scope (Slice 2)

- Rails / carousels (Slices 3–4).
- Zoom and the `autoFittedRef` seed (untouched on this branch).
- The SVG connector overlay — DISABLED for the mobile list (per-row div connectors instead).
- Copying BBL's card component or its hardcoded `BELT_COLORS` map.
- Any server query / action / schema change.

## Cross-references

- Epic plan: [Petey Plan 0337 — Lineage Responsiveness + Carousel](../../../../petey-plan-0337-lineage-responsive-carousel.md) (Slice 2).
- Port map record: PORTMAP-0003 in [Graphify Component Port Map](../graphify-component-port-map.md).
- Prior slice: [Lineage Responsive Mode Switch port spec](./lineage-responsive-switch-port-spec.md) (board/tree default).
- Proof session: [SESSION_0339](../../../../sprints/SESSION_0339.md).
- BBL prior art (read for behavior only): `ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/lineage/MobileLineageList.jsx` (`buildFlattenedTree` + indent/connector idiom).
