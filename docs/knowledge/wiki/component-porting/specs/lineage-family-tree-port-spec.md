---
title: Lineage Family Tree Port Spec
slug: lineage-family-tree-port-spec
type: spec
status: draft
created: 2026-05-16
updated: 2026-05-16
last_agent: claude-session-0175
pairs_with:
  - docs/sprints/SESSION_0175.md
  - docs/knowledge/wiki/component-porting/plawywright-component-conversion-method/component-port-spec.md
  - docs/knowledge/wiki/component-porting/specs/lineage-profile-drawer-port-spec.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - component-porting
  - lineage
---

# Lineage Family Tree — Port Spec

> Doug / TASK_01 / SESSION_0175. Hard rule: features-not-pixels. Capture what the component DOES; rebuild with Dirstarter primitives.

```
┌─────────────────────────────────────────────────────────────────────┐
│ COMPONENT PORT SPEC                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ Component name: Lineage Family Tree (MVP variant)                   │
│ Old URL:        https://blackbeltlegacy.local/#/bbl/lineage         │
│ Old state:      "Explore the Lineage Tree" section, expanded        │
│ Old source ref: ronin-dojo-monorepo/src/brands/blackbeltlegacy/     │
│                  components/LineageTreeMVP.jsx (784 LOC)            │
│ Target route:   /disciplines/[slug] (Baseline)                      │
│ Target file:    apps/web/app/(web)/disciplines/[slug]/_components/  │
│                  lineage-tree-section.tsx (composed of primitives   │
│                  in apps/web/components/web/lineage/* per TASK_03)  │
└─────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────┐
│ Observed Visual Structure                                           │
├─────────────────────────────────────────────────────────────────────┤
│ - Section header (eyebrow "Creator Suite: School / Lineage /        │
│   Branch", H2 "Explore the Lineage Tree", subhead "Tap to expand,   │
│   long-press to zoom · Pinch to zoom")                              │
│ - Toolbar row above the canvas:                                     │
│     * Branch label "1 lineage branch · 12 members"                  │
│     * "Explore" toggle (right-aligned)                              │
│     * Zoom cluster: "+", percentage badge ("40%"), "−", "⊡" reset   │
│ - Tree canvas:                                                      │
│     * Root node anchored top-center (Carlos Gracie Sr, depth 0)     │
│     * Children stacked vertically by depth (data-depth="0..4")      │
│     * Each tree node = avatar + name + rank line + verified ✓       │
│       (and on some, school / location / membership tier badge)      │
│     * Edges between nodes implied by alignment (no explicit SVG     │
│       lines visible in MVP; positional/depth-based)                 │
│ - Below the canvas:                                                 │
│     * Branch chip group "Choose a lineage to explore" with one      │
│       chip per branch ("Machado → Bass → Legacy ✓ Verified")        │
│     * "Share This Lineage" block with "Copy Link" + "Open Full      │
│       Viewer" CTAs                                                  │
│     * "How Lineage Works" 3-up info row (Trace Your Roots /         │
│       Explore Connections / Verify Credentials)                     │
│ - Below the explainer: "Practitioners in This Lineage" — a flat     │
│   member grid (2-col @ desktop, 1-col @ mobile) with the same       │
│   member card shape as the tree node (avatar + name + rank + org    │
│   + location + small expand-caret)                                  │
│ - Mobile: tree canvas collapses to a stacked single-column list,    │
│   members grid collapses to single column, zoom controls hidden.    │
└─────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────┐
│ Observed Interactions                                               │
├─────────────────────────────────────────────────────────────────────┤
│ - Click on any tree-node card → opens Lineage Profile Drawer        │
│   (see sibling spec) with that node's data; root cards open the     │
│   same drawer with founder data.                                    │
│ - "+" / "−" buttons → zoom step the canvas; centered % badge        │
│   reflects current scale (observed at 40%).                         │
│ - "⊡" → reset view (re-centers + restores default scale).           │
│ - Branch chip click ("Machado → Bass → Legacy") → re-filters the    │
│   canvas to that branch and highlights the chip.                    │
│ - "Copy Link" → copies a deep link to the branch (clipboard).       │
│ - "Open Full Viewer" → routes to the standalone explorer (legacy    │
│   only; out-of-scope for SESSION_0175 MVP — see Top scope).         │
│ - "Practitioners in This Lineage" cards: clicking opens the drawer  │
│   for that member (parity with tree-node click).                    │
│ - Empty state (no nodes in the branch): observed as the static      │
│   "How Lineage Works" 3-up plus a "Create Free Account" CTA.        │
│ - Loading: the page renders shell + skeletons of node cards before  │
│   data arrives (legacy uses a `BBLLoadingScreen`; we don't port     │
│   that — use `Skeleton` primitive).                                 │
│ - Error: not observed in capture; legacy falls back to the          │
│   explainer block. Treat as empty-state for MVP.                    │
└─────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────┐
│ Rebuild Plan                                                        │
├─────────────────────────────────────────────────────────────────────┤
│ Dirstarter primitives (all in dirstarter-component-inventory.md):   │
│   - Section / Section.Content (web/ui) — section wrapper            │
│   - H4 + Note (common/heading, common/note) — header + subhead      │
│   - Stack (common/stack) — every flex row/column                    │
│   - Card / CardHeader (common/card) — every tree-node card AND      │
│     every "Practitioners" grid card                                 │
│   - Avatar + AvatarImage + AvatarFallback (common/avatar)           │
│   - Badge (common/badge) — rank label, verified tick, branch chip,  │
│     "X members" count                                               │
│   - Grid (web/ui/grid) — practitioner member grid                   │
│   - Button (common/button) — Copy Link, Open Full Viewer, zoom +/-  │
│     (zoom is descoped for MVP per Top Scope)                        │
│   - Skeleton (common/skeleton) — loading state                      │
│   - EmptyList (web/empty-list) — "no lineage yet" state             │
│   - Link (common/link) — deep links to /me/{slug} where applicable  │
│                                                                     │
│ Custom delta (NOT a new primitive — domain composition):            │
│   - lib/lineage/tree-layout.ts — pure TS depth-bucket algorithm;    │
│     groups LineageNodes by depth from root for vertical stacking.   │
│     NOT a port of the 541-LOC legacy treeLayoutEngine.js — re-      │
│     derived from the observed `data-depth` model (depth 0..N).     │
│   - components/web/lineage/lineage-node-card.tsx — server component │
│     that composes Card + Avatar + Badge for one node.               │
│   - components/web/lineage/lineage-tree.tsx — server component that │
│     renders a depth-bucketed list of node cards. NO SVG edges in    │
│     MVP — alignment-only.                                           │
│   - components/web/lineage/lineage-tree-section.tsx — composes      │
│     header + tree + practitioners grid + drawer mount on the        │
│     discipline page.                                                │
│                                                                     │
│ Strategy: adapt with Dirstarter primitives; features-not-pixels.    │
│                                                                     │
│ Source inspection needed? Reference only; new backend is            │
│   LineageNode / LineageRelationship via new server/web/lineage/*    │
│   (to be scaffolded by Cody in TASK_02).                            │
│                                                                     │
│ Proof: render with seeded data on Baseline /disciplines/[slug];     │
│   tree depth ≥ 2; drawer opens from node click.                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Data shape this component consumes (target — new schema only)

The legacy backend is explicitly out-of-scope (Hard rule 3). The component MUST be designed to consume only what the new `LineageNode` + `LineageRelationship` schema can produce. Cody's TASK_02 will scaffold the server queries; this is the contract the UI relies on:

```ts
// Conceptual — Cody owns the exact payload shape in server/web/lineage/payloads.ts
type LineageTreeNode = {
  id: string              // LineageNode.id
  slug: string | null     // LineageNode.slug
  depth: number           // derived by tree-layout.ts from instructor->student edges
  isVerified: boolean     // LineageNode.isVerified
  user: {
    name: string
    image: string | null  // User.image -> Avatar
  }
  rankLabel: string | null      // derived: RankAward.rank.name | null  (BACKEND GAP — see SESSION findings)
  schoolName: string | null     // derived: Membership.organization.name | null  (BACKEND GAP)
  locationLabel: string | null  // derived: DirectoryProfile.{city,state} | null  (BACKEND GAP)
}

type LineageTreeData = {
  rootId: string
  nodes: LineageTreeNode[]   // pre-filtered by viewer visibility (PUBLIC default)
  edges: { fromId: string; toId: string; type: 'INSTRUCTOR_STUDENT' }[]
  // branches[] is a v2 feature — MVP renders a single branch from rootId.
}
```

## Responsive behavior

- **Desktop ≥ md:** Section uses default Section/Wrapper widths; tree is a single vertically-stacked column of depth buckets (no edges); "Practitioners in This Lineage" grid is 2-col.
- **Mobile (< md):** All buckets collapse into a single column; practitioners grid is 1-col; zoom/explore controls suppressed for MVP (legacy hides them on mobile too).
- **No pan-and-zoom in MVP** — the tree is a static, scrollable, depth-bucketed list. Zoom + Explore toggle + branch chips defer to SESSION_0176.

## Accessibility / keyboard

- Each node card is a `Button` (NOT a `<div>` with `onClick`) so it's keyboard-reachable and announces as a button.
- Drawer-open trigger uses `Sheet`/`Drawer` primitive's `Trigger`; focus management is the primitive's responsibility.
- The depth-bucketed list MUST have a sensible heading hierarchy: section `H4`, optional per-depth `H6` ("Generation N") for screen reader navigation.

## Behavior states (all four boxed)

| State | Render |
| --- | --- |
| Loading | `Skeleton` rectangles in the shape of node cards (3 rows × 1-2 columns). |
| Empty (no nodes) | `EmptyList` with copy "This lineage has no recorded practitioners yet." |
| Loaded (1 node = just the root) | One node card, no edges, no practitioners grid. |
| Loaded (root + descendants) | Stacked depth buckets + practitioners grid. |
| Error | Same as Empty for MVP; surface a `toast` via the page boundary, not inline. |

## What is NOT in MVP scope (rolls to SESSION_0176)

- SVG/CSS edge lines between nodes.
- Pan/zoom canvas + the "+/−/⊡ Reset" toolbar.
- Branch chip filter UI (single-branch render only in MVP).
- "Copy Link" + "Open Full Viewer" CTAs.
- "How Lineage Works" 3-up explainer (not load-bearing for proof of feature).
- Long-press / pinch zoom mobile gestures.
- Membership-tier-gated student carousels under nodes.

## Cross-references

- Drawer pairing: [Lineage Profile Drawer port spec](./lineage-profile-drawer-port-spec.md)
- Source-of-last-resort (used only for tab labels & depth-bucket confirmation):
  `ronin-dojo-monorepo/src/brands/blackbeltlegacy/components/LineageTreeMVP.jsx`
- Inventory: `docs/knowledge/wiki/dirstarter-component-inventory.md` (primitives section)
- Capture artifacts (this session): `/tmp/session-0175-doug/10-lineage-desktop-clean.png`,
  `/tmp/session-0175-doug/20-lineage-mobile-clean.png`, `/tmp/session-0175-doug/02-lineage-desktop.html`
