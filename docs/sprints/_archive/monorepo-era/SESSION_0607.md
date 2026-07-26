---
title: "SESSION 0607 — BUILD: State-of-Dojo WS-C — Cookbook panel"
slug: session-0607
type: session--implement
status: closed
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0607
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

Brian + claude-session-0607

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

## Pre-flight: CookbookPanel

### 1. Existing component scan

- Searched `components/web/` and `components/common/`: no existing "recipe card"/"router table"
  component — `components/common/card.tsx` (`Card`), `badge.tsx` (`Badge`), `tabs.tsx`
  (`Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`), `empty-list.tsx` (`EmptyList`), `heading.tsx`
  (`Heading`) all fit unmodified. No new common primitive needed.

### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes — confirms `Card`/`Badge`/
  `Tabs`/`EmptyList`/`Heading` are the L1 primitives for card-listing + filter-tab surfaces; no raw
  `<div className="flex">`/`<button>` substitutes used.
- Closest sibling pattern: `state-panel.tsx` (the WS-A reference panel) + `_kernel/projection.tsx`'s
  `ProjectionCard`/`WorkBoard`/`BrandTabs`.
- **Primitive API spot-check:**
  - `Card({ hover?, focus?, isRevealed?, isHighlighted?, className, render, ...props })` — same call
    shape `ProjectionCard` already uses (`hover={false} focus={false}`).
  - `Badge({ variant: 'primary'|'soft'|'outline'|'success'|'caution'|'warning'|'info'|'danger', size:
    'sm'|'md'|'lg', prefix?, suffix?, children })`.
  - `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` — Base UI `Tabs` wrapper, `value`/`defaultValue` on
    `Tabs`, `value` on `TabsTrigger`/`TabsContent` (same API `BrandTabs` already wraps).
  - `EmptyList({ className, render?, ...props })` — defaults to `<p>`.
  - `Heading({ size: 'h1'..'h6', className, render?, ...props })`.

### 3. Composition decision

- [x] Composing existing components: `Card`, `Badge`, `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`,
  `EmptyList`, `Heading` (from `components/common/`) + `ProjectionSection`/`PanelSkeleton` (from the
  frozen `_kernel/projection.tsx`).
- **Deliberate deviation from the stub's literal "compose BrandTabs" line:** `_kernel/projection.tsx`'s
  `BrandTabs` is typed to `BrandTabPanel = { skin: BrandSkin; content }` where `BrandSkin.key:
  ProductLane` (`"rdd"|"bbl"|"mmb"`) — recipes are cross-brand governance docs (no product-lane
  dimension), so shoehorning `PipelineStage` into that type would either fail to typecheck or
  misrepresent the data as brand-scoped. Instead the panel composes the SAME underlying `Tabs`/
  `TabsList`/`TabsTrigger`/`TabsContent` L1 primitives `BrandTabs` itself wraps, filtering by
  `PipelineStage` — same mechanism, correct dimension. `_kernel/*` is untouched (frozen, per the
  dispatch's hard rule).

### 4. Lane docs loaded

- [x] SESSION_0607 stub (this file) read in full before bootstrap.
- [x] `_kernel/contract.ts`, `state-panel.tsx`, `fetch-state.ts`, `parse.ts`, `_kernel/projection.tsx`,
  `_kernel/phase.ts` — all read per the dispatch's "READ these 4 reference files first" step.
- [x] `docs/protocols/SOT_Cookbook.md` + `docs/protocols/recipes/*.md` (all 17 cards) read for the
  parser's real source shape (router table + frontmatter).
- Runbook: N/A (no schema/backend work).

### 5. Dev environment confirmed

- Dev server command: `npx next dev --turbo` (from `apps/web/`) — not run this session (no runtime
  smoke beyond `next build`'s route-manifest proof; static/dynamic route list confirms `/app/cookbook`
  compiles + is registered `ƒ` dynamic).
- Working directory: `/Users/brianscott/dev/ronin-dojo-app-0607/apps/web`.
- Verification commands confirmed: `bun run typecheck`, `bunx oxlint`, `bunx oxfmt --check`,
  `bun run test`, `bunx next build` — all run this session (see Verification table).
- Read `sop-test-writing.md` (test-writing hook) before adding `cookbook-parse.test.ts`: this is a
  pure-logic unit test (no DB/tx/mocks), so the `--parallel=1`/rolled-back-tx patterns don't apply.

### 6. FAILED_STEPS check

- Prior failures in this area: none found for `state-of-dojo/cookbook-*`.
- Mitigation: N/A (first build of this file set).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0607_TASK_01 | done | `cookbook-parse.ts` + `fetch-cookbook.ts` (SOT_Cookbook + recipes/* → stage-tagged rows) |
| SESSION_0607_TASK_02 | done | Real `cookbook-panel.tsx` (compose kernel; frozen contract) + `/app/cookbook` route |

## Verification

| Gate | Command | Result |
| --- | --- | --- |
| Typecheck | `bun run typecheck` (root) | PASS — all workspace packages exit 0 |
| Typecheck (targeted rerun after a fix) | `bunx tsc --noEmit --pretty false` (apps/web) | PASS |
| Lint | `bunx oxlint components/app/state-of-dojo lib/state-of-dojo app/app/cookbook` | PASS — 0 findings |
| Format check | `bunx oxfmt --check` (5 new/changed files) | 1 file needed formatting (`cookbook-parse.test.ts`) → `bunx oxfmt` applied, rechecked clean |
| Unit test | `bun run test lib/state-of-dojo/cookbook-parse.test.ts` | PASS — 32 pass / 0 fail (after fixing a real classifier bug — see below) |
| Build | `bunx next build` (apps/web) | PASS — exit 0; `/app/cookbook` listed as `ƒ` (Dynamic) in the route manifest |

**Bug caught by the test, fixed before commit:** the first `classifyRecipeStage` draft tested
`slug + tags` together, and several `new-brand-*` PLAN-stage cards (`new-brand-intake`,
`new-brand-interview-business`) carry an `onboarding` TAG (they feed INTO the onboarding flow,
they aren't the onboarding build itself) — that wrongly tagged them BUILD via the `onboarding`
keyword. Fixed by testing `slug` alone first (unambiguous), falling back to `tags` then
`title+content` only if the slug doesn't resolve. 16 of the 18 real recipe cards are pinned as
regression cases (the 2 omitted — `new-brand-interview-client`/`-design` — share the identical
`interview` slug-keyword match as `-business`, tested representatively); all classify correctly.

## What landed

- `apps/web/lib/state-of-dojo/cookbook-parse.ts` — pure parser (no fs/network/server-only/React):
  `frontmatterList`, `parseRecipeFrontmatter`, `classifyRecipeStage` (+ `PipelineStage` vocabulary:
  idea/plan/build/review/ship), `parseRouterRows` (SOT_Cookbook.md's router table → `RouterRow[]`
  with linked `recipes/*.md` paths resolved), `buildCookbookEntries` (combinator → `CookbookEntry[]`).
- `apps/web/lib/state-of-dojo/cookbook-parse.test.ts` — 32 tests, including a slug/tags regression
  pin against 16 of the 18 real recipe cards' expected stage.
- `apps/web/lib/state-of-dojo/fetch-cookbook.ts` — `server-only` feed mirroring `fetch-state.ts`:
  raw-CDN read of `SOT_Cookbook.md` + GitHub-contents-API listing of `docs/protocols/recipes/` +
  raw-CDN read of each card, resilient (independent per-source failure → honest empty).
- `apps/web/components/app/state-of-dojo/cookbook-panel.tsx` — real `CookbookPanel` (replaces the
  WS-A placeholder): named export, self-fetching async RSC, `{ compact? }`, owns Suspense + empty.
  Filterable-by-stage tabs (`Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`) + `ProjectionSection`/
  `PanelSkeleton` from the frozen kernel; recipe cards compose `Card`/`Badge` directly (not
  `_kernel`'s `ProjectionCard`, which is typed to the session/goal `BoardCard` shape).
- `apps/web/app/app/cookbook/page.tsx` — new route, mirrors `app/app/state/page.tsx` (`Wrapper` +
  `force-dynamic`).

## Files touched

| Path | Change |
| --- | --- |
| `apps/web/lib/state-of-dojo/cookbook-parse.ts` (new) | pure parser + `PipelineStage` classifier |
| `apps/web/lib/state-of-dojo/cookbook-parse.test.ts` (new) | 32-test unit suite (FS-0027 single-file) |
| `apps/web/lib/state-of-dojo/fetch-cookbook.ts` (new) | `server-only` feed (raw CDN + contents API) |
| `apps/web/components/app/state-of-dojo/cookbook-panel.tsx` | placeholder → real `CookbookPanel` |
| `apps/web/app/app/cookbook/page.tsx` (new) | `/app/cookbook` route |
| `docs/sprints/SESSION_0607.md` | adopt (staged → in-progress) + pre-flight + task log + close |

## Deliberately not done

- No runtime dev-server smoke test (e.g. Playwright/`bun -e` fetch against `/app/cookbook`) — the
  dispatch's gate list names `next build`'s route-manifest proof, not a live-server probe; the panel
  self-fetches from GitHub raw/contents API at request time (no local fixture to point it at without
  network access from the worktree), same posture WS-A's `StatePanel` shipped under.
- Did not wire `CookbookPanel` into any landing-grid mount (0599's `DashboardLanding` shell) — out of
  this lane's owned-file contract; only the standalone `/app/cookbook` route was requested.
- Did not touch `_kernel/*`, sibling panels (`component-catalog-panel.tsx`/`card-catalog-panel.tsx`),
  or `app/app/page.tsx` — all explicitly out of scope per the dispatch's hard rules.

## Proposed ledger edits

None. No wiring/drift/FAILED_STEPS/incident findings surfaced this lane; no new components warrant
a `custom-component-inventory.md` row (all composition, no new common primitive). The merge-sweep
owner should append a `docs/knowledge/wiki/index.md` row for this session per the usual convention.

## Next session

### Goal

Merge-sweep: land WS-B/WS-C/WS-D behind the `live-fanout-sweep.md` review wave, once all three are
GO/GO-WITH-NOTE. This lane holds a clean commit at G3 (review-ready) on `session-0607-sotd-cookbook`.

### First task

Doug review of this commit (or the batched review-wave across WS-B/C/D), then merge-wave.
