---
title: "SESSION 0608 — BUILD: State-of-Dojo WS-D — Token-cost tracker"
slug: session-0608
type: session--implement
status: closed
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0608
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

Brian + claude-session-0608

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

## Pre-flight: TokenCostPanel (+ token-cost-chart / token-cost-table)

### 1. Existing component scan
- Searched `components/web/` for: chart, cost, telemetry, spend — none found.
- Searched `components/common/` for: chart — none found (`table.tsx` exists, see §3).

### 2. L1 template scan (via Dirstarter Component Inventory)
- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes — no chart/dataviz entry;
  confirms this repo has no L1 chart primitive to reuse.
- Searched `dirstarter_template/components/` for: chart — none (Dirstarter has no chart component).
- Closest existing pattern: `apps/web/components/admin/chart.tsx` (`Chart` — hand-rolled bar chart,
  `"use client"`, semantic `bg-primary` tokens, no chart library dep) + the sibling kernel's own
  `GoalLadders`/`GoalLadderTable` dual visual+accessible-table pattern
  (`components/app/state-of-dojo/_kernel/projection.tsx`, read-only reference, not edited).
- **Primitive API spot-check:**
  - `EmptyList` (`components/common/empty-list.tsx`): `className`, `render` (swap root element via
    `useRender`), default tag `<p>`.
  - `Heading` (`components/common/heading.tsx`): `size: 'h1'|'h2'|'h3'|'h4'|'h5'|'h6'`, `render`, `className`.
  - `ProjectionSection`/`PanelSkeleton` (kernel, frozen, imported not edited): `title`, `accent?`,
    `action?`, `children`, `className?` / `compact?`.
  - `Table`/`TableRow`/`TableCell` (`components/common/table.tsx`): grid-column primitive keyed to
    a `--table-columns` CSS var — built for the AdminCollection data-table family, not a fit for a
    small 4-column breakdown table (see §3).

### 3. Composition decision
- [x] Composing existing components: `ProjectionSection`, `PanelSkeleton`, `EmptyList`, `Heading`
  (kernel + common), reusing `Suspense`+async-RSC shape from `state-panel.tsx`.
- [x] New component, no L1 match exists (justify): `TokenCostChart` (no chart primitive anywhere
  in the repo — `components/admin/chart.tsx` is a bar chart, not the area-fill/faint-grid/
  emphasized-endpoint shape the `dataviz` skill guidance calls for; hand-rolled SVG matches the
  Chart.tsx precedent of "no chart library dep"). `TokenCostSessionTable`/`TokenCostModelTable`
  use a raw `<table>`, mirroring the kernel's own `GoalLadderTable` precedent in this SAME feature
  area rather than `components/common/table.tsx`'s heavier grid-column machinery, which is sized
  for the full AdminCollection data-table system this small panel table doesn't need.

### 4. Lane docs loaded
- [x] Prior SESSION "Next session" section read (SESSION_0593 §WS-D row; SESSION_0603 WS-A close).
- [x] Wiki entries for target area read: `state-of-project-projection.md`, `planning-ledger.md`
  PL-006/PL-007 rows re: token-cost + dataviz.
- [x] Runbook consulted: N/A (no dedicated `dataviz` SKILL.md file exists in the repo yet — the
  guidance is carried in the dispatch prompt + `planning-ledger.md`/SESSION_0593's prose
  ("semantic-token palette, theme-aware, area fill + faint grid + emphasized endpoint"); confirmed
  via graphify query + repo search, no `.claude/skills/*dataviz*` or `docs/**/dataviz*` file
  exists — applied the guidance directly, consistent with the existing `stroke-primary`/
  `stroke-border` SVG idiom in `components/web/lineage/lineage-tree-canvas/lineage-connector-layer.tsx`).

### 5. Dev environment confirmed
- Dev server command: `npx next dev --turbo` (from `apps/web/`) — not run this session (no runtime
  surface probe required beyond `next build`; panel self-fetches from `main` over HTTPS, which the
  worktree can exercise via `next build`'s route-tree compile, not a live dev-server smoke).
- Working directory: `apps/web/`
- Verification commands confirmed: `bun run typecheck`, `bunx oxlint`, `bunx oxfmt --check`, own
  `token-cost-parse.test.ts` (bun test).
- Read `sop-test-writing.md` §2 (parallel=1 gate) — test file is pure-function only, no
  `mock.module`, no DB fixture (taxonomy: unit-pure).

### 6. FAILED_STEPS check
- Prior failures in this area: none found for `state-of-dojo/token-cost` (new subtree).
- Mitigation acknowledged: n/a (no prior failure to avoid repeating).

## Gates

Full local (typecheck / oxlint / oxfmt / `next build` on the real diff / affected test). Commit on the
lane branch; **HOLD push** for the operator's word (apps/web → BBL prod deploy).

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0608_TASK_01 | done | `telemetry:` frontmatter schema (`docs/protocols/state-of-dojo-telemetry-schema.md`) + seeded 3 sessions (0587 real-derived, 0603/0598 illustrative) + `$/token` cost table (in the schema doc) |
| SESSION_0608_TASK_02 | done | `token-cost-parse.ts` (pure, 12 tests) + `fetch-token-cost.ts` (`server-only` feed mirroring `fetch-state.ts`) |
| SESSION_0608_TASK_03 | done | `TokenCostPanel` (frozen-contract shape) + `TokenCostChart` (dataviz-guidance SVG area chart) + accessible session/model tables; optional `/app/token-cost` route |

## Verification

| Gate | Command | Result |
| --- | --- | --- |
| Typecheck | `bun run typecheck` (root) | PASS — all workspaces exit 0, incl. `@ronin-dojo/web`. |
| Lint | `bunx oxlint components/app/state-of-dojo lib/state-of-dojo app/app/token-cost` | PASS — 0 warnings/errors, exit 0. |
| Format | `bunx oxfmt --check <owned files>` → `bunx oxfmt <owned files>` | Initial check found 5 unformatted files (own files only); reformatted; re-check PASS. |
| Unit test | `bun test lib/state-of-dojo/token-cost-parse.test.ts` (single file — isolation not needed per `sop-test-writing.md` §2) | PASS — 12 pass / 0 fail / 12 expect() calls. |
| Build | `npx next build` (from `apps/web`) | PASS — exit 0. Compiled successfully (5.8min), TypeScript finished (9.1min), static pages generated, route tree lists `ƒ /app/token-cost`. One PRE-EXISTING Turbopack NFT warning (`next.config.ts` → `server/admin/storage/monitoring/queries.ts` → `app/app/storage/monitoring/page.tsx`) — unrelated to this session's files. |

Runtime proof: none captured beyond the build's route-tree compile — no dev-server smoke run this
session (self-fetching panel reads `main` over HTTPS; `next build`'s successful compile + route
listing is the proof for this lane's scope, consistent with "lowest-priority of the trio, ship
clean if the chart is heavy" — the chart shipped, so no reduced-scope fallback was needed, but a
live dev-server render was not separately proven).

## Proposed ledger edits (for the merge-wave sweep — do NOT apply here)

- **goals-ledger.md G-023** — progress note: WS-D (token-cost tracker) landed — telemetry schema +
  seed (3 sessions) + pure parser (12 tests) + `server-only` feed + `TokenCostPanel`
  (dataviz-guidance SVG area chart + accessible tables) + optional `/app/token-cost` route.
- **drift-register** — none identified.
- **wiring-ledger** — none identified (no cross-surface wiring beyond the panel's own self-fetch).
- **custom-component-inventory.md** — new components to register at the merge-wave's docs sweep:
  `TokenCostPanel`, `TokenCostChart`, `TokenCostSessionTable`, `TokenCostModelTable`
  (`apps/web/components/app/state-of-dojo/token-cost/*`).

## What's deliberately not done

- The `dataviz` guidance is referenced repo-wide (planning-ledger, SESSION_0593) but no
  `.claude/skills/*dataviz*` or `docs/**/dataviz*` SKILL file actually exists yet — applied the
  described treatment (semantic tokens, faint grid, area fill, emphasized endpoint) directly from
  the dispatch prompt + existing SVG precedent (`lineage-connector-layer.tsx`) rather than a
  skill file that isn't there. Named, not fixed (no skill-authoring in this lane's scope).
- The `$/token` cost table's rates are explicitly flagged **estimated/unverified** (no real Console
  billing data available in-session) — see the schema doc's own caveat.
- SESSION_0587's original freeform `telemetry:` string is preserved as a comment (not deleted) —
  its content (orchestrator Fable→Opus split) has no recorded token count, so it was not folded
  into the structured rows rather than fabricated.
- No dev-server runtime smoke (see Verification note above) — out of scope for this lane's gates
  per the dispatch (`next build`'s route-tree proof was treated as sufficient).

## Next session

### Goal

### First task
