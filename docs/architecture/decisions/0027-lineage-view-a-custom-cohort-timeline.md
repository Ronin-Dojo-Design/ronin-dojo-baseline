---
title: "ADR 0027 — Lineage View A: custom cohort-timeline layout (retire family-chart for View A)"
slug: adr-0027-lineage-view-a-custom-cohort-timeline
type: decision
status: accepted
created: 2026-06-16
updated: 2026-06-16
last_agent: claude-session-0394
supersedes:
  - docs/architecture/decisions/0026-lineage-view-a-engine-donatso-fork.md
pairs_with:
  - docs/runbooks/domain-features/lineage-hub.md
  - docs/sprints/SESSION_0394.md
  - docs/knowledge/wiki/drift-register.md
  - apps/web/server/web/lineage/payloads.ts
backlinks:
  - docs/knowledge/wiki/index.md
---

# ADR 0027 — Lineage View A: custom cohort-timeline layout (retire family-chart for View A)

## Status

Accepted (SESSION_0394). Supersedes [ADR 0026](0026-lineage-view-a-engine-donatso-fork.md).
**Built + amended SESSION_0395** (see "Amendment — SESSION_0395 build" below: the layout is a
**timeline-tree of list-boxes + dated connectors**, not horizontal "cohort bands").

## Context

View A (the focal `?view=explore` explorer) shipped on a vendored fork of `donatso/family-chart` (ADR 0026)
and was brand-polished into the default cinematic public view (SESSION_0393–0394). On the SESSION_0394 browser
proof, the operator flagged the layout: all of a parent's descendants render in **one flat row**.

The root cause is structural, not cosmetic:

- **family-chart is a genealogy engine.** It models parent → children (and marriages) and has **no concept of
  cohorts**. Our domain is a *promotion lineage* whose primary grouping is the **promotion-date cohort**
  (`LineageVisualGroup`, `groupType: PROMOTION_DATE`, linked to a global `PromotionEvent`). `toFamilyChartData`
  drops `member.visualGroupId` entirely, so the cohort structure the **board view already renders** is absent
  in the explorer (drift `D-DRIFT-0394-1`).
- **It owns the card DOM as HTML strings** (`buildCardHtml`), so explorer cards cannot be React, and
  selection-focus choreography cannot truly tween (the engine recreates card HTML on every `updateTree`).
- **Recurring friction:** measured-SVG connector overlays (SESSION_0336/0337), pinch-zoom vs dnd
  `PointerSensor` conflicts, shrink-only auto-fit. Every lineage session pays a family-chart tax.
- The board view (`lineage-tree-board.tsx`) renders cohort bands correctly **without** family-chart — proof
  the domain layout does not need a genealogy engine.

## Decision

**Retire the vendored family-chart engine for View A and build a custom cohort-timeline layout.** The operator
collapsed the considered A/B fork (A = family-chart + injected cohort tier; B = custom layout) to **B** at the
SESSION_0394 close — no prototype, to save time/tokens.

The custom View A:

- Reads the **shared engine-agnostic DTO** (`LineageVisualNode[]` + `LineageSecondaryLink[]` from
  `to-lineage-visual.ts`) plus `LineageVisualGroup` cohort rows — **the DTO from ADR 0026 survives; only the
  engine changes.**
- Groups each parent's children into **promotion-date cohort bands** (ordered by `sortOrder` / `promotionDate`)
  rendered as a timeline of grouped boxes, replacing the flat single row.
- Renders the SESSION_0394 **cinematic cards as real React** (Poppins names, belt-graphic swatch, solid
  chrome) — no more HTML-string card injection.
- Rebuilds the View A interaction surface on the custom layout: focal-recenter + URL sync, depth controls,
  the secondary-link overlay, and the existing drawer / ⋮ menu / claim contracts (preserve behaviour).

View B (`lineage-tree-canvas.tsx` overview) is unaffected.

## Consequences

- **Positive:** the explorer finally reflects the cohort model; cards become testable React; choreography can
  tween properly; the recurring family-chart friction (connectors, zoom/dnd, HTML-string DOM) goes away.
- **Cost:** re-implementing focal-recenter + secondary-link rendering on the custom layout (family-chart gave
  these for free). Tracked as the SESSION_0395 build.
- **Vendored code:** once View A no longer imports `lib/lineage/family-chart/*`, that vendored tree becomes
  dead and should be removed in the same cutover (or immediately after) to avoid a misleading second engine.
- **No Dirstarter baseline touched** — lineage is a Ronin-custom domain with no L1 primitive; no Dirstarter
  docs proof required.

## Alternatives considered

- **A — keep family-chart, inject a synthetic cohort tier** (parent → cohort box → members). Rejected: still
  pays the HTML-string-DOM + connector/zoom friction tax and bends a genealogy engine toward a shape it does
  not model; the operator chose to stop fighting the engine.
- **Cinematic styling onto the board layout** (make the board the explorer). Rejected earlier: loses the
  pan/zoom focal-recenter explorer identity the operator wants.

## Amendment — SESSION_0395 build (layout refined + timeline reframe)

The decision (retire family-chart for View A; keep the shared DTO; build a custom layout) stands and shipped.
Two refinements emerged in the SESSION_0395 grill + build and supersede this ADR's original *shape* wording:

1. **Layout is a timeline-tree of list-boxes + dated connectors, NOT horizontal "cohort bands."** Reconciling
   two operator references (Balkan *Tree-List Layout* + the *Kajukenbo family tree* poster) into one model:
   - A **node = a card** (cinematic header: avatar / Poppins name / belt-graphic) **+ a vertical list of that
     person's children**. A listed child who *has their own students* (structural — someone points at them via
     `primaryVisualParentMemberId`) sprouts **their own box**, joined by a measured-SVG **connector line**
     (reusing `connector-geometry.ts`); a leaf child stays a compact row inside the parent card.
   - **Deterministic top-down flow** (no force-directed physics, no new dependency); **native-scroll canvas**
     (the WATERSHED 60B KISS conclusion), with focal `scrollIntoView` replacing family-chart's `tree_position`.
   - Implemented as `components/web/lineage/lineage-cohort-timeline.tsx`; the island
     (`lineage-view-a-island.tsx`) keeps the chrome + state and renders it.

2. **The organizing axis is TIME — promotion provenance is the USP.** The lineage *proves* who promoted you,
   by whom, and **when** (with the date as evidence). So:
   - Promotion **date is first-class** on every card ("Promoted by {teacher} · {date}"), connectors carry the
     **promotion year**, and children sort **chronologically** (reading down a branch = forward in time).
   - The DTO (`to-lineage-visual.ts`) gained `promotionDate` (from the selected RankAward `awardedAt`) and
     `visualGroupLabel` (resolved from `LineageVisualGroup`s).
   - **Grouping became filtering** (operator: "stop fighting the cohort-lock"): no forced cohort sub-headings;
     instead a **derived multi-select filter bar** with chips from existing data only (**no schema**) — cohort
     **group** (e.g. the Dirty Dozen + ceremony cohorts), **belt**, **school**, and **promotion year**.
     Rendered via a pluggable facet model so a future stored `LineageTag` many-to-many is a clean swap (the only
     thing it buys is one person in two promotion cohorts at once — deferred to its own schema session).

3. **family-chart retired (gated cut).** After a green browser-proof, the vendored `lib/lineage/family-chart/*`,
   `to-family-chart-data.ts` (+ test), the dead `lineage-family-chart-smoke.tsx`, and `family-chart.css` were
   deleted; the `.belt-shimmer` keyframes moved to `app/styles.css` so they survive. View B
   (`lineage-tree-canvas.tsx`) is untouched.

**Still deferred (unchanged):** tier-gating "who's on the tree" (needs schema/policy), blue school sub-tree
nodes, recursion back-stack/breadcrumb polish, the secondary-link cross-line overlay (the legend shows the
count; lines not drawn on the new layout yet), and `motion/react` selection choreography.
