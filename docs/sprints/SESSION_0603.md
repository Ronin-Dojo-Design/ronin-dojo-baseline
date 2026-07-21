---
title: "SESSION 0603 — BUILD: State-of-Dojo WS-A — projection kernel + State surface + freeze panel contract"
slug: session-0603
type: session--implement
status: staged
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0593
sprint: S12
lane: repo
recipe: lane
goal_ids: [G-023]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0593.md
  - docs/sprints/SESSION_0599.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0603 — BUILD: State-of-Dojo WS-A (kernel + State surface + freeze)

> **Pre-staged build stub (ADR 0049), planned SESSION_0593.** Reservation branch
> `session-0603-sotd-kernel-state`. **Worktree-isolated — do NOT squat the canonical checkout**
> (`git worktree add ../ronin-dojo-app-0603 session-0603-sotd-kernel-state`; the 0599 squat
> root-caused SESSION_0593's collision). Adopt: FS-0030, ff to main, flip status. **Lands FIRST**
> of the State-of-Dojo build lanes — it freezes the WS-3 contract and unblocks SESSION_0599 WS-3 +
> WS-B/C/D. Do not launch until the plan sessions (0599 → 0593) have landed to main.

## Date

<fill at adopt>

## Operator

Brian + <agent>-session-0603

## Goal

Build the **projection framework kernel** + the **State surface** + **freeze the panel contract** — the
critical-path lane of the SESSION_0593 fan-out (G-023 SOT-dashboard slice-2).

**Deliverable:**
1. **Extract the 0585 parse core to a shared lib** (`lib/state-of-dojo/*` or equivalent) that BOTH the
   render script (`scripts/state-of-project.ts`) and the app consume — one parse/feed/classify core, no
   duplication (the projection-only law holds: never writes back to ledgers/sessions).
2. **The projection framework kernel** at `components/app/state-of-dojo/_kernel/*` — the shared
   card/tab/phase-ladder/section vocabulary (planned/in-flight/done · brand tabs · active/beta badges),
   per PL-005 fixed-hue-brand-tint (the mock's "semantic tokens NEVER re-skinned" comment is WRONG — tint
   per brand within a contrast floor). Per-skin masthead title map ("State of the Dojo" dojo skins /
   "State of the Building" MMB).
3. **`state-panel.tsx`** (real) + the **`/app/state`** route rendering the live State projection
   (sessions/goals/risk/needs-you), a **self-fetching async panel**, placement-agnostic, `{ compact? }`,
   owning its own Suspense + empty state.
4. **Placeholder-returning** `{component-catalog,card-catalog,cookbook}-panel.tsx` at the frozen path so
   SESSION_0599 WS-3 (`DashboardLanding`) can import/mount immediately (real impls = WS-B/C).
5. **On-demand render step** wired into `docs/rituals/opening.md` (bow-in: render what's *planned*) +
   `closing.md` (bow-out: render what *changed*) — invoke `scripts/state-of-project.ts` + publish via
   `/preview-artifacts`. Optional/operator-triggered, not mandatory. The `sotd` skill is DEFERRED
   (rung-3 — author after this step runs 2–3×).

**FROZEN contract (ratified SESSION_0593, do NOT change):**
- Panel path = **`components/app/state-of-dojo/*`** (`components/admin/projection/*` is DEAD).
- Panels: `{state,component-catalog,card-catalog,cookbook}-panel.tsx`; kernel at `_kernel/*`.
- **SESSION_0599 owns `app/app/page.tsx` + the `DashboardLanding` shell; this lane never writes
  `page.tsx`** — it mounts by import only. Land placeholder panels first.

**Non-goals:** the real catalog panels (WS-B/C) · token-cost (WS-D) · the lifecycle recipe family (WS-E) ·
the landing shell / carousel / nav (SESSION_0599) · the `sotd` skill (deferred) · the in-app 7-brand
umbrella (behind the RDD deploy, SESSION_0598).

**Pinned inputs (do NOT re-grill):** ADR 0051 brand tabs (7 brands) · PL-005 skin law · the full
SESSION_0593 decision ledger + frozen contract.

## First task

Worktree-isolate + `/worktree-setup`. Read SESSION_0593's fanout (decision ledger + frozen contract) +
SESSION_0599 WS-3 gate + the 0585 slice-1 artifacts (`state-of-project.ts`,
`state-of-project-projection.md`, `state-of-project-parse.ts`). Cody-preflight before any component
(reuse the `carousel`/card/data-table L1 primitives; check the Dirstarter inventory).

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0603_TASK_01 | pending | Extract 0585 parse core → shared lib (script + app consumers) |
| SESSION_0603_TASK_02 | pending | Projection kernel `_kernel/*` (card/tab/phase/section, skin law) |
| SESSION_0603_TASK_03 | pending | `state-panel.tsx` + `/app/state` route (real State projection) |
| SESSION_0603_TASK_04 | pending | Placeholder panels at frozen path (unblock 0599 WS-3) |
| SESSION_0603_TASK_05 | pending | On-demand ritual render step (opening/closing + /preview-artifacts) |

## Next session

### Goal

### First task
