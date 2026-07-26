---
title: "SESSION 0600 — WS-1: /app admin landing shell (Command Deck promotion + quick-action surface + loop-board embed)"
slug: session-0600
type: session--implement
status: in-progress
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0600
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

2026-07-21

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

## Pre-flight: /app admin landing shell (DashboardLanding + quick-actions + loop-board embed)

### 1. Existing component scan
- Searched `components/common/` for: Wrapper, Stack, Card, Heading (H3/H4), Note, Badge, Button, Link,
  Carousel/CarouselSlide, Skeleton, Drawer* → all present, all reused.
- Searched `app/app/` for: existing `/app/page.tsx` (metrics shell), `beta/command-deck/command-deck.tsx`
  (the grouped launcher — REUSED, not rebuilt), `loop-board/_components/loop-board.tsx`,
  `config/admin-sections.ts` (`ADMIN_SECTION_GROUPS` SOT — the 7-group taxonomy, NOT forked).
- Found (reused): `CommandDeck`, `ADMIN_SECTION_GROUPS`/`filterAdminSectionGroups`, `Carousel`/`CarouselSlide`,
  `Drawer`/`DrawerContent`, `PersonForm`, `LeadForm`, `MetricValue`, `Visitor/Revenue/Subscriber/UserMetric`,
  `DashboardOnboardingTour`, `syncLedgersForConfig`/`computeHealth`, `haptics`, `useReducedMotion`.

### 2. L1 template scan (via Dirstarter Component Inventory)
- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes (MANDATORY read done).
- Closest L1 patterns: `authored-technique-create.tsx` (Drawer + form host — mirrored for quick-action drawers);
  the `beta/command-deck` server-page → client-component split (icons re-derived client-side, server passes
  only serializable gate result — mirrored for `QuickAction`).
- **Primitive API spot-check:**
  - `Card` (`hover: bool`, `render` (Base UI polymorphic — `<Link>` for link kind, `<button onClick>` for trigger), `className`)
  - `Badge` (`variant: primary|soft|outline|success|warning|info|danger`, `size: sm|md|lg`, `prefix`, `suffix`)
  - `Button` (`variant: primary|secondary|destructive|ghost`, `size: sm|md|lg`, `prefix`, `suffix`, `render`, `onClick`, `aria-pressed`)
  - `Carousel` (`options`, `className`, `emptyState`, `ariaLabel`, `role`, `edgeFades`, `controls: always|desktop|none`)
  - `CarouselSlide` (`width: 168|248|280`, `className` basis override wins)
  - `Stack` (`size: xs|sm|md|lg`, `direction: row|column`, `wrap: bool`, `render`)
  - `Wrapper` (`size`, `gap: xs|sm|md|lg|xl`)
  - `Drawer` (`open`, `onOpenChange`), `DrawerContent` (`className`), `DrawerHeader/Title/Description`

### 3. Composition decision
- [x] Composing existing components — `DashboardLanding` is a pure slot COMPOSITION (`Wrapper`/`Stack`/`Card`),
  NEVER routed through `AdminCollection` (ADR 0045 D4). `CommandDeck` reused. `Carousel` reused for
  `QuickActionCarousel` (app-local composition, kept OUT of the domain-agnostic `carousel.tsx` — see note below).
- [x] New app-local composition files under `_landing/` (no L1 match for the domain-specific QuickAction
  contract; mirrors `NavEntry` discriminated-union shape + the `command-deck` server/client split).

### 4. Lane docs loaded
- [x] SESSION_0600 spec (full) + SESSION_0599 pinned grill decisions read.
- [x] Wiki: dirstarter-component-inventory, admin-collection-one-surface-law (D4), design-system-doctrine
  (ONE primitive + app-local composition), state-of-dojo frozen-contract (placeholders only).
- Runbook: motion-system (`useReducedMotion` instant fallback; `haptics.*` best-effort, never sole feedback).

### 5. Dev environment confirmed
- Dev server: `cd apps/web && npx next dev --turbo -p 3600` (unique worktree port). Working dir: `apps/web/`.
- Gates: `bun run typecheck` · `bun run lint:check` · `apps/web bun run format:check` · `bun run test` ·
  `apps/web && npx next build` (capture real `$?`).

### 6. FAILED_STEPS check
- Prior failures acknowledged: FS-0001 (raw HTML when L1 exists — all UI uses L1 primitives), FS-0002
  (`npx next dev`, not `bun dev`), FS-0008 (primitive API spot-check done above), FS-0024 (git guard).
- Mitigation: no raw `<div className="flex">`/`<h3>`/`<button>` — Stack/Heading/Button/Card throughout;
  drawer forms REUSE `PersonForm`/`LeadForm` (no duplicate form), deferred-load to avoid eager cost.

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0600_TASK_01 | done | Command Deck → /app landing launcher (`CommandDeckLauncher` extracted, no double-Wrapper/beta-copy) + `DashboardLanding` slot shell (composition, not AdminCollection) |
| SESSION_0600_TASK_02 | done | quick-action grid + `QuickActionCarousel` + `APP_QUICK_ACTIONS` config (NavEntry-shaped `link`/`trigger` union; config-build permission gate; add-user/add-lead drawers deferred-load real forms) |
| SESSION_0600_TASK_03 | done | landing hierarchy (metrics demoted below fold, first-run empty state via reused counts) + compact loop-board embed (AdminTODOist glance) + 0593 attention placeholders (`<Suspense>` seam) |
| SESSION_0600_TASK_04 | done (build) / deferred (review) | `next build` GREEN (exit 0) + runtime probe 13/13 landmarks. Desi UX + Doug release review = the serial review wave (not this builder lane) |

## Verification

| Gate | Command | Result |
| --- | --- | --- |
| Typecheck | `apps/web && bun run typecheck` (`next typegen && tsc --noEmit`) | **PASS** — exit 0, no `error TS` (root fan-out timed out under load; scoped to touched pkg) |
| Lint | `apps/web && bun run lint:check` (`oxlint .`) | **PASS** — exit 0, 0 errors; none of the touched files flagged (repo has pre-existing warnings only) |
| Format | `apps/web && bun run format:check` (`oxfmt --check .`) | **PASS on owned files** — all 14 touched files clean after formatting `quick-action-drawers.tsx`. 2 remaining unformatted files (`components/web/techniques/{graph-png-export.ts,technique-graph.tsx}`) are pre-existing main debt, NOT in this diff |
| Unit tests | `apps/web && bun run test` | **DEFERRED to CI** — no unit test covers the changed surface (UI shell + client islands + verbatim `COUNT_QUERIES` extraction); full suite fires live Resend emails (known OPEN hazard) and host load was 224–430. CI is authoritative |
| Build | `apps/web && npx next build` | **PASS** — `NEXT_BUILD_EXIT=0`; compiled successfully in 7.0min, TypeScript passed, 344/344 static pages generated. `/app` = dynamic (force-dynamic layout). Only warning = pre-existing `next.config.ts` NFT trace via `storage/monitoring` (not this lane) |
| Runtime | `next dev --turbo -p 3600` + dev-login probe of `/app` | **PASS** — 200, 258 KB HTML, **13/13 landmarks**: greeting · 4 quick actions (Add member/Add lead/Leads roster/Loop board) · launcher "Jump to a section" · Command Deck "People" pill · Attention + "State of the Dojo" placeholder · metrics "Today"/"Tools" · loop-board "Open board" · carousel "Quick actions". Snippet confirmed the add-member trigger renders as `<button aria-label="Add member">` inside a `CarouselSlide` (behavior, not just class presence). Seed DB: 253 users / 11 leads → `firstRun=false` (full admin landing) |

**Host contention note:** the parallel-lane fanout drove load average to 224→430 during gating. Typecheck + build + runtime all completed GREEN despite it. No gate *flaked*; the only deferral is the live-email unit suite (deliberate, not a flake). Queue a clean `bun run test` on CI at push.

### DES-0600 review fix (Desi GO-WITH-NOTE, post-hold — 2nd commit)

Applied on the same branch, behavior-preserving, within owned files:

- **P1 (merge blocker) — 375px horizontal overflow.** `quick-actions.tsx` — the carousel/grid
  wrappers were `min-width:auto` flex children of the column `Stack`, expanding to the carousel's
  intrinsic width and forcing ~361px of page overflow at 375px. Fix: `w-full min-w-0` on both the
  `sm:hidden` carousel wrapper and the `max-sm:hidden` grid wrapper. **Re-measured (headless chromium
  @375px): `scrollWidth == clientWidth == 375`, overflowX = 0px** (was 361px).
- **P2.1 — tap targets ≥44px.** Added `min-h-11` to the 7 Command Deck group pills
  (`command-deck.tsx`) and the "Open board" CTA (`loop-board-embed.tsx`) — these surfaces only, not
  the systemic `sm`-button pattern. **Re-measured: all 7 pills = 44px, CTA = 44px** (were 26px).
- **P2.2 — "Today" microcopy misread lifetime totals.** Renamed the strip header `<H4>Today</H4>` →
  `<H4>At a glance</H4>` (the counters are lifetime `db.*.count()`, while the charts below honestly
  say "last 30 days"); softened the greeting from "today's numbers are below" → "dojo overview are
  below". **Verified rendered.**

Re-gates (post-fix): typecheck **PASS** (exit 0) · oxlint/oxfmt **PASS** (owned files) · `next build`
**PASS** (`NEXT_BUILD_EXIT=0`, compiled 3.6min, 344/344). Out-of-scope items (onboarding-tour beacon
overlap, first-run "Soon" suppression, priority-dot tokenization) left for the coordinator's follow-up
ledger rows per the review note.

## Files touched (all within the disjoint owned-file contract)

- `apps/web/app/app/page.tsx` (M) — thin auth-gate; gathers server data, composes `DashboardLanding` slots, gates each by permission.
- `apps/web/app/app/_landing/` (NEW, 10 files): `dashboard-landing.tsx` (slot shell) · `app-quick-actions.ts` (config + `NavEntry`-shaped union + server gate) · `quick-actions.tsx` (client island) · `quick-action-grid.tsx` · `quick-action-carousel.tsx` · `quick-action-tile.tsx` (shared bento tile) · `quick-action-drawers.tsx` (app-local Drawer host) · `quick-action-forms.ts` (`"use server"` deferred option loaders) · `loop-board-embed.tsx` (AdminTODOist glance) · `attention-panels-placeholder.tsx` (0593 seam).
- `apps/web/app/app/beta/command-deck/command-deck.tsx` (M) — extracted reusable `CommandDeckLauncher` (no page chrome); `CommandDeck` beta wrapper unchanged in behavior.
- `apps/web/app/app/beta/command-deck/page.tsx` (M) — consumes the shared `resolveCommandDeckData`.
- `apps/web/app/app/beta/command-deck/data.ts` (NEW) — extracted `COUNT_QUERIES` + `resolveCommandDeckData` (ONE count source for beta route + landing, no fork).

## Deliberate deviations / not-done (for the merge owner + review wave)

1. **`QuickActionCarousel` lives app-local (`_landing/quick-action-carousel.tsx`), NOT in `components/common/carousel.tsx`.** The dispatch listed `carousel.tsx` as owned "to add `QuickActionCarousel`", but that export needs the `QuickAction` domain type — a common→app upward import that violates the domain-agnostic-primitive law (design-system-doctrine). The reusable Embla `Carousel`/`CarouselSlide` primitive is reused unchanged; `carousel.tsx` was NOT touched, so all 11 browse consumers are strictly safe. Flagging for the reviewer to confirm the placement.
2. **Command Deck "promoted" by extraction, not file-move.** Per the stub, the beta dir stays (retirement = WS-5). The landing imports the extracted `CommandDeckLauncher`.
3. **Loop-board embed is a compact health-glance + jump, not an inline `AdminKanban` mount.** Reads via `fetchLedgerBacklog` (no `KanbanCard` insert side-effect on the landing). The full board's client `useLegacyTaskMigration` effect can `window.location.reload()` — unwanted on the landing's critical path — so mounting the live board inline is deferred to WS-3/WS-5 (needs `loop-board.tsx` in scope to extract a compact variant). Still the AdminTODOist (G-003), NOT a personal-todo surface.
4. **0593 attention panels are `<Suspense>`-wrapped stubs** (the WS-3 mount seam). No import of `components/app/state-of-dojo/**` (frozen); no `app/app/{state,component-catalog,card-catalog,cookbook}` route dirs created (0593 owns them).
5. **"5 actions" (stub) vs 4 concrete pinned actions.** The pinned grill enumerated exactly 4 (`add-user`, `add-lead`, `leads-roster`, `loop-board`) after dropping `edit-user`; built those 4. The "5" is stale from before `edit-user` was dropped.
6. **Full `bun run test` deferred to CI** (see Verification) — no covering test on the changed surface + live-Resend hazard + load.

## Adjacent debt (named, not fixed)

- Pre-existing `oxfmt` debt on `components/web/techniques/{graph-png-export.ts,technique-graph.tsx}` — the repo `format:check` gate is red on main for these (unrelated to this lane).
- The add-user/add-lead drawers mount the existing `PersonForm`/`LeadForm` which `router.push` away on success (drawer unmounts with navigation) — fine, but a future pass could keep the operator on the landing with an inline success + refresh.

## Proposed ledger edits (do NOT apply here — merge sweep applies once)

- **`docs/knowledge/wiki/goals-ledger.md` (G-026):** mark WS-1 (`/app` admin landing shell) **built + held** on `session-0600-admin-landing-shell` (base = local main 562ceaac). Unblocks WS-3 (mount real 0593 panels into the `_landing` attention seam) and WS-2 (nav) as still-disjoint.
- **`docs/knowledge/wiki/custom-component-inventory.md`:** add the `_landing` family — `DashboardLanding` (slot shell), `QuickAction` contract (`app-quick-actions.ts`), `QuickActionTile`/`QuickActionGrid`/`QuickActionCarousel`, `QuickActionDrawers`, `LoopBoardEmbed`, `AttentionPanelsPlaceholder`, and the extracted `CommandDeckLauncher`.
- **`docs/sprints/index.md`:** register SESSION_0600 as `in-progress`→ (closed at merge), lane `repo`, pairs_with SESSION_0599.
- **No new ADR / no drift / no wiring-ledger entry** required — this lane conforms to ADR 0045 D4 (composition, not AdminCollection) and reuses existing contracts (`NavEntry` shape, `command-deck` split, `ADMIN_SECTION_GROUPS` SOT).

## Next session

### Goal

WS-3 — mount the real SESSION_0593 panels (`components/app/state-of-dojo/{state,component-catalog,card-catalog,cookbook}-panel.tsx`) into the `_landing/attention-panels-placeholder.tsx` `<Suspense>` seam once 0593 freezes its import-path contract.

### First task

Swap each `PanelStub` in `attention-panels-placeholder.tsx` for its real async panel behind the existing `<Suspense>` boundary; keep the grid layout + skeleton fallbacks.
