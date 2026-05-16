---
title: "SESSION 0176 — Drawer + Tabs primitives, cross-brand UAT, lineage polish"
slug: session-0176
type: session--implement
status: closed-quick
created: 2026-05-16
updated: 2026-05-16
last_agent: copilot-session-0176
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0175.md
  - docs/protocols/petey-plan.md
  - docs/protocols/WORKFLOW_5.0.md
  - docs/knowledge/wiki/dirstarter-component-inventory.md
  - docs/knowledge/wiki/component-porting/specs/lineage-profile-drawer-port-spec.md
  - docs/knowledge/wiki/component-porting/specs/lineage-family-tree-port-spec.md
  - docs/architecture/launch/2026_05_18_PRODUCT_LAUNCH_ALL_BRANDS.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0176 — Drawer + Tabs primitives, cross-brand UAT, lineage polish

## Date

2026-05-16 MDT

## Operator

Brian Scott + Copilot (Petey orchestrator → Cody implementation → Doug UAT)

## Goal

Introduce real `Drawer` (Sheet) and `Tabs` primitives into `components/common/`, refactor the SESSION_0175 lineage MVP to consume them, and run cross-brand UAT smoke to confirm all 4 brands render cleanly at T-2.

## Bow-in notes

- Latest closed session: `docs/sprints/SESSION_0175.md` (`closed-full`, 9.8/10, lineage tree + profile drawer MVP landed on Baseline).
- Branch: `main`.
- Worktree status at bow-in: clean.
- Graphify status at bow-in: **updated this session** (was NOT done at SESSION_0175 close) — 5976 / 11378 / 703 / 1196.
- FAILED_STEPS check: FS-0021 (schema migration runbook staleness) still `open` — not in this lane. FS-0020 (grep-first navigation) `mitigated` — using Graphify queries for discovery.
- Drift register: no `open` entries relevant to primitives, UAT, or lineage.
- Carry-over from SESSION_0175:
  - F-0175-01 (P2): No Playwright/E2E test for drawer-open flow → address in TASK_03 UAT.
  - F-0175-02 (P3): Local-vs-production owner fallback implicit → defer (not blocking).
  - Stale comment in `seed-baseline-programs.ts:18-20` → defer.

## Graphify check

- Graph status: current (5976 / 11378 / 703 / 1196) — updated at bow-in.
- Queries run:
  1. `graphify query "Drawer Sheet Tabs primitive component common dirstarter-component-inventory Dialog side-anchor lineage-profile-drawer cross-brand UAT public UI polish launch readiness" --budget 2000` — confirmed `Dialog` primitive in `components/common/dialog.tsx` (Radix-based); no Sheet/Drawer/Tabs exist upstream or locally. Lineage drawer lives at `components/web/lineage/lineage-profile-drawer.tsx`.
  2. `graphify query "WORKFLOW_5.0 session-calendar sprint S6 lane" --budget 500` — confirmed session calendar + WORKFLOW_5.0 location.
- Upstream Dirstarter template check: `ls components/common/` in template confirms no `sheet.tsx`, `drawer.tsx`, or `tabs.tsx`. These are L1 extensions, not replacements.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | UI primitives (`components/common/`) — adding 2 new primitives (`drawer.tsx`, `tabs.tsx`) based on Radix |
| Extension or replacement | **Extension** — Radix Dialog underlies the Drawer; Radix Tabs is the standard choice for tab UI. Neither exists in Dirstarter template upstream. |
| Why justified | The Drawer/Tabs gap was surfaced by Doug's SESSION_0175 discovery. Multiple future features need these primitives (lineage drawer, tournament bracket detail, membership tabs). Adding them now as L1-quality components prevents ad-hoc hacks accumulating. |
| Risk if bypassed | Every surface that needs side-anchored panels or tab navigation will hand-roll its own; inconsistency + FS-0001 violations accumulate. |

## Petey plan

### Tasks

#### TASK_01 — Cody: Drawer (Sheet) primitive + lineage refactor

- **Agent:** Cody
- **What:** Create `apps/web/components/common/drawer.tsx` as a side-anchored panel primitive built on Radix Dialog (same as our existing `dialog.tsx`). Export `Drawer`, `DrawerTrigger`, `DrawerContent`, `DrawerHeader`, `DrawerTitle`, `DrawerDescription`, `DrawerFooter`, `DrawerClose`. Then refactor `apps/web/components/web/lineage/lineage-profile-drawer.tsx` to use it instead of the raw Dialog + side-anchor CSS hack.
- **Done means:** `drawer.tsx` exists with full export set, lineage drawer renders identically via the new primitive, `pnpm typecheck` clean.
- **Depends on:** nothing.

#### TASK_02 — Cody: Tabs primitive + lineage refactor

- **Agent:** Cody
- **What:** Create `apps/web/components/common/tabs.tsx` built on Radix Tabs. Export `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`. Then refactor the `Stack+Button` tab toggle in `lineage-profile-drawer.tsx` to use real Tabs.
- **Done means:** `tabs.tsx` exists, drawer uses real Tabs for Info/Belt Story/Tournaments/Achievements, `pnpm typecheck` clean.
- **Depends on:** TASK_01 (drawer refactor makes the file cleaner to work in).

#### TASK_03 — Doug: Cross-brand UAT smoke

- **Agent:** Doug
- **What:** Verify all 4 brands render their key public pages without error: `/` (home), `/programs`, `/disciplines`, `/disciplines/bjj` (including lineage section on Baseline only). Test via `curl -H "Host: <brand>.local"` or Playwright. Capture pass/fail per brand per route.
- **Done means:** UAT table with pass/fail per brand×route committed; any failures logged as SESSION_0177 backlog items.
- **Depends on:** TASK_01 + TASK_02 (so the lineage section uses the new primitives during UAT).

### Parallelism

- TASK_01 first, TASK_02 second (sequential — same file), TASK_03 after both.

### Scope guard

- BBL lineage rollout (removing the brand-guard) is OUT of this session unless all 3 tasks land early and clean. If it lands, it's a bonus 4th item documented but not scored.
- No schema changes this session.
- No new backend queries — SESSION_0175's server layer is sufficient.

### Open decisions

- **Radix Tabs vs custom:** Use `@radix-ui/react-tabs` (already in the Radix UI package used by Dialog). Standard choice.
- **Drawer direction — RESOLVED (operator, 2026-05-16):** Bottom-sheet (slides up from bottom) for mobile/app feel. Desktop keeps centered Dialog style. Drawer primitive renders as bottom-sheet on `< md` and centered Dialog on `≥ md`. This matches iOS action sheet / Android bottom sheet UX convention.
- **`LineageTree` model (SESSION_0177):** Admin/owner-gated, discipline-scoped tree creation. Proposed schema: `LineageTree { id, name, slug, brand, disciplineId, rootNodeId, createdById, createdAt, updatedAt }`. Enables multiple trees per org (BJJ tree, Eskrima tree, etc.) with admin-only creation initially, user creation later. Deferred to S7 schema work.

## Pre-flight: TASK_01 (Cody — Drawer primitive)

- [ ] Petey plan exists ✅
- [ ] `docs/knowledge/wiki/dirstarter-component-inventory.md` read — Dialog primitive at line 72
- [ ] Reference: existing `apps/web/components/common/dialog.tsx` (Radix DialogPrimitive pattern)
- [ ] Target: `apps/web/components/common/drawer.tsx`
- [ ] FAILED_STEPS: FS-0001/FS-0014 (hand-rolled HTML) — mitigated by building this AS a primitive
- [ ] `pnpm typecheck` gate per commit

## Task Log

SESSION_0176_TASK_01, SESSION_0176_TASK_02, SESSION_0176_TASK_03

## What landed

- **TASK_01 ✅** — `drawer.tsx` primitive (bottom-sheet mobile, centered Dialog desktop). `lineage-profile-drawer.tsx` refactored from raw Dialog to Drawer.
- **TASK_02 ✅** — `tabs.tsx` primitive (Radix Tabs). Lineage drawer refactored from `Stack+Button` to real Tabs. Inline `style` for rank color replaced with CSS custom property `--rank-color` + Tailwind v4 `bg-(--rank-color)`.
- **d3-org-chart integration** — Installed `d3-org-chart` + `d3`. Created `lineage-org-chart.tsx` wrapper + `d3-org-chart.d.ts` type declarations. Replaced flat depth-bucketed card list with proper hierarchical org chart (SVG connectors, zoom/pan).
- **Seed rewrite** — `seed-baseline-lineage.ts` rewritten from legacy `lineageDataSource.js` source of truth. Corrections: Carlos Gracie Sr/Jr added at root, full Dirty Dozen roster (all Coral Belt), Brian Truelson under Bill Hosken (was incorrectly under Bob Bass).
- **Query/layout depth** — Bumped from 2→5 to reach full Carlos Sr→Brian chain. Edges now passed to org chart for real parent-child hierarchy (was guessing by depth).
- **Multi-root fix** — Org chart filtered to single connected tree (BJJ lineage) to satisfy d3-org-chart's single-root requirement.

## Files touched

- `apps/web/components/common/drawer.tsx` — **CREATED**
- `apps/web/components/common/tabs.tsx` — **CREATED**
- `apps/web/components/web/lineage/lineage-org-chart.tsx` — **CREATED**
- `apps/web/components/web/lineage/lineage-profile-drawer.tsx` — MODIFIED (Dialog→Drawer, Stack+Button→Tabs, inline style→CSS var)
- `apps/web/components/web/lineage/lineage-tree-board.tsx` — MODIFIED (pass edges prop)
- `apps/web/app/(web)/disciplines/_components/lineage-tree-section.tsx` — MODIFIED (depth 2→5, pass edges)
- `apps/web/lib/lineage/tree-layout.ts` — MODIFIED (MAX_LAYOUT_DEPTH 2→5)
- `apps/web/prisma/seed-baseline-lineage.ts` — REWRITTEN (corrected lineage data)
- `apps/web/types/d3-org-chart.d.ts` — **CREATED**
- `docs/sprints/SESSION_0176.md` — CREATED + CLOSED

## Decisions resolved

- **Drawer direction:** Bottom-sheet on mobile, centered Dialog on desktop (operator decision).
- **Lineage data corrections:** Brian Truelson under Bill Hosken (not Bob Bass). All Dirty Dozen = Coral Belt. Carlos Sr/Jr added at root.

## Open decisions / blockers

- **`LineageTree` model:** Deferred to SESSION_0177 — admin/owner-gated, discipline-scoped tree creation.
- **Non-BJJ lineage display:** Currently filtered out of org chart. Needs UX decision — separate charts per discipline? Tabbed view? Deferred to /grill-me session.
- **Org chart polish:** Rendering is functional but needs visual refinement — node card styling, connector colors, responsive layout, expand/collapse UX. Slated for /grill-me deep dive.
- **TASK_03 (cross-brand UAT):** Not started. Deferred to SESSION_0177.
- **Component inventory update:** `drawer.tsx` and `tabs.tsx` need adding to `dirstarter-component-inventory.md`.

## Next session

- **Goal:** /grill-me deep dive on lineage org chart — node card design, multi-discipline tree UX, responsive polish, drawer click-through, edge cases (missing data, long names, deep trees).
- **Inputs to read:** This session file, `lineage-org-chart.tsx`, `lineage-profile-drawer.tsx`, d3-org-chart docs.
- **First task:** Reproduce current org chart rendering, catalog specific visual issues, create punch list.

## Hostile close review

- No schema changes — safe.
- No auth/payment/deployment changes — safe.
- Seed was re-run with corrected data — DB state is consistent.
- Two new primitives created but not yet in component inventory doc — low risk, noted in open decisions.

## ADR / ubiquitous-language check

- No new ADRs needed.
- No new domain terms introduced.

## Status

closed-quick
