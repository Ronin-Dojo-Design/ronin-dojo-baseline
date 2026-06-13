---
title: "SESSION 0379 — Lineage tidy-tree layout engine + v2 canvas (0379-1)"
slug: session-0379
type: session--plan
status: in-progress
created: 2026-06-13
updated: 2026-06-13
last_agent: claude-session-0379
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0378.md
  - docs/petey-plan-0379.md
  - docs/runbooks/domain-features/lineage-tree-runbook.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0379 — Lineage tidy-tree layout engine + v2 canvas (0379-1)

## Date

2026-06-13

## Operator

Brian + claude-session-0379

## Goal

**Pivoted to a planning/decision session (no code).** The session opened to build a 2D tidy-tree engine
(slice 0379-1), but after an extended grill the operator chose a different path entirely: **fork the MIT
TypeScript/D3 library `donatso/family-chart`** and build a new focal-centric genealogy explorer (View A)
alongside the existing org-chart canvas (View B). Output: the locked design (runbook §0 + §0a) and a
rewritten `petey-plan-0379` slice sequence, committed as a **candidate-A baseline** to compare against a
parallel ChatGPT-authored approach before any build.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0378.md`
- Carryover: SESSION_0378 finished the BBL `/app` migration Wave 4 and reached the autonomous batch
  boundary (Wave 5 is human-gated). This session is an operator-directed pivot to the lineage
  org-chart-grade epic — explicitly NOT the SESSION_0378 "Next session" block (Wave 5 gate).
- Plan + spec read first: `docs/petey-plan-0379.md` (slice sequence),
  `docs/runbooks/domain-features/lineage-tree-runbook.md` (Balkan gap analysis + spec), and
  `docs/runbooks/domain-features/lineage-hub.md` (data model + privacy invariants).

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `a7bccf5`

### Graphify check

- Skipped (focused single-area lane). The lineage file map in `lineage-hub.md` + targeted greps
  located the exact files; no repo-wide search needed. Graph last refreshed SESSION_0378 (~11,865 nodes).

### Grill outcome

1 fork resolved before build (the plan's premise was partly stale — surfaced during discovery):

- **Finding:** the plan/runbook frame 0379-1 as "replace the 1D depth-bucket `tree-layout.ts`; canvas
  renders from `{x,y}`." But `bucketByDepth` has **zero production callers** (test-only), the depth-row
  renderer `lineage-tree.tsx` is **orphaned**, and the live canvas already does a **recursive
  parent-pointer CSS-flexbox** layout with **DOM-measured** connectors. The layout the canvas uses is
  in JSX/CSS, not in `tree-layout.ts`.
- **Decision (operator):** Option 1 deliverable (real tidy-tree engine producing `{x,y,width}` +
  absolute-positioned render), but built as a **separate v2** — do **not** rewire/refactor the existing
  canvas. Zero risk to the working path; prove v2 on real bjj data via a new additive route.

### Drift logged

- No new drift. (Existing open lineage drift D-022 `LineageProfileDetailRenderPolicy` unused is
  unrelated to layout; not touched here.)

## Petey plan

### Goal

Ship the tidy-tree layout engine (keystone) + a zero-risk v2 absolute-positioned canvas that renders
the bjj lineage from engine coordinates with computed connectors, browser-proven.

### Tasks

#### SESSION_0379_TASK_01 — Pure tidy-tree layout engine

- **Agent:** Cody
- **What:** New pure-TS module computing `{x,y,width,height,depth}` per member via Walker/Buchheim
  linear-time tidy-tree, forest-aware, configurable separations, plus a `mixed` mode (wide leaf rows →
  stacked columns). Leaves `tree-layout.ts` untouched.
- **Steps:** TDD. Define `LayoutInputNode`/`LayoutOptions`/`PositionedNode`/`TreeLayout`; implement
  Buchheim tidy-tree; forest offset; `mixed` mode; no-overlap invariant test.
- **Done means:** `apps/web/lib/lineage/tidy-tree-layout.ts` + `tidy-tree-layout.test.ts` green via
  `bun test`; no-overlap property test passes; existing `tree-layout.test.ts` still green.
- **Depends on:** nothing

#### SESSION_0379_TASK_02 — v2 canvas rendering from {x,y}

- **Agent:** Cody
- **What:** New `LineageTreeCanvasV2` that normalizes `members` (reuse `canvas-model.ts` helpers),
  runs the engine, absolute-positions `LineageNodeCard`s at `{x,y}`, draws **computed** SVG connectors,
  supports zoom + pan + engine-known fit, selection→path-highlight + drawer, and a tidy/mixed toggle.
  Read-only viewer surface (no dnd in v2 this slice).
- **Steps:** build canvas + a minimal client wrapper owning drawer state; reuse `LineageProfileDrawer`,
  `LineageNodeCard`, `buildSelectedPathTrace`.
- **Done means:** component renders a positioned tree with no overlap; connectors computed from layout.
- **Depends on:** SESSION_0379_TASK_01

#### SESSION_0379_TASK_03 — Additive v2 route + browser proof

- **Agent:** Cody + Doug
- **What:** New `app/(web)/lineage/[treeSlug]/v2/page.tsx` reusing the standalone viewer's oRPC fetch,
  rendering v2. Browser-prove on `bbl.local:3000/lineage/rigan-machado-bjj-lineage/v2` (same tree as
  disciplines/bjj). Run gates.
- **Steps:** new route; dev server; Chrome/Playwright screenshot proof; typecheck/lint/format/tests.
- **Done means:** route renders the bjj tree from engine coordinates with no overlap, screenshot
  captured; gates green.
- **Depends on:** SESSION_0379_TASK_02

### Parallelism

Sequential — TASK_02 consumes TASK_01's engine; TASK_03 mounts TASK_02. One coherent vertical, built
inline (no subagents).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0379_TASK_01 | Cody | Pure-TS keystone, TDD. |
| SESSION_0379_TASK_02 | Cody | New isolated component. |
| SESSION_0379_TASK_03 | Cody + Doug | Additive route + verification. |

### Open decisions

None at plan-lock (the render-scope fork was resolved in Grill outcome).

### Risks

- Walker/Buchheim contour math is fiddly — the no-overlap property test is the guard.
- v2 must not import from or modify the existing canvas (zero-risk mandate); reuse only the shared
  pure modules (`canvas-model.ts`) + shared components (`LineageNodeCard`, `LineageProfileDrawer`).

### Scope guard

- No schema migration (Phase 3 identity window owns any schema touch).
- Do not modify `lineage-tree-canvas.tsx`, `lineage-tree-board.tsx`, the discipline section, or the
  existing `/lineage/[treeSlug]` route. v2 is purely additive.
- Do not regress privacy/RBAC invariants — v2 consumes the same materialized public payload.
- Belt color stays `Rank.colorHex` data; no hardcoded brand colors.
- No dnd editing in v2 this slice (matrix #7 is already ✅ in the existing canvas).

### Dirstarter implementation template

- **Docs read first:** petey-plan-0379, lineage-tree-runbook, lineage-hub (local SoT; no live Dirstarter URL needed).
- **Baseline pattern to extend:** lineage pure libs (`lib/lineage/*`) + `LineageNodeCard` / `LineageProfileDrawer`.
- **Custom delta:** a real tidy-tree layout engine + absolute-positioned v2 viewer (org-chart-grade foundation).
- **No-bypass proof:** additive; no Dirstarter L1 capability replaced.

## Cody pre-flight

### Pre-flight: tidy-tree engine + v2 canvas

#### 1. Existing component scan

- Located via lineage-hub file map + targeted grep: `lib/lineage/{tree-layout,canvas-model,connector-geometry,search}.ts`,
  `components/web/lineage/lineage-tree-canvas.tsx` (existing renderer — not touched), `LineageNodeCard`, `LineageProfileDrawer`.
- Found: `bucketByDepth` dead (test-only); `lineage-tree.tsx` orphaned; canvas renders recursive CSS.

#### 2. L1 template scan

- Consulted `dirstarter-docs-inventory.md`: not applicable — no L1 area touched (pure lib + read-only viewer component + additive route).

#### 3. Composition decision

- Composing existing: `LineageNodeCard`, `LineageProfileDrawer`, `canvas-model.ts` helpers, `buildSelectedPathTrace`.
- New: `tidy-tree-layout.ts` engine + `LineageTreeCanvasV2` + v2 route.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (but overridden by operator directive to run 0379-1).
- ADR read: ADR 0016 (lineage promotion SoT) confirmed; no change.
- Runbook consulted: lineage-tree-runbook, lineage-hub.

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo` (FS-0002).
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`
- Brand/host for testing: `http://bbl.local:3000`

#### 6. FAILED_STEPS check

- Prior failures in this area: none layout-specific. FS-0002 (dev server cmd), FS-0024 (git guard) acknowledged.
- Mitigation acknowledged: use `npx next dev --turbo`; run FS-0024 guard before any mutating git.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0379_TASK_01 | superseded | Tidy-tree engine — dropped; pivoted to forking `donatso/family-chart`. |
| SESSION_0379_TASK_02 | superseded | v2 {x,y} canvas — replaced by the family-chart fork plan. |
| SESSION_0379_TASK_03 | superseded | v2 route/proof — folded into the rewritten petey-plan-0379 slices. |
| SESSION_0379_TASK_04 | landed | Grill → locked fork+extend design (runbook §0/§0a), rewrote petey-plan-0379, committed candidate-A baseline. |

## What landed

- Locked the lineage **View A** design: fork `donatso/family-chart` (MIT/TS/D3) + extend. Recorded in
  runbook §0 (verdict) + §0a (integration spec, COMPLETE).
- Rewrote `petey-plan-0379` to the fork+extend slice sequence (vendor → adapter → island → overlay →
  privacy → polish).
- Committed as a **candidate-A baseline** to compare against a parallel ChatGPT approach.

## Decisions resolved

Pivot from the tidy-tree-engine plan (all in runbook §0/§0a):

- **Base:** fork MIT/TS/D3 `donatso/family-chart`; vendor + own; IoC review before commit (no npm dep, no Balkan).
- **Two views:** A (new focal family-chart explorer) + B (existing org-chart canvas, kept); B→A link.
- **Mapping:** single-primary-line + secondary-overlay; `single_parent_empty_card=false`; privacy unchanged (materializer drop).
- **Cards:** HTML `cardInnerHtmlCreator`; click=re-center; View-profile→`LineageProfileDrawer`.
- **Adapter:** client-side pure `toFamilyChartData`; server payload shared with View B.
- **No code this session** — planning/decision only.

## Files touched

| File | Change |
| --- | --- |

## Verification

| Command / smoke | Result |
| --- | --- |

## Open decisions / blockers

## Next session

### Goal

### First task

## Review log

## Hostile close review

## ADR / ubiquitous-language check

## Reflections

## Full close evidence

| Step | Proof |
| --- | --- |
