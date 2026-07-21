---
title: "SESSION 0600 — WS-1: /app admin landing shell (Command Deck promotion + quick-action surface + loop-board embed)"
slug: session-0600
type: session--implement
status: staged
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0599
sprint: S12
lane: repo
recipe: lane
goal_ids: [G-026]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0599.md
  - docs/knowledge/wiki/goals-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0600 — WS-1: /app admin landing shell

> **Pre-staged `recipe: lane` stub (ADR 0049), planned SESSION_0599 (G-026 WS-1).** Reservation branch
> `session-0600-admin-landing-shell`. Adopt: FS-0024 guard, FS-0030, `checkout` + ff to main, flip
> `staged` → `in-progress`. **`apps/web` change → deploys on push; hold push for operator "go".**
> Disjoint from WS-2 nav (owns `nav.tsx`/`sidebar.tsx`) and from SESSION_0593 (owns the panel dir).

## Date

<fill at adopt>

## Operator

Brian + <agent>-session-0600

## Goal

Build the visible `/app` admin landing (G-026 WS-1). Promote the beta **Command Deck**
(`app/app/beta/command-deck/*`) to the `/app` landing as the grouped launcher over the existing
7-group `ADMIN_SECTION_GROUPS` SOT; build the `DashboardLanding` shell (slot composition — ADR 0045 D4
COMPOSITION, not an AdminCollection); a **quick-action grid** (Command Deck bento) + a **short
`QuickActionCarousel`** (on `carousel.tsx`); the landing hierarchy (actions + attention above fold,
metrics demoted, first-run empty state); and a compact loop-board embed (this embed IS the
AdminTODOist — do NOT revive a personal-todo surface, per ratified G-003).

**Pinned decisions (SESSION_0599 grill — do NOT re-open):**

- Quick-action surface = **grid launcher + short carousel** (both). Grid = Command Deck bento; carousel
  = `components/common/carousel.tsx` for the 5 actions.
- Taxonomy = the **existing 7-group `ADMIN_SECTION_GROUPS` SOT** — do NOT fork a parallel taxonomy.
- Landing = a **composition** (`Wrapper`/`Stack`/`Card`), NEVER routed through `AdminCollection` (D4).
- AdminTODOist = the loop-board embed; no separate todo surface.

**QuickAction contract (Giddy — mirror `NavEntry`):** discriminated union
`{ kind: "link"; href } | { kind: "trigger"; onSelect }`. `link` wraps `<Link>`; `trigger` fires
`onSelect` (opens an app-local drawer — the kernel never imports a Drawer). Concrete `APP_QUICK_ACTIONS`
(app-local config, mirrors `BoardConfig`): add-user (drawer) · add-lead (drawer) · leads-roster (link
`/app/leads`) · loop-board (jump/embed). **Permission-gate the action array at config-build time**
(server-side `can(...)` filter) so the surface never imports the authz system. Drop "edit-user" (needs
a which-user pick — not a zero-arg quick action). RDD-only actions (add-client / client-roster) do NOT
ship in `apps/web`.

**Owned files (disjoint set):**

- `apps/web/app/app/page.tsx` — thin auth-gate + compose the shell.
- `apps/web/app/app/_landing/*` (NEW) — `dashboard-landing.tsx` (shell) · `quick-action-carousel.tsx` ·
  `app-quick-actions.ts` (config) · quick-action grid.
- `apps/web/app/app/beta/command-deck/*` — promote/relocate to the landing (beta dir retirement = WS-5,
  after this lands).
- `apps/web/components/common/carousel.tsx` — add `QuickActionCarousel` (reuse the Embla primitive; do
  not break the 11 existing browse consumers).

**Mount seam (WS-3, NOT this lane):** leave 0593 panel slots as **placeholders** (`<Suspense>` with a
stub). Real panels mount in WS-3 once SESSION_0593 freezes the import-path contract
(`components/app/state-of-dojo/{state,component-catalog,card-catalog,cookbook}-panel.tsx`). Do NOT
create `app/app/{state,component-catalog,card-catalog,cookbook}` route dirs (0593 owns them — R1).

**Landing hierarchy (Desi):** 1) greeting + quick-action grid · 2) attention / 0593 panels (placeholder)
· 3) compact metrics strip (demote today's charts below the fold) · 4) loop-board embed · 5) full
charts. First-run empty state: quick-actions become the hero ("Add your first member/lead"); lean on
the existing `DashboardOnboardingTour`; replace the non-admin "Choose a workspace area" fallback with
the Command Deck launcher. Motion: `useReducedMotion` instant fallback; `haptics.*` best-effort only
(no-op on iOS Safari — never the sole feedback).

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0600_TASK_01 | pending | Command Deck → /app landing launcher + `DashboardLanding` shell |
| SESSION_0600_TASK_02 | pending | quick-action grid + `QuickActionCarousel` + `APP_QUICK_ACTIONS` config |
| SESSION_0600_TASK_03 | pending | landing hierarchy (demote metrics, empty state) + loop-board compact embed |
| SESSION_0600_TASK_04 | pending | review wave (Desi UX + Doug release) + `next build` green |

## Next session

### Goal

### First task
