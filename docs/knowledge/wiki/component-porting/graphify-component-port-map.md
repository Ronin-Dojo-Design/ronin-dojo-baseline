---
title: Graphify Component Port Map
slug: graphify-component-port-map
type: concept
status: active
created: 2026-05-06
updated: 2026-06-03
author: Brian + ChatGPT
last_agent: codex-session-0338
pairs_with:
  - docs/runbooks/porting/react-to-next-component-porting-runbook.md
  - docs/knowledge/wiki/content-engine/graphify-token-efficiency-pipeline.md
  - docs/sprints/SESSION_0338.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - graphify
  - component-map
  - porting
---

# Graphify Component Port Map

## Summary

This page is the persistent component-port map. It exists so agents do not rediscover component relationships from scratch every session.

## Status

Active concept page. Initially manual/wiki-driven; can later be generated or refreshed by Graphify-like tooling.

## Key Idea

A porting lane needs a graph, not a grep storm.

The graph should connect:

```text
legacy component
  -> old imports
  -> old props
  -> old data assumptions
  -> current Dirstarter/Ronin equivalent
  -> target route
  -> proof artifact
```

## Structure

### Node types

- legacy_component
- baseline_component
- dirstarter_primitive
- domain_component
- route
- server_query
- server_action
- schema
- proof
- decision

### Edge types

- replaces
- wraps
- depends_on
- renders_in
- fetches_from
- submits_to
- blocked_by
- proven_by
- deprecated_by

## Mapping record template

```md
## PORTMAP-0001 — <component name>

**Status:** inbox | mapped | porting | proven | blocked | archive
**Legacy path:**
**Legacy purpose:**
**Target path:**
**Target route/page:**
**Dirstarter primitive fit:**
**Existing Ronin component fit:**
**Port strategy:** replace | wrap | rewrite | port | archive
**Server/client boundary:**
**Data dependency:**
**Proof required:**
**Notes:**

### Edges
- legacy_component -> replaces -> baseline_component
- target_component -> renders_in -> route
- target_component -> depends_on -> query/action/schema
```

## Active mapping records

> Epic: [Petey Plan 0337 — Lineage Responsiveness + Carousel](../../../petey-plan-0337-lineage-responsive-carousel.md).
> Governing rule: **adapt, never port-verbatim**; reuse existing primitives; `Rank.colorHex` only.

### PORTMAP-0002 — Lineage responsive mode switch

**Status:** proven
**Legacy path:** `blackbeltlegacy/components/lineage/MobileLineageList.jsx` (header) + parent route switch (~640px)
**Legacy purpose:** decide desktop-tree vs mobile-list by viewport.
**Target path:** `apps/web/components/web/lineage/lineage-tree-canvas.tsx` (initial `layout` state)
**Target route/page:** `/lineage/[treeSlug]`, `/disciplines/[slug]`
**Dirstarter primitive fit:** n/a (viewport hook + existing `layout` state)
**Existing Ronin component fit:** the canvas already has `tree`/`board` layouts — add a breakpoint default.
**Port strategy:** adapt (behavior only)
**Server/client boundary:** client
**Data dependency:** none (pure viewport)
**Proof required:** measured card ≤ viewport at 390/768/1280; board default < md; user toggle persists. Proven in SESSION_0338.
**Notes:** Slice 1 landed in SESSION_0338. `LineageTreeCanvas` now defaults to board below 768px and tree at/above 768px until the viewer explicitly toggles; the manual toggle then persists across resize for the session.

### PORTMAP-0003 — Lineage mobile list (flatten + indent)

**Status:** mapped
**Legacy path:** `blackbeltlegacy/components/lineage/MobileLineageList.jsx`
**Legacy purpose:** vertical flatten-with-depth list for < 640px (indent `min(depth*16,48)px`, div L-connectors).
**Target path:** new `apps/web/components/web/lineage/lineage-mobile-list.tsx` + `lib/lineage/flattenLineage.ts`
**Target route/page:** `/lineage/[treeSlug]` (< sm render)
**Dirstarter primitive fit:** `Stack`, `Avatar`, `Badge`
**Existing Ronin component fit:** reuse `LineageNodeCard`/compact-row shape; not BBL's card.
**Port strategy:** adapt (re-derive the flatten algorithm; new TS, unit-tested)
**Server/client boundary:** client
**Data dependency:** existing canvas member payload
**Proof required:** 390px renders single indented column ≤ 3 levels, every row → drawer, no overflow.
**Notes:** Slice 2. Belt colour from `Rank.colorHex`.

### PORTMAP-0004 — Carousel rail (Embla extension)

**Status:** mapped
**Legacy path:** `blackbeltlegacy/components/shared/CarouselRail.jsx`
**Legacy purpose:** reusable horizontal snap-rail (chevron-when-scrollable, measured scroll-step, empty state, aria).
**Target path:** `apps/web/components/common/carousel.tsx` (extend — do NOT add a second carousel)
**Target route/page:** lineage rails (Slice 4) + any future rail consumer
**Dirstarter primitive fit:** the existing Embla `Carousel`/`CarouselSlide` IS the equivalent.
**Existing Ronin component fit:** extend it (sizing variants, empty slot, ResizeObserver, a11y).
**Port strategy:** wrap/extend (back-compatible API)
**Server/client boundary:** client
**Data dependency:** none (presentational)
**Proof required:** dense rail snaps + chevrons toggle at ends + empty state + aria; existing consumers unregressed.
**Notes:** Slice 3. Reuse-before-port per runbook; closes BBL's no-ResizeObserver gap.

### PORTMAP-0005 — Generation rail (connector-free zones)

**Status:** mapped
**Legacy path:** `blackbeltlegacy/components/lineage/{StudentsCarousel,SchoolCarousel}.jsx`
**Legacy purpose:** lineage-specific rails (belt-grouped buckets, school rails).
**Target path:** `lineage-honor-strip.tsx`, `lineage-compact-child-list.tsx`, maybe `lineage-generation-rail.tsx`
**Target route/page:** `/lineage/[treeSlug]` (honor strip + board child-lists)
**Dirstarter primitive fit:** the Slice-3 extended `Carousel`
**Existing Ronin component fit:** swap honor-strip raw `overflow-x-auto` for the rail; rail wide board groups.
**Port strategy:** adapt
**Server/client boundary:** client
**Data dependency:** existing canvas members; `Rank.colorHex` for buckets
**Proof required:** honor strip + wide board groups snap with reachable chevrons + aria; no connector touched.
**Notes:** Slice 4. Connector-free zones ONLY (board has no connectors; honor strip has none).

### PORTMAP-0006 — Adaptive connector + rails inside wide tree generations (SPIKE)

**Status:** blocked (spike-gated — needs S3/S4 + a perf spike first)
**Legacy path:** none (net-new adaptation of our SESSION_0336 `LineageConnectorLayer`)
**Legacy purpose:** n/a — this is the coexistence design, not a BBL port.
**Target path:** `lineage-tree-canvas.tsx` (`LineageBranch` + `LineageConnectorLayer`), `app/styles.css`
**Target route/page:** `/lineage/[treeSlug]` tree mode, wide generations
**Dirstarter primitive fit:** n/a (custom SVG overlay)
**Existing Ronin component fit:** extends `LineageConnectorLayer` (measured overlay).
**Port strategy:** adapt (degrade fan → bus + visible-child stubs, rAF re-measure on scroll)
**Server/client boundary:** client
**Data dependency:** DOM measurement only
**Proof required:** railed generation shows adaptive bus + scroll-tracking stubs; path-trace still cascades;
reduced-motion static; narrow generations unchanged; overlay stays `pointer-events-none`.
**Notes:** Slice 5. Highest risk. Fallback = connector-free-when-railed if the spike is janky.

## Relationships

- Use with `react-to-next-component-porting-runbook.md`
- Use after checking `dirstarter-component-inventory.md`
- Use during hostile repo review when token burn is suspected

## Sources

- current repo wiki/index pattern
- Dirstarter component inventory
- LLM Wiki / persistent graph doctrine
- user observation that Claude burns tokens grepping raw files

## Open Questions

- Should Graphify output become a committed artifact under `docs/graphs/`?
- Should the graph be generated from both old monorepo and new repo, or only from the new repo first?
- Should mapping records eventually become JSON/YAML for machine use?

**Planned Passion Produces Purpose.**
**OSSS.**
