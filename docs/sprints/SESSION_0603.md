---
title: "SESSION 0603 — BUILD: State-of-Dojo WS-A — projection kernel + State surface + freeze panel contract"
slug: session-0603
type: session--implement
status: in-progress
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0603
sprint: S12
lane: repo
lane_seq: WS-A
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

2026-07-21

## Operator

Brian + claude-session-0603

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

## Pre-flight: state-of-dojo projection kernel + panels

### 1. Existing component scan

- `components/app/state-of-dojo/` — **does not exist** (fresh namespace, frozen by SESSION_0593).
- `components/common/`: `card.tsx` (L1 Card — `render` polymorphic, `bg-card`/`border` tokens),
  `badge.tsx` (`Badge` variant: primary|soft|outline|success|caution|warning|info|danger, size sm|md|lg),
  `tabs.tsx` (`Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` on base-ui — client boundary from the pkg),
  `skeleton.tsx` (`Skeleton`), `empty-list.tsx` (`EmptyList`), `stack.tsx`, `wrapper.tsx`, `heading.tsx`.
- Loop-board precedent: `lib/loop-board/fetch-ledgers.ts` reads governance ledgers from
  `raw.githubusercontent.com/<repo>/main` at runtime (public repo, resilient, `revalidate`-cached) —
  the runtime-feed pattern the State panel reuses. `app/app/loop-board/page.tsx` = async RSC + `force-dynamic`.

### 2. L1 template scan

- Closest L1: `Card` (`components/common/card.tsx`) — compose for projection cards, do NOT hand-roll.
  Primitive props: `Card (render, hover, focus, isHighlighted, className)`, `Badge (variant, size, prefix, suffix)`,
  `Tabs (defaultValue) / TabsList / TabsTrigger(value) / TabsContent(value)`, `Skeleton (className)`,
  `EmptyList (render, children)`, `Wrapper (size, gap)`, `Stack (size)`.
- Admin lists = `AdminCollection` — **N/A here**: a projection dashboard is a composition, NOT a list
  (SESSION_0593 fork 2 / ADR 0045 D4 — "a dashboard is not a list"). Panels compose the L1 Card, not `AdminCollection`.

### 3. Composition decision

- **Composing** `Card` + `Badge` + `Tabs` + `Skeleton` + `EmptyList` into a thin projection `_kernel/*`.
- **New (justified):** the projection vocabulary (phase ladder, work-board columns, brand-skin registry) has
  no L1 twin — it is the WS-A kernel the fan-out depends on. Kept minimal; each panel self-fetches.

### 4. Lane docs loaded

- SESSION_0593 frozen contract + 11-fork decision ledger; SESSION_0599 WS-3 mount gate; the 0585 slice-1
  artifacts (`scripts/state-of-project.ts`, `state-of-project-projection.md`, `scripts/lib/state-of-project-parse.ts`).

### 5. Dev environment confirmed

- Worktree `../ronin-dojo-app-0603` (branch `session-0603-sotd-kernel-state`), bootstrapped via `/worktree-setup`
  (deps + `.env` + `prisma generate` → `.generated/prisma`). Gates from `apps/web/`:
  `bun run typecheck`, `bunx oxlint .` (read-only; `bun run lint` writes), `bun run format:check`, `bun run build`, `bun run test`.

### 6. FAILED_STEPS check

- FS-0034 (parallel lane must run in its own worktree) — **acknowledged**, running in `../ronin-dojo-app-0603`, canonical untouched.
- FS-0002 (dev server = `npx next dev --turbo`) — acknowledged.

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0603_TASK_01 | done | Extracted 0585 parse core → `apps/web/lib/state-of-dojo/parse.ts` (script + app both consume; render script smoke = 373 sessions / 28 goals) |
| SESSION_0603_TASK_02 | done | Projection kernel `_kernel/*` — `contract.ts` (frozen `ProjectionPanelProps`), `phase.ts` (phase vocab + brand-skin registry + masthead map), `projection.tsx` (source-agnostic ProjectionCard/WorkBoard/PhaseLadder/GoalLadders/GoalLadderTable/BrandTabs/PanelSkeleton/PanelPlaceholder) |
| SESSION_0603_TASK_03 | done | Real `state-panel.tsx` (self-fetching async RSC, own Suspense+empty, `{compact?}`) + `lib/state-of-dojo/fetch-state.ts` (server-only GitHub-raw feed, recent-80 cap) + `app/app/state/page.tsx` route (built `ƒ` dynamic) |
| SESSION_0603_TASK_04 | done | Placeholder `{component-catalog,card-catalog,cookbook}-panel.tsx` at the frozen path + signature — mountable by 0599 WS-3 today |
| SESSION_0603_TASK_05 | done | On-demand render step wired into `opening.md` (planned) + `closing.md` (changed) + projection-protocol app-feed note |

## What landed

- **One parse core, three consumers** — moved `scripts/lib/state-of-project-parse.ts` →
  `apps/web/lib/state-of-dojo/parse.ts` (pure, no `fs`/network/`server-only`/React); the render script,
  the `ledger-backlog --json` feed, and the new in-app feed all import it. No duplication.
- **Projection framework kernel** (`_kernel/*`) — source-agnostic vocabulary; WS-B/C compose the same
  pieces. The **frozen panel contract** is a real file (`_kernel/contract.ts`): named export, self-fetching
  async RSC, placement-agnostic, `{ compact? }`, owns its own Suspense + empty.
- **`/app/state`** renders the live projection (work board · goal belt-ladders · risk-watch · needs-you),
  brand-tab scoped (rdd/bbl/mmb), per-skin masthead ("State of the Dojo"). Feed reads `main` over HTTPS,
  resilient, `revalidate`-cached (mirrors `fetch-ledgers.ts`).
- **Placeholder panels** at the frozen path so SESSION_0599 WS-3 mounts immediately (real impls = WS-B/C).
- **On-demand ritual render step** in `opening.md`/`closing.md` (+ projection-protocol app-feed note).

**Gates:** typecheck ✓ · oxlint ✓ · oxfmt (my files) ✓ · `next build` ✓ (exit 0, `/app/state` = `ƒ`) ·
`wiki-lint` 0 err · parse.test 30/0 · feed data-path smoke ✓ (live GitHub → parse → lanes). **Push HELD.**

## Next session

### Goal

WS-B/C/D fan-out against the frozen contract (Brian dispatches): WS-B component/card catalog · WS-C
cookbook · WS-D token-cost · and SESSION_0599 WS-1/WS-3 (landing shell mounts these panels).

### First task

Dispatch WS-B (or the next lane) in its OWN worktree; import the frozen panels from
`components/app/state-of-dojo/*` and compose the `_kernel/*` pieces — do not re-derive the vocabulary.
WS-B/C replace a placeholder panel at its existing path (rebase on this lane).
