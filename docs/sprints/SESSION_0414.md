---
title: "SESSION 0414 — D12 BBL extraction: Petey-plan the subtractive fork (operator-driven)"
slug: session-0414
type: session--open
status: in-progress
created: 2026-06-19
updated: 2026-06-19
last_agent: claude-session-0414
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0413.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0414 — D12 BBL extraction: Petey-plan the subtractive fork (operator-driven)

## Date

2026-06-19

## Operator

Brian + claude-session-0414

## Goal

Open the **D12 BBL extraction** program — but operator-driven, not on autopilot. The operator's
standing directive this session: *"nothing is canonical anymore; I want things to happen the way I
want them as I say them."* So the docs/ADRs (including D12) are reference, not orders. This session's
concrete goal: **Petey-plan the extraction** — grill the un-pinned mechanics into a roadmap (new repo
name/remote, FK-safe prune clusters + order, migration sequence, fresh Neon/Vercel/CI, how the held
teaser patch carries in, where/when to commit the recovered reconciler) — **before** any structural
move. No repo created and no code touched until the operator says go.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0413.md` (now closed this bow-in). It pivoted mid-flight
  from "merge the multi-brand launch fleet" to ratifying **SOT-ADR D12** (BBL → own single-brand repo).
- Carryover: #118 (BBL landing engine) merged + the dark cinematic teaser kept; D12 + amendment
  ratified; reconciler rescued to `apps/web/scripts/reconcile-pods.mjs` (untracked). The 0413 merge
  plan is dropped. This session begins the extraction by **planning it**, operator-led.

### Branch and worktree

- Branch: `main` (local == origin/main at bow-in)
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: one untracked file — `apps/web/scripts/reconcile-pods.mjs` (rescued reconciler).
- Current HEAD at bow-in: `1bf5cf57`

### Drift logged

- Carry-forward from 0413: D-024/D-025 (bun deploy / R2 case-sensitive keys), D-029 (register tree
  slug `bbl-lineage`) — all relevant to the new repo's migration + deploy setup.

## Petey plan

### Goal

Produce an operator-ratified extraction roadmap (and execute only the steps the operator green-lights
this session). Filled during the grill.

### Open decisions (to grill)

- **New repo:** name, remote (new GitHub repo under which org?), local path (`~/dev/<name>`).
- **Fork mechanic:** clone vs `git init` + import; do we keep `ronin-dojo-app` history or start fresh?
- **Prune order:** the FK-safe cluster sequence for ~122 → ~62 models (which clusters first).
- **Migration sequence:** WP (`local.sql`) → monorepo curriculum → Pods exports; what lands first.
- **Reconciler:** rebuild against `local.sql` now (D12 "first data task") vs commit the CSV version as-is.
- **Infra:** fresh Neon project, new Vercel project, CI shape — set up now or after the fork compiles.
- **This session's actual scope:** how far to go today (plan only? plan + stand up empty repo? + reconciler?).

### Risks

- Filled at plan-lock.

### Scope guard

- No new repo, no clone, no code, no infra until the operator explicitly says go.
- FS-0024 git guard before any mutating git; operate from `/Users/brianscott/dev/ronin-dojo-app`.
- `ronin-dojo-app` stays frozen as reference/parts-donor — do not start ripping BBL out of it.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0414_TASK_01 | complete | Bow-in: read opening ritual + SOT-ADR D12; closed SESSION_0413 cleanly; opened 0414; captured the "operator drives / nothing canonical" directive to memory. |
| SESSION_0414_TASK_02 | pending | Petey-plan grill of the D12 extraction mechanics (operator-led). |

## What landed

<!-- Filled at bow-out. -->

## Decisions resolved

<!-- Filled at bow-out. -->

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0413.md` | Closed: filled bow-out, status → closed, recorded the D12 pivot. |
| `docs/sprints/SESSION_0414.md` | New session ledger. |

## Verification

<!-- Filled at bow-out. -->

## Open decisions / blockers

- The entire Petey-plan "Open decisions (to grill)" list is pending the operator.

## Next session

### Goal

<!-- Filled at bow-out. -->

### First task

<!-- Filled at bow-out. -->

## Review log

<!-- Filled at bow-out. -->

## ADR / ubiquitous-language check

<!-- Filled at bow-out. -->

## Reflections

<!-- Filled at bow-out. -->
