---
title: "Petey Plan 0379 — Lineage focal explorer (fork donatso/family-chart)"
slug: petey-plan-0379
type: petey-plan
status: active
created: 2026-06-13
updated: 2026-06-13
last_agent: claude-session-0379
pairs_with:
  - docs/runbooks/domain-features/lineage-tree-runbook.md
  - docs/runbooks/domain-features/lineage-hub.md
  - docs/petey-plan-0305.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan 0379 — Lineage focal explorer (fork donatso/family-chart)

> **REWRITTEN SESSION_0379.** The original plan (build a 2D tidy-tree engine from scratch, extend the
> existing canvas) is **superseded**. After grilling, the operator chose to **fork the MIT TypeScript/D3
> library [`donatso/family-chart`](https://github.com/donatso/family-chart)** and build a new
> **focal-centric genealogy explorer (View A)** alongside the existing org-chart canvas (View B). The
> full decision trail + integration spec live in
> [`lineage-tree-runbook.md`](runbooks/domain-features/lineage-tree-runbook.md) **§0 + §0a — read those
> first.** This file is just the slice sequence.
>
> ⚠ **Candidate-A baseline (SESSION_0379):** committed for comparison against a parallel ChatGPT-authored
> approach. The final path may cherry-pick between the two — confirm before building 0379-1.

## Locked decisions (do not re-grill — see runbook §0/§0a for rationale)

1. **Base = fork `donatso/family-chart`** (MIT, TypeScript, `d3@7`). Vendor the source into a
   workspace-local module we own (`apps/web/lib/lineage/family-chart/` or a `packages/` module); IoC +
   read review before commit. Not an npm dependency; we edit internals freely.
2. **Two coexisting views.** **View B** = the existing org-chart `LineageTreeCanvas` (whole-tree
   overview) — **kept, not rewired**. **View A** = the new family-chart focal explorer. B→A: click a
   person in B → open A focused on them.
3. **View A is focal-centric.** `main_id` = tree root by default; every node re-centers; depth-limited;
   shareable `?focus=` URLs. (FamilyTreeApp is the visual/UX north star.)
4. **Mapping: single-primary-line + secondary-overlay.** `rels.parents = [primaryVisualParentMemberId]`,
   `rels.children = [promotees]`, `single_parent_empty_card = false`. Cross-belt/secondary promoters
   (`LineageRelationship` PROMOTED_BY beyond primary) render as a **secondary-link overlay** (belt-
   labelled, dashed, subordinate; in-view only, else drawer). `rels.spouses` reserved/unused in v1.
5. **Privacy unchanged + sacred.** Non-PUBLIC dropped by the materializer, never reach View A. Do not
   use family-chart `is_private` to surface hidden members. Belt color stays `Rank.colorHex`.
6. **No schema changes.** Pure read-model + client display. Adapter is client-side + pure.

## Slices (each ≈ one session)

### 0379-1 — Vendor the fork (foundation)

- **Goal:** bring `donatso/family-chart` `src/` into a workspace-local module we own; add `d3@7`; make
  it compile + typecheck inside our repo.
- **Steps:** IoC + read review of the ~40 TS files; copy under `apps/web/lib/lineage/family-chart/`
  (keep upstream `LICENSE` + record forked commit SHA); wire into our TS/build; smoke a trivial chart.
- **Done means:** the forked module typechecks + lints in-repo; a throwaway demo renders; license +
  provenance recorded; IoC review clean.
- **Depends on:** nothing.

### 0379-2 — `toFamilyChartData` adapter (primary edges)

- **Goal:** pure client adapter mapping the materialized public payload → family-chart `Datum[]`
  (primary edges only): `rels.parents=[primary promoter]`, `rels.children=[promotees]`,
  `data={colorHex, avatar, displayName, rankLabel, slug, claimable, verified}`, `gender` unset.
- **Files:** `apps/web/lib/lineage/to-family-chart-data.ts` + `.test.ts` (pure, unit-tested).
- **Done means:** adapter unit tests green; bjj payload maps to a valid `Datum[]`; privacy = consumes
  the same materialized payload as View B (no non-PUBLIC).
- **Depends on:** 0379-1.

### 0379-3 — View A island + bjj render + B→A link

- **Goal:** the `"use client"` family-chart island on `/lineage/[treeSlug]?view=explore&focus=[person]`;
  HTML belt cards via `cardInnerHtmlCreator` (band from `Rank.colorHex`, avatar, name/rank/badges);
  click = re-center (+ `?focus=` shallow sync); "View profile" → existing `LineageProfileDrawer`;
  reuse path-to-main hover + mini-tree expand. Add the View B → View A link.
- **Files:** new island component + route wiring (shared fetch w/ existing viewer), card HTML templater.
- **Done means:** bjj lineage renders in View A from engine coordinates; re-center + focus URL work;
  drawer opens; B→A link works; browser-proof on `bbl.local:3000`.
- **Depends on:** 0379-2.

### 0379-4 — Secondary-overlay (slink/clink)

- **Goal:** render cross-belt/secondary promoters as a belt-labelled, dashed, subordinate overlay by
  extending the fork's `layout/create-links.ts` + `renderers/view-links.ts`; drawn only when both
  endpoints are in the current focal view; out-of-view secondaries listed in the drawer. Legend + toggle.
- **Files:** forked `create-links`/`view-links`; adapter carries secondary edges; drawer rank-history.
- **Done means:** a node promoted by two professors shows the primary edge + a distinct secondary link
  in-view (drawer otherwise); privacy tests still green; browser-proof.
- **Depends on:** 0379-3.

### 0379-5 — Privacy + edge-case + mobile verification

- **Goal:** prove the materializer drop holds in View A (non-PUBLIC absent; broken lineage lines, no
  phantom card with `single_parent_empty_card=false`); guarded privacy tests green; mobile zoom/pan/
  re-center polish.
- **Done means:** `queries.visibility.test.ts` + privacy guards green; mobile browser-proof; no leak.
- **Depends on:** 0379-3 (4 if landed).

### 0379-6 — Polish wave

- **Goal:** depth controls (`ancestry_depth`/`progeny_depth`), mini-tree load-on-demand, focus-URL
  polish, node templates (placeholder / claimed / deceased / root), export + minimap **if free from the
  fork**.
- **Done means:** each sub-feature browser-proven.
- **Depends on:** 0379-1..5.

## How to run this

- **Interactive (recommended for 0379-1..3):** bow in, point at runbook §0/§0a + this plan. Vendoring
  the fork (1), the pure adapter (2), and the first render (3) want careful hands + browser proof.
- **Secondary-overlay (4)** is the novel custom work (editing the fork's link layer) — interactive.
- **Autonomous (5–6)** are more mechanical once the engine is wired; confirm one session closes first.

## Scope guard

- No schema migration. No DNS/Vercel-prod/Stripe changes.
- Do not rewire View B (the existing canvas) — View A is additive.
- Do not regress privacy/RBAC invariants (runbook §0a; hub §"Privacy invariants").
- Belt color = `Rank.colorHex` data; no hardcoded brand colors.
- IoC + read review the vendored fork before it commits (operator supply-chain caution).

## Cross-references

- [Lineage Tree Runbook](runbooks/domain-features/lineage-tree-runbook.md) — §0 verdict + §0a integration spec (the authoritative design).
- [Lineage Domain Hub](runbooks/domain-features/lineage-hub.md) — data model, file map, privacy invariants.
- [Petey Plan 0305](petey-plan-0305.md) — the lineage epic this continues.
- [`donatso/family-chart`](https://github.com/donatso/family-chart) — the MIT fork base.

**Honor the Lineage. Build the Future. OSSS.**
