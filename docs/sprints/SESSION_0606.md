---
title: "SESSION 0606 — BUILD: State-of-Dojo WS-B — Component + Card catalog panels"
slug: session-0606
type: session--implement
status: staged
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0609
sprint: S12
lane: repo
lane_seq: WS-B
recipe: lane
goal_ids: [G-023]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0603.md
  - docs/protocols/recipes/live-fanout-sweep.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0606 — BUILD: State-of-Dojo WS-B (component + card catalog)

> **Pre-staged `recipe: lane` build stub (ADR 0049), staged SESSION_0609.** Reservation branch
> `session-0606-sotd-component-catalog`. **Own worktree, NEVER canonical** (FS-0034). Depends on WS-A
> (landed on `main` — the frozen kernel + contract). Dispatchable as a Cody subagent inside the
> **SotD-catalog fanout** (`live-fanout-sweep.md`, trio WS-B/C/D) or as a standalone lane.

## Operator

Brian + <agent>-session-0606

## Goal

Replace the WS-A **placeholder** `component-catalog-panel.tsx` + `card-catalog-panel.tsx` with REAL
self-fetching panels projecting the PWCC component specs — the first catalog surface of the projection
framework.

## Owned files (pairwise-disjoint from WS-C/WS-D)

- `apps/web/components/app/state-of-dojo/component-catalog-panel.tsx` (replace placeholder)
- `apps/web/components/app/state-of-dojo/card-catalog-panel.tsx` (replace placeholder)
- `apps/web/lib/state-of-dojo/component-catalog-parse.ts` (new pure parser)
- `apps/web/lib/state-of-dojo/fetch-catalog.ts` (new `server-only` feed — mirror `fetch-state.ts`)
- `apps/web/app/app/components/page.tsx` (new route)
- a thin `brands:` field in the `/files` `SPEC_TEMPLATE` (`docs/knowledge/wiki/files/`)

## Conform (do NOT re-derive; do NOT edit `_kernel/*`)

- **Frozen contract** (`_kernel/contract.ts`): named export `ComponentCatalogPanel` / `CardCatalogPanel`,
  self-fetching async RSC, placement-agnostic, `{ compact? }`, owns its own Suspense + empty. **Copy
  `state-panel.tsx`'s shape.**
- **Compose the kernel** (`_kernel/projection` + `_kernel/phase`): ProjectionCard / WorkBoard /
  ProjectionSection / BrandTabs / GoalLadders / PanelSkeleton. 5-belt phase model if mapping lifecycle→phase.
- **Source** = the PWCC spec files (`docs/knowledge/wiki/files/*.md` frontmatter: `status`/`lifecycle`/
  `wiring` + the new `brands:`) — NOT the 450 KB prose inventory. **Cards = a FACET/tab** of the ONE
  component source (ADR 0040), never a 2nd source. `bugs` via the DBS cross-ref (SESSION_0596) — stub the
  field if 0596 isn't landed.
- **NEVER** write `app/app/page.tsx` (0599's). Cody-preflight before any component.

## Gates

Full local (typecheck / oxlint / oxfmt / `next build` on the real diff / affected test). Hand-authored
migrations only. Commit on the lane branch; **HOLD push** for the operator's word (apps/web → BBL prod deploy).

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0606_TASK_01 | pending | `component-catalog-parse.ts` + `fetch-catalog.ts` (PWCC `/files` specs → catalog rows) |
| SESSION_0606_TASK_02 | pending | Real `component-catalog-panel.tsx` (compose kernel; frozen contract) + `/app/components` route |
| SESSION_0606_TASK_03 | pending | Real `card-catalog-panel.tsx` (Cards facet/tab of the same source) + `brands:` in SPEC_TEMPLATE |

## Next session

### Goal

### First task
