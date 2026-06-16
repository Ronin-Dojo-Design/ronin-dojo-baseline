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

Accepted (SESSION_0394). Supersedes [ADR 0026](0026-lineage-view-a-engine-donatso-fork.md). **Build:** SESSION_0395.

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
