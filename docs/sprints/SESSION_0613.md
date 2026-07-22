---
title: "SESSION 0613 — G-026 WS-3: mount real SESSION_0593 State-of-Dojo panels into the /app landing seam"
slug: session-0613
type: session--implement
status: staged
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0611
sprint: S12
lane: repo
recipe: lane
goal_ids: [G-026]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0611.md
  - docs/sprints/SESSION_0600.md
  - docs/knowledge/wiki/goals-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0613 — G-026 WS-3: mount real State-of-Dojo panels

> **Pre-staged `recipe: lane` stub (ADR 0049), planned SESSION_0611.** Reservation branch
> `session-0613-ws3-mount-panels`. Adopt: FS-0024 guard, FS-0035 canonical-occupancy check
> (`bash scripts/canonical-claim.sh check --session 0613`), flip `staged` → `in-progress`.
> **`apps/web` change → deploys on push; hold push for operator "go".**

## Goal

Mount the real SESSION_0593 read-projection panels into the `/app` admin landing's attention seam that
SESSION_0600 (WS-1) landed as placeholders. The panels
(`apps/web/components/app/state-of-dojo/{state,component-catalog,card-catalog,cookbook}-panel.tsx`) are
already on `main` (WS-A→D + DES-003 fixes). Replace `AttentionPanelsPlaceholder`'s `<Suspense>` stubs
with the real self-fetching panels behind the frozen import-path contract — no new route dirs, no
re-fork of the panels.

## Inputs to read (do NOT re-discover)

- `docs/sprints/SESSION_0600.md` — the `_landing` seam + the `AttentionPanelsPlaceholder` `<Suspense>`
  contract (this is the mount point).
- The 4 panel components under `apps/web/components/app/state-of-dojo/` (self-fetching async,
  placement-agnostic, optional `{ compact? }` prop per the WS-3 contract in G-026).
- G-026 WS-3 row (goals-ledger) — the mount contract + boundary (0593 owns the panels; WS-3 mounts them).

## Owned files (disjoint)

- `apps/web/app/app/_landing/attention-panels-placeholder.tsx` (→ real mount) + `dashboard-landing.tsx`
  / `page.tsx` if the slot wiring needs it. Do NOT edit `components/app/state-of-dojo/**` (0593 owns).

## First task

Adopt; read the seam + panel contract; replace the placeholder `<Suspense>` stubs with the real panels
(compact variant if the landing hierarchy calls for it); verify at 375px (no overflow regression — the
DES-003 cookbook `TabsList` + token-cost chart already fixed on main) + `next build`.

## Status

Single source of truth is the frontmatter `status:` field.

## Next session

### Goal

### First task
