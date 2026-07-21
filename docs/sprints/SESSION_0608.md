---
title: "SESSION 0608 — BUILD: State-of-Dojo WS-D — Token-cost tracker"
slug: session-0608
type: session--implement
status: staged
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0609
sprint: S12
lane: repo
lane_seq: WS-D
recipe: lane
goal_ids: [G-023]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0603.md
  - docs/protocols/recipes/live-fanout-sweep.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0608 — BUILD: State-of-Dojo WS-D (token-cost tracker)

> **Pre-staged `recipe: lane` build stub (ADR 0049), staged SESSION_0609.** Reservation branch
> `session-0608-sotd-token-cost`. **Own worktree, NEVER canonical** (FS-0034). Depends on WS-A (landed)
> + a `telemetry:` seed. Dispatchable as a Cody subagent inside the **SotD-catalog fanout**
> (`live-fanout-sweep.md`, trio WS-B/C/D). May graduate to its own `G-row`.

## Operator

Brian + <agent>-session-0608

## Goal

A **token-cost projection** panel under the State surface — read per-session `telemetry:` frontmatter,
render $/token spend with the `dataviz` skill (semantic-token palette, theme-aware).

## Owned files (pairwise-disjoint from WS-B/WS-C)

- `apps/web/components/app/state-of-dojo/token-cost/*` (new subtree)
- `apps/web/lib/state-of-dojo/token-cost-parse.ts` (new pure parser)
- a `telemetry:` SESSION frontmatter schema (seed a couple of `docs/sprints/*` first)
- a `$/token` cost table + owner (doc)

## Conform (do NOT re-derive; do NOT edit `_kernel/*`)

- Keep the **frozen contract** shape (named export, self-fetching async RSC, placement-agnostic,
  `{ compact? }`, owns Suspense + empty) so SESSION_0599 WS-3 can mount it if desired — even though it's
  a chart, not a catalog. Compose `_kernel/ProjectionSection` for the frame.
- Use the **`dataviz`** skill for the charts (area fill, faint grid, emphasized endpoint; semantic tokens;
  light/dark). Reads `telemetry:` across `docs/sprints/*` via a `server-only` feed mirroring `fetch-state.ts`.
- **Depends on the telemetry seed existing** — seed 2–3 sessions' `telemetry:` first, or the panel renders
  an honest empty. **NEVER** write `app/app/page.tsx` (0599's). Cody-preflight first.

## Gates

Full local (typecheck / oxlint / oxfmt / `next build` on the real diff / affected test). Commit on the
lane branch; **HOLD push** for the operator's word (apps/web → BBL prod deploy).

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0608_TASK_01 | pending | `telemetry:` frontmatter schema + seed 2–3 sessions + `$/token` cost table |
| SESSION_0608_TASK_02 | pending | `token-cost-parse.ts` + `server-only` feed (telemetry → cost rows) |
| SESSION_0608_TASK_03 | pending | Token-cost panel (`dataviz` charts; frozen-contract shape) |

## Next session

### Goal

### First task
