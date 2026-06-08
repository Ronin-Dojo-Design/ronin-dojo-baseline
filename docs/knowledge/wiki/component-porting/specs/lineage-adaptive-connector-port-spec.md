---
title: Lineage Adaptive Connector Port Spec
slug: lineage-adaptive-connector-port-spec
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
  - connector
  - spike
---

# Lineage Adaptive Connector — Port Spec (SPIKE)

> Slice 5 / PORTMAP-0006 / SESSION_0337. **Highest risk — spike first.** This is NOT a BBL port; it is a
> net-new adaptation of OUR SESSION_0336 `LineageConnectorLayer` so connectors coexist with a scrolling
> rail. Hard rule still holds: adapt, never port-verbatim; `Rank.colorHex` only; protect the measured
> `pointer-events-none` overlay model.

```
┌─────────────────────────────────────────────────────────────────────┐
│ COMPONENT PORT SPEC                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ Component name: Adaptive connector + rails inside wide tree gens   │
│ Old source ref: none — net-new adaptation of SESSION_0336          │
│                  LineageConnectorLayer (our own measured overlay)  │
│ Target files:   apps/web/components/web/lineage/                    │
│                  lineage-tree-canvas.tsx (LineageBranch +          │
│                  LineageConnectorLayer); apps/web/app/styles.css   │
│                  (bus/stub keyframes)                              │
│ Target route:   /lineage/[treeSlug] (tree mode, wide generations) │
│ Strategy:       adapt — degrade per-child fan → bus + visible-     │
│                  child stubs, rAF re-measure on rail scroll.      │
│ Risk:           HIGH — SPIKE before committing.                    │
└─────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────┐
│ Observed Behavior (our SESSION_0336 LineageConnectorLayer)         │
├─────────────────────────────────────────────────────────────────────┤
│ - A measured, pointer-events-none SVG overlay drawing 90°-bend     │
│   paths from a parent's bottom-centre to each child's top-centre.  │
│ - Measures off the layer's OWN svgRef.parentElement (NOT a passed  │
│   parent ref — parent refs are null in a child's layout effect),   │
│   using a `:scope >` direct-child query for the child nodes.       │
│ - ResizeObserver re-measures on layout change.                     │
│ - transform: scale() does NOT grow scrollWidth (zoom is visual).   │
│ - Path-trace highlight: on-path child edges flip to               │
│   stroke-primary/60 with a cascade delay down the chain.          │
│ - Reduced-motion = static (no animated redraw).                   │
│                                                                   │
│ THE PROBLEM: a horizontal rail scrolls children's X-position, but │
│ the connector anchors paths to FIXED child centres — so inside a  │
│ connector-bearing generation the paths would DETACH from the      │
│ children as the rail scrolls.                                     │
└─────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────┐
│ Rebuild Plan — DECIDED coexistence (operator: "Adaptive: parent-  │
│ drop → rail bus + stubs")                                          │
├─────────────────────────────────────────────────────────────────────┤
│ Threshold gate (width / child-count): when a generation's measured │
│ width exceeds its band, the generation RAILS and the connector     │
│ DEGRADES. Narrow generations keep the current per-child fan        │
│ UNCHANGED.                                                         │
│                                                                   │
│ When railed, the connector adapts:                                │
│   - Per-child fan → ONE horizontal "bus" spanning the rail        │
│     viewport (not the intrinsic child width), drawn from the      │
│     parent drop.                                                  │
│   - A "N students →" scroll cue indicating off-screen children.   │
│   - Only CURRENTLY-VISIBLE children get short vertical stubs from  │
│     the bus down to each visible child's top-centre.             │
│   - Stubs RE-MEASURED ON SCROLL: rAF-throttled handler hooked to  │
│     the rail's scroll event + the existing ResizeObserver. On     │
│     each frame, re-query visible children and redraw stubs.       │
│   - Path-trace PRESERVED: the on-path child's stub still flips to  │
│     stroke-primary/60 (cascade delay retained for the bus drop).  │
│   - Reduced-motion = static bus + stubs; no animated redraw, no   │
│     cascade animation (the highlight colour still applies).      │
│                                                                   │
│ INVARIANTS to protect (SESSION_0336 model):                       │
│   - Overlay STAYS pointer-events-none (dnd-drag + pan untouched). │
│   - Keep measuring off the layer's OWN svgRef.parentElement +     │
│     `:scope >`; NEVER anchor to content inside the rail scroller   │
│     (that content translates under scroll → detached paths).     │
│   - The bus anchors to the rail VIEWPORT box, stubs anchor to the │
│     visible children's live rects at measure time.              │
│                                                                   │
│ Files: lineage-tree-canvas.tsx (LineageBranch decides rail-vs-fan │
│   per generation; LineageConnectorLayer gains the bus+stub mode); │
│   app/styles.css (bus/stub keyframes, reduced-motion guarded).   │
│                                                                   │
│ SPIKE-FIRST: prove rAF re-measure performance + bus geometry in a │
│   throwaway before committing real code.                         │
│                                                                   │
│ FALLBACK (if spike is janky/confusing) — "connector-free-when-    │
│   railed": for a railed generation ONLY, drop the connectors and  │
│   convey parent→children via a header label + frame. Narrow       │
│   generations keep the fan. Document BOTH the primary design and  │
│   this fallback; escalate the choice to the operator.            │
└─────────────────────────────────────────────────────────────────────┘
```

## Data shape this component consumes

DOM measurement only — no domain payload change. The overlay reads live geometry, not props:

```ts
// Conceptual — measured at render/scroll time, not passed as data
type RailedConnectorMeasurement = {
  busRect: DOMRect              // the rail viewport box (bus span), from svgRef.parentElement
  parentDropX: number           // parent bottom-centre X, relative to the overlay
  visibleChildren: {            // re-queried via `:scope >` each rAF frame
    id: string
    topCentreX: number          // live child rect, only while visible in the rail
    onPath: boolean             // path-trace → stub flips to stroke-primary/60
  }[]
  totalChildren: number         // for the "N students →" scroll cue
}
```

Belt colour inside the child cards is ALWAYS `Rank.colorHex` (caller concern); the connector itself uses
theme tokens (`stroke-primary/60` for path-trace), never a hardcoded belt map.

## Responsive behavior

- **Narrow generation (under threshold):** unchanged per-child fan; existing SESSION_0336 behavior.
- **Wide generation (over threshold), tree mode ≥ md:** rails with the adaptive bus + visible-child stubs;
  stubs re-track on scroll; "N students →" cue shows.
- **Board mode / < md:** out of scope here — board has no connectors (Slice 4) and < sm renders the mobile
  list (Slice 2). This spike is tree-mode, wide-generation only.

## Accessibility / keyboard

- The overlay is `pointer-events-none` and `aria-hidden` decoration — it must not intercept focus or
  pointer; the rail beneath owns all interaction (drag, chevrons, keyboard) per Slice 3's a11y contract.
- The "N students →" cue is presentational; the authoritative student count + navigation live in the rail's
  `role="region"` + `aria-label` (Slice 3), not in the SVG.
- Path-trace highlight is a visual cue only; the on-path relationship is also conveyed by the drawer/list.

## Behavior states

| State | Render |
| --- | --- |
| Narrow generation | Per-child fan (90°-bend paths), unchanged from SESSION_0336. |
| Wide gen, rail at rest | Bus across viewport + stubs to all currently-visible children + "N students →" cue. |
| Wide gen, scrolling | rAF re-measure: stubs redraw to the new visible children each frame; bus fixed to viewport. |
| Wide gen, on-path child visible | That child's stub flips to `stroke-primary/60` (cascade delay retained). |
| Wide gen, on-path child scrolled off | Bus retains highlight intent; stub reappears when the child re-enters view. |
| Reduced-motion | Static bus + stubs, no animated redraw/cascade; highlight colour still applied. |
| Spike fails Done-means | Fallback: connector-free-when-railed (label + frame); fan kept for narrow gens. |

## What is NOT in scope (Slice 5)

- Connector-FREE zones (honor strip, board child-lists) — Slice 4 (PORTMAP-0005) already covers those.
- The mobile flatten-and-indent list — Slice 2 (PORTMAP-0003).
- The carousel primitive itself — Slice 3 (PORTMAP-0004); this slice CONSUMES that rail.
- Any change that makes the overlay interactive (must stay `pointer-events-none`).
- Anchoring measurement to content inside the rail scroller (forbidden — paths would detach on scroll).
- Hardcoded belt-colour maps.

## Done-means (measured Playwright proof)

Navigate the live `/lineage/[treeSlug]` in tree mode at 390 / 768 / 1280; `browser_evaluate` geometry;
screenshot before/after:

- a generation past the threshold renders as a rail with the adaptive bus + scroll-tracking stubs (assert
  stub X-positions update after a programmatic rail scroll);
- the "N students →" cue is present when children overflow;
- path-trace still cascades to the on-path child's stub (`stroke-primary/60` asserted);
- reduced-motion renders a static bus + stubs (no animation classes active);
- narrow generations are unchanged (per-child fan still measured correct);
- dnd-drag + pan still work over the generation (overlay `pointer-events-none` — assert pointer events pass
  through to the rail/canvas beneath).

## Cross-references

- Epic: [Petey Plan 0337 — Lineage Responsiveness + Carousel](../../../../petey-plan-0337-lineage-responsive-carousel.md)
- Port map: [PORTMAP-0006 — Adaptive connector + rails inside wide tree generations (SPIKE)](../graphify-component-port-map.md)
- Session: [SESSION_0337](../../../../sprints/SESSION_0337.md)
- Depends on: [Lineage Carousel Rail port spec](./lineage-carousel-rail-port-spec.md) (Slice 3 — the rail this consumes)
- BBL source: none — net-new adaptation of our SESSION_0336 `LineageConnectorLayer`
  (`apps/web/components/web/lineage/lineage-tree-canvas.tsx`).
