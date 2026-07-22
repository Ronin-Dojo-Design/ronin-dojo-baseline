---
title: "SESSION 0613 — G-026 WS-3: mount real SESSION_0593 State-of-Dojo panels into the /app landing seam"
slug: session-0613
type: session--implement
status: in-progress
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

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0613_TASK_01 | done | Mount the 4 real SESSION_0593 panels into the `/app` attention seam behind the frozen import-path contract; rename the honest export `AttentionPanelsPlaceholder` → `AttentionPanels`; verify 375px + desktop + `next build`. |

## What landed

- **New:** `apps/web/app/app/_landing/attention-panels.tsx` — `AttentionPanels` mounts `StatePanel` ·
  `ComponentCatalogPanel` · `CardCatalogPanel` · `CookbookPanel` (all `compact`) from
  `~/components/app/state-of-dojo/*-panel` behind the frozen import-path contract. Panel internals
  untouched (0593/0612 own `components/app/state-of-dojo/**`).
- **Deleted:** `apps/web/app/app/_landing/attention-panels-placeholder.tsx` (the WS-1 stub seam).
- **Edited:** `apps/web/app/app/page.tsx` — import + usage renamed to `AttentionPanels` (slot still gated
  behind `showMetrics`/`metrics.read`; unchanged otherwise).
- **Layout correction (DES):** grid is `sm:grid-cols-2` (max 2-across), NOT the placeholder's
  `sm:grid-cols-2 lg:grid-cols-4`. The real panels are data-rich (kanban work boards, catalogs, cookbook)
  with intrinsic tab strips wider than a ~290px 4-across desktop column; 4-across overflowed the page 135px
  at 1280px (the width-flexible stubs hid this). 2-across gives each panel adequate width; 1-across at mobile.

### Verification

| Check | Result |
| --- | --- |
| `next build` (deploy gate; apps/web) | ✅ success, 344 static pages, `BUILD_ID` written |
| `oxfmt --check` (format:check) | ✅ exit 0 (2025 files) |
| `oxlint` (lint:check) | ✅ exit 0, no warnings in touched files (pre-existing warnings elsewhere only) |
| Runtime 375px (authed `/app`, dev-login admin) | ✅ overflowX 0; 4 real panels stacked 1-col with live projection data (80 sessions · 28 goals · work board) |
| Runtime 1280px | ✅ overflowX 0 after 2-col fix (was 135px at 4-col); State + Component catalog side-by-side, tab strips fit |
| Console (errors) | ✅ only pre-existing analytics/subscriber "Invalid API key" errors (metrics strip, local-dev key gap) — none from WS-3 |
| `bun test` | ⏭️ skipped — no test-covered code touched; avoids live-Resend seam (open FS) |

Held at push gate for the operator's word (apps/web → BBL prod deploy on push).

## Status

Single source of truth is the frontmatter `status:` field.

## Next session

### Goal

### First task
