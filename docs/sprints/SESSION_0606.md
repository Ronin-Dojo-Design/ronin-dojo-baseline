---
title: "SESSION 0606 — BUILD: State-of-Dojo WS-B — Component + Card catalog panels"
slug: session-0606
type: session--implement
status: in-progress
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0606
sprint: S12
lane: repo
lane_seq: WS-B
recipe: lane
goal_ids: [G-023]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0603.md
  - docs/protocols/recipes/live-fanout-sweep.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0606 — BUILD: State-of-Dojo WS-B (component + card catalog)

> **Pre-staged `recipe: lane` build stub (ADR 0049), staged SESSION_0609.** Reservation branch
> `session-0606-sotd-component-catalog`. **Own worktree, NEVER canonical** (FS-0034). Depends on WS-A
> (landed on `main` — the frozen kernel + contract). Dispatchable as a Cody subagent inside the
> **SotD-catalog fanout** (`live-fanout-sweep.md`, trio WS-B/C/D) or as a standalone lane.

## Operator

Brian + claude-session-0606

## Date

2026-07-21

## Goal

Replace the WS-A **placeholder** `component-catalog-panel.tsx` + `card-catalog-panel.tsx` with REAL
self-fetching panels projecting the PWCC component specs — the first catalog surface of the projection
framework.

## Owned files (pairwise-disjoint from WS-C/WS-D)

- `apps/web/components/app/state-of-dojo/component-catalog-panel.tsx` (replace placeholder)
- `apps/web/components/app/state-of-dojo/card-catalog-panel.tsx` (replace placeholder)
- `apps/web/lib/state-of-dojo/component-catalog-parse.ts` (new pure parser)
- `apps/web/lib/state-of-dojo/fetch-catalog.ts` (new `server-only` feed — mirror `fetch-state.ts`)
- `apps/web/app/app/components/page.tsx` (new route)
- a thin `brands:` field in the `/files` `SPEC_TEMPLATE` (`docs/knowledge/wiki/files/`)

## Conform (do NOT re-derive; do NOT edit `_kernel/*`)

- **Frozen contract** (`_kernel/contract.ts`): named export `ComponentCatalogPanel` / `CardCatalogPanel`,
  self-fetching async RSC, placement-agnostic, `{ compact? }`, owns its own Suspense + empty. **Copy
  `state-panel.tsx`'s shape.**
- **Compose the kernel** (`_kernel/projection` + `_kernel/phase`): ProjectionCard / WorkBoard /
  ProjectionSection / BrandTabs / GoalLadders / PanelSkeleton. 5-belt phase model if mapping lifecycle→phase.
- **Source** = the PWCC spec files (`docs/knowledge/wiki/files/*.md` frontmatter: `status`/`lifecycle`/
  `wiring` + the new `brands:`) — NOT the 450 KB prose inventory. **Cards = a FACET/tab** of the ONE
  component source (ADR 0040), never a 2nd source. `bugs` via the DBS cross-ref (SESSION_0596) — stub the
  field if 0596 isn't landed.
- **NEVER** write `app/app/page.tsx` (0599's). Cody-preflight before any component.

## Pre-flight: ComponentCatalogPanel / CardCatalogPanel

### 1. Existing component scan
- Searched `components/web/` for: component/card catalog surfaces — none exist (WS-A landed only the placeholders).
- Searched `components/common/` for: card/tabs/badge/heading/skeleton primitives — found (see §2).
- Found: the WS-A `_kernel/*` (`components/app/state-of-dojo/_kernel/projection.tsx` + `phase.ts`) already
  wraps every needed primitive (`ProjectionCard`, `WorkBoard`, `ProjectionSection`, `BrandTabs`, `GoalLadders`,
  `GoalLadderTable`, `PanelSkeleton`) — this is the reference impl per the dispatch; compose it, don't rebuild.

### 2. L1 template scan (via Dirstarter Component Inventory)
- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes.
- Closest L1 pattern: `state-panel.tsx` (WS-A reference panel) — clone its Suspense+async shape and
  kernel composition; no new primitives needed.
- **Primitive API spot-check** (all already composed inside the frozen `_kernel/*`, not touched directly
  by this lane): `Card` (`hover`, `focus`, `className`) · `Badge` (`variant: primary|soft|outline|success|
  warning|info|danger`, `size: sm|md|lg`) · `Heading` (`size: h1..h6`, `className`) · `Skeleton`
  (`className`) · `EmptyList` (`className`, children) · `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`
  (Base UI, `defaultValue`/`value`). This lane imports these ONLY via `_kernel/*` re-exports/composition
  (`ProjectionCard`, `WorkBoard`, `ProjectionSection`, `BrandTabs`, `GoalLadders`, `GoalLadderTable`,
  `PanelSkeleton`) — never imports `components/common/*` directly, matching `state-panel.tsx`.

### 3. Composition decision
- [x] Composing existing components: `_kernel/projection.tsx` (`ProjectionCard`/`WorkBoard`/
  `ProjectionSection`/`BrandTabs`/`GoalLadders`/`GoalLadderTable`/`PanelSkeleton`) + `_kernel/phase.ts`
  (`BRAND_SKINS`, `PHASES`) + `_kernel/contract.ts` (`ProjectionPanelProps`).
- No new component, no `_kernel/*` edits (frozen).

### 4. Lane docs loaded
- [x] SESSION_0606.md read in full (this file, the lane stub).
- [x] Wiki entries read: `_kernel/contract.ts`, `_kernel/projection.tsx`, `_kernel/phase.ts`,
  `state-panel.tsx`, `lib/state-of-dojo/fetch-state.ts`, `lib/state-of-dojo/parse.ts`,
  `docs/knowledge/wiki/files/README.md`, `docs/knowledge/wiki/files/_template/SPEC_TEMPLATE.md`,
  `docs/knowledge/wiki/daily-bug-scan-ledger.md` (SESSION_0596 status check — still `staged`, not
  landed → `bugs` field stubbed empty per the dispatch's explicit fallback).
- [x] Runbook consulted: N/A (projection framework is self-documenting via the frozen contract).

### 5. Dev environment confirmed
- Dev server command: `npx next dev --turbo` (from `apps/web/`).
- Working directory: `/Users/brianscott/dev/ronin-dojo-app-0606/apps/web`.
- Brand/host for testing: BBL (`localhost:3000` default; not needed — no runtime UI change to a live route
  beyond a new `/app/components` route, smoke-checked via the parser test + `next build` route-manifest).
- Verification commands confirmed: `bun run typecheck`, `bunx oxlint`, `bunx oxfmt --check`, `bunx next build`
  (from `apps/web/`); parser test run singly per FS-0027 (`bun test lib/state-of-dojo/component-catalog-parse.test.ts`).

### 6. FAILED_STEPS check
- Prior failures in this area: none area-specific; general FS-0008 (primitive prop spot-check) addressed
  above, FS-0027 (bare multi-file `bun test`) avoided by running the new test file singly.
- Mitigation acknowledged: yes.

## Gates

Full local (typecheck / oxlint / oxfmt / `next build` on the real diff / affected test). Hand-authored
migrations only. Commit on the lane branch; **HOLD push** for the operator's word (apps/web → BBL prod deploy).

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0606_TASK_01 | done | `component-catalog-parse.ts` (pure parser + `component-catalog-parse.test.ts`, 17/0) + `fetch-catalog.ts` (server-only GitHub-raw feed, mirrors `fetch-state.ts`) |
| SESSION_0606_TASK_02 | done | Real `component-catalog-panel.tsx` (composes `_kernel/*`; exports shared `rowToCard`/`rowToLadderRow`/`buildCatalogPanels`) + `/app/components` route (built `ƒ` dynamic) |
| SESSION_0606_TASK_03 | done | Real `card-catalog-panel.tsx` (imports `buildCatalogPanels` from the sibling panel, filters `kind === "card"` — one board/ladder builder, not two) + `brands:` field added to `docs/knowledge/wiki/files/_template/SPEC_TEMPLATE.md` |

## What landed

- **`component-catalog-parse.ts`** — pure parser (no `fs`/network/`server-only`/React, reuses
  `frontmatterField` from `./parse.ts`): reads `slug`/`title`/`status`/`lifecycle`/`pwcc`/`brands`
  flat scalars + `tags`/`wiring` lists (new `frontmatterListField` helper handles both the inline
  `[a, b]` and block-list `- a` YAML shapes this doc set uses) → `CatalogRow`. `bucketComponentPhase`
  maps `PLANNED|WIP|MVP_LIVE|STABLE|DEPRECATED` onto the shared 5-belt `Phase` ladder
  (planned/in-flight/held/done; `DEPRECATED` buckets to `done` + a `deprecated` flag rather than
  reusing the kernel's goal-worded `dropped` badge). `classifyCatalogKind` reads `tags:` for a
  card-ish keyword (`card`/`m-card`/`card-grid`) to split the Cards facet from the same source (ADR
  0040) — no `kind:` frontmatter field exists yet, this is a keyword bridge like
  `classifyGoalProduct`'s Lane-bullet heuristic. `bugs: []` is an explicit stub — SESSION_0596 (the
  DBS-ledger pipeline) is still `staged`, not landed; wiring the real cross-ref is follow-on work.
- **`fetch-catalog.ts`** — `server-only`, mirrors `fetch-state.ts` exactly: lists
  `docs/knowledge/wiki/files/` via the GitHub contents API (`_template/` auto-excluded as a `dir`
  entry, `README.md` explicitly skipped), reads each spec from the raw CDN, `revalidate`-cached
  (900s — specs churn slower than sessions), resilient (`[]`/`degraded` on any failure, never a
  throw). Reuses the `LOOP_BOARD_GH_TOKEN`/`GITHUB_TOKEN` env names — no new env var.
- **`component-catalog-panel.tsx`** — real `ComponentCatalogPanel`: Suspense+async shape cloned from
  `state-panel.tsx`, composes `_kernel/*` (`WorkBoard` + `GoalLadders`/`GoalLadderTable` per brand
  tab via `BrandTabs`). Exports `rowToCard`/`rowToLadderRow`/`buildCatalogPanels` so
  `card-catalog-panel.tsx` reuses the SAME board/ladder builder over its filtered row set rather than
  duplicating it. Deviation from `state-panel.tsx`'s convention: the panel builds its OWN per-tab
  empty state (rather than letting `GoalLadders`'s built-in empty branch render, which is hardcoded
  "No goals for this brand tab" — goal-specific wording that would misdescribe an empty component/
  card tab) — named as a minor kernel-wording tech debt below, not fixed (kernel is frozen this lane).
- **`card-catalog-panel.tsx`** — real `CardCatalogPanel`: filters the SAME `fetchCatalogFeed()` rows
  to `kind === "card"`, imports `buildCatalogPanels` from the sibling panel file. NOT a second data
  source (ADR 0040) — today (pre-`brands:`-backfill) this surfaces 4 card specs (`m-card-pattern`,
  `mammoth-crm-bindings`, `three-level-magnetic-drawer`, `directory-list-component` via its
  `card-grid` tag).
- **`/app/app/components/page.tsx`** — new route, mirrors `/app/state`: `Wrapper size="lg" gap="sm"`
  + `<ComponentCatalogPanel />`, `dynamic = "force-dynamic"`. Built `ƒ` (confirmed in the `next build`
  route manifest).
- **`SPEC_TEMPLATE.md`**: added `brands: <rdd | bbl | mmb — comma-separated…>` line after `lifecycle:`.
  Existing 30 specs are NOT backfilled (out of scope — dispatch only asked for the template field);
  `parseBrands(undefined)` defaults every un-tagged spec to `["rdd"]` today (confirmed live: 28/28
  land in the rdd tab; bbl/mmb tabs render the honest "no `brands:` field yet" empty state).

## Deviations / assumptions (no operator forks reopened — all resolved from the dispatch's own text)

- **`bugs` field:** stubbed `[]` per the dispatch's explicit fallback (SESSION_0596 confirmed `staged`,
  not landed).
- **`brands:` format:** chose a thin flat scalar (`brands: rdd, bbl`), read via the existing
  `frontmatterField` (no new list-parsing needed for this field) — consistent with the doc set's
  existing `pwcc: PWCC-004,PWCC-005,PWCC-006` comma-separated precedent.
- **Kernel wording debt (named, not fixed):** `_kernel/projection.tsx`'s `GoalLadders` hardcodes
  "No goals for this brand tab." — goal-specific copy baked into a component the dispatch explicitly
  asks WS-B to reuse for non-goal data. This lane avoided ever triggering that string (owns its own
  per-tab empty state instead, see "What landed" above) rather than editing the frozen kernel. Flag
  for a future WS-A kernel touch-up (parameterize the empty-state noun) if a next session owns it.
- **compact prop:** mirrors `state-panel.tsx`'s convention exactly — `WorkBoard` always renders (same
  data, per the contract); only the secondary `GoalLadders`/`GoalLadderTable` ladder section is
  trimmed when `compact`.

## Verification

| Gate | Result |
| --- | --- |
| Bootstrap | `worktree-setup` — `.env` copied, `bun install` (756 pkgs), Prisma client present |
| Typecheck | PASS — `next typegen && tsc --noEmit --pretty false`, exit 0 |
| Lint (oxlint, scoped) | PASS — `bunx oxlint components/app/state-of-dojo lib/state-of-dojo app/app/components`, 0 findings |
| Format (oxfmt) | PASS — 2 new files needed `oxfmt` (no `--check`) applied (own files only, no pre-existing drift touched) |
| Unit test | PASS — `bun test lib/state-of-dojo/component-catalog-parse.test.ts` → 17 pass / 0 fail / 30 expect() (run singly, FS-0027) |
| Build | PASS — `bunx next build` exit 0, `/app/components` = `ƒ` (confirmed in route manifest); 1 pre-existing unrelated Turbopack warning (`storage/monitoring`, not touched by this lane) |
| Runtime (feed smoke) | PASS — throwaway script hit the REAL live GitHub contents+raw API for `docs/knowledge/wiki/files/` through `parseComponentSpecFile`: 28 specs listed/parsed, kind {component: 24, card: 4}, phase {planned: 24, held: 2, in-flight: 2}, brand {rdd: 28, bbl: 0, mmb: 0 — expected pre-backfill} |
| Git state | branch `session-0606-sotd-component-catalog` (worktree `…-app-0606`); only owned files touched (confirmed via `git status`) |

## Files touched

| Path | Change |
| --- | --- |
| `apps/web/lib/state-of-dojo/component-catalog-parse.ts` (new) | pure spec-frontmatter parser |
| `apps/web/lib/state-of-dojo/component-catalog-parse.test.ts` (new) | 17 tests, single-file |
| `apps/web/lib/state-of-dojo/fetch-catalog.ts` (new) | server-only GitHub-raw feed |
| `apps/web/components/app/state-of-dojo/component-catalog-panel.tsx` (replaced placeholder) | real `ComponentCatalogPanel` |
| `apps/web/components/app/state-of-dojo/card-catalog-panel.tsx` (replaced placeholder) | real `CardCatalogPanel` |
| `apps/web/app/app/components/page.tsx` (new) | `/app/components` route |
| `docs/knowledge/wiki/files/_template/SPEC_TEMPLATE.md` | added `brands:` frontmatter field |
| `docs/sprints/SESSION_0606.md` | adopted (status/pre-flight/task log/verification, this session) |

## Proposed ledger edits (apply at merge-wave — NOT applied here, lane rule)

- **`docs/knowledge/wiki/custom-component-inventory.md`** — replace the placeholder row (line ~648:
  `` `{ComponentCatalog,CardCatalog,Cookbook}Panel` (placeholders) ``) by splitting out the two now-real
  panels:
  - `` `ComponentCatalogPanel` `` — `apps/web/components/app/state-of-dojo/component-catalog-panel.tsx`
    — "Real Component-catalog projection: every `docs/knowledge/wiki/files/` PWCC spec, brand-tab
    scoped, as a lifecycle work board + belt-ladder. Self-fetches via `fetch-catalog.ts`; exports the
    shared `rowToCard`/`rowToLadderRow`/`buildCatalogPanels` mappers `CardCatalogPanel` reuses. Mounted
    at `/app/components`."
  - `` `CardCatalogPanel` `` — `apps/web/components/app/state-of-dojo/card-catalog-panel.tsx` — "The
    Cards facet of the SAME catalog source (ADR 0040) — filters to `kind === \"card\"`, reuses
    `ComponentCatalogPanel`'s board/ladder builder. Not yet mounted at a route (WS-B scope was the
    panel + the frozen contract; a `/app/cards` route or landing-shell slot is follow-on)."
  - `` `CookbookPanel` `` stays a placeholder (WS-C's scope, not this lane's).
- **Kernel wording debt** — consider routing "`GoalLadders`'s hardcoded 'No goals for this brand tab'
  empty copy is goal-specific, reused verbatim by WS-B/C for non-goal data" to `drift-register.md` (a
  D-row) if a future kernel-touch session wants to parameterize it; this lane worked around it instead
  of filing a formal drift row (informational only, does not block anything today).
- **`docs/knowledge/wiki/files/README.md`** — NOT touched this lane (out of owned-files scope); a
  follow-on could backfill `brands:` on the existing 30 specs + note the new field in the "Add a new
  spec" section.

## Next session

### Goal

WS-C (cookbook panel, SESSION_0607 per the fanout trio) and/or a `/app/cards` route + landing-shell
mount for `CardCatalogPanel` (not in this lane's owned-file scope) — plus the merge-wave sweep applying
the proposed ledger edits above once WS-B/C/D all land.

### First task

Merge-wave: apply the `custom-component-inventory.md` proposed edit, confirm no cross-lane file
collisions with WS-C/WS-D, re-run gates on `main` post-merge.
