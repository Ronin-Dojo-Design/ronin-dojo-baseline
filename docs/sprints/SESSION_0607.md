---
title: "SESSION 0607 — BUILD: State-of-Dojo WS-C — Cookbook panel"
slug: session-0607
type: session--implement
status: staged
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0609
sprint: S12
lane: repo
lane_seq: WS-C
recipe: lane
goal_ids: [G-023]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0603.md
  - docs/protocols/recipes/live-fanout-sweep.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0607 — BUILD: State-of-Dojo WS-C (cookbook)

> **Pre-staged `recipe: lane` build stub (ADR 0049), staged SESSION_0609.** Reservation branch
> `session-0607-sotd-cookbook`. **Own worktree, NEVER canonical** (FS-0034). Depends on WS-A (landed).
> Dispatchable as a Cody subagent inside the **SotD-catalog fanout** (`live-fanout-sweep.md`, trio WS-B/C/D).

## Operator

Brian + <agent>-session-0607

## Goal

Replace the WS-A **placeholder** `cookbook-panel.tsx` with a REAL self-fetching panel projecting the
recipe book — SOT_Cookbook + the `recipes/*` cards as browsable, pipeline-tagged cards.

## Owned files (pairwise-disjoint from WS-B/WS-D)

- `apps/web/components/app/state-of-dojo/cookbook-panel.tsx` (replace placeholder)
- `apps/web/lib/state-of-dojo/cookbook-parse.ts` (new pure parser)
- `apps/web/lib/state-of-dojo/fetch-cookbook.ts` (new `server-only` feed — mirror `fetch-state.ts`)
- `apps/web/app/app/cookbook/page.tsx` (new route)

## Conform (do NOT re-derive; do NOT edit `_kernel/*`)

- **Frozen contract** (`_kernel/contract.ts`): named export `CookbookPanel`, self-fetching async RSC,
  placement-agnostic, `{ compact? }`, owns its own Suspense + empty. **Copy `state-panel.tsx`'s shape.**
- **Compose the kernel** (`_kernel/projection` + `_kernel/phase`): ProjectionCard / ProjectionSection /
  BrandTabs / PanelSkeleton.
- **Source** = parse `docs/protocols/SOT_Cookbook.md` (the router table) + `docs/protocols/recipes/*.md`
  frontmatter (title / slug / tags / pairs_with). **Tag each recipe by pipeline stage** (idea / plan /
  build / review / ship) — the same stage vocabulary the SESSION_0604 preview artifact uses. The 3 design
  passes (`desi-design-review` / `mobile-optimization-pass` / `ui-ux-pass`) already live in the book.
- **NEVER** write `app/app/page.tsx` (0599's). Cody-preflight before any component.

## Gates

Full local (typecheck / oxlint / oxfmt / `next build` on the real diff / affected test). Commit on the
lane branch; **HOLD push** for the operator's word (apps/web → BBL prod deploy).

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0607_TASK_01 | pending | `cookbook-parse.ts` + `fetch-cookbook.ts` (SOT_Cookbook + recipes/* → stage-tagged rows) |
| SESSION_0607_TASK_02 | pending | Real `cookbook-panel.tsx` (compose kernel; frozen contract) + `/app/cookbook` route |

## Next session

### Goal

### First task
