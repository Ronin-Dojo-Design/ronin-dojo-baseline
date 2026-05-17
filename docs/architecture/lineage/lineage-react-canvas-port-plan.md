---
title: "Lineage React Canvas Port Plan"
slug: lineage-react-canvas-port-plan
type: spec
status: active
created: 2026-05-17
updated: 2026-05-17
last_agent: codex-session-0177
backlinks:
  - docs/sprints/SESSION_0177.md
  - docs/knowledge/wiki/index.md
---

# Lineage React Canvas Port Plan

## Summary

Lineage Tree v1 should retire `d3-org-chart` and port the full Black Belt Legacy React tree concept into the Next/Dirstarter app. The source reference is the old monorepo file:

`/Users/brianscott/dev/ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/LineageTree.jsx`

Do not use `LineageTreeMVP.jsx` as the primary source. It is a landing-page subset. The full `LineageTree.jsx` has the relevant zoom/pan, measured connectors, mobile behavior, tree roots, node cards, and profile drawer click path.

## Current Replacement Target

Replace this temporary D3 surface after parity:

- `apps/web/components/web/lineage/lineage-org-chart.tsx`
- `apps/web/components/web/lineage/lineage-tree-board.tsx`
- `apps/web/app/(web)/disciplines/_components/lineage-tree-section.tsx`

Keep `LineageProfileDrawer`, but replace its tab set with `Profile`, `Lineage`, `Rank History`, and `Admin/Edit`.

## Target Component Shape

Proposed component split:

- `lineage-tree-canvas.tsx`: client island, pan/zoom state, gesture binding, viewport framing.
- `lineage-tree-node-card.tsx`: real React card for one member.
- `lineage-tree-connectors.tsx`: measured connector segments between parent and child row.
- `lineage-tree-groups.tsx`: group row label, collapse state, and grouped child rendering.
- `lineage-tree-toolbar.tsx`: zoom in, zoom out, reset, fit view, editor mode controls when allowed.
- `lineage-tree-adapter.ts`: pure data adapter from Prisma query payload to render forest.
- `lineage-tree-types.ts`: render DTOs shared between public viewer and editor.

This should stay under `apps/web/components/web/lineage/` unless a later session extracts generic primitives.

## Data Adapter Requirements

The adapter receives:

- tree metadata
- tree members
- lineage nodes
- selected rank awards
- visual groups
- `PROMOTED_BY` relationships
- current viewer/editor capabilities

The adapter outputs:

- forest roots
- children grouped under each parent member
- ordered group rows
- ordered members inside each group
- default root/focus member
- drawer payload IDs
- badges and compact display labels

Required adapter cases:

- multiple roots
- unattached verified people
- unknown promotion dates
- hidden public group labels
- disputed nodes and relationships
- a selected `RankAward` that does not have a linked relationship yet
- group labels visible in editor but hidden publicly

## Interaction Requirements

Public viewer interactions:

- click node opens drawer
- pan by drag
- pinch zoom on touch devices
- zoom controls with stable icon buttons
- fit view to default root/focus
- mobile framing that keeps the tree usable without a landing-page wrapper

Editor interactions:

- drag/drop reorders within a group or moves into an existing group
- drag/drop never changes promoter/parent
- promoter changes open the modal
- collapsed group state is visible and editable by authorized users
- group label visibility is editable per group

Use `@use-gesture/react` for pan/zoom and drag gestures. Keep the core layout deterministic in TypeScript so unit tests can run without a browser.

## Layout Rules

- A visual parent means promotion parent, backed by `PROMOTED_BY`.
- Forest roots render as top-level branches.
- One tree may define a default root/focus for initial camera framing.
- Group rows are scoped under one promoter/parent in v1.
- Admin-created groups can override auto labels, sort order, collapsed default, and public label visibility.
- Connector measurement should use refs and actual rendered card positions, following the old BBL approach, not static assumptions from D3.

## Styling Direction

- Use Dirstarter common primitives and local lineage components.
- Use real React cards, not HTML strings injected into D3.
- Use lucide icons for toolbar actions.
- Keep node card dimensions stable so names, badges, avatar fallback, and rank labels do not resize the layout.
- Keep palette brand-aware but avoid hard-coding the old BBL dark theme into every brand.

## Migration Strategy

1. Build the adapter beside the current D3 chart and unit-test it.
2. Build the React canvas behind a feature flag or local component switch.
3. Wire the embedded discipline section to the new canvas for Baseline.
4. Add standalone `/lineage/[treeSlug]`.
5. Add editor-only controls under the dashboard route.
6. Remove `d3-org-chart` and its type shim only after public and editor parity are verified.

## Non-Goals

- Do not port BBL PropTypes.
- Do not port BBL design tokens directly into the shared app.
- Do not recreate the old landing-page MVP tree.
- Do not use drag/drop to rewrite lineage history.
