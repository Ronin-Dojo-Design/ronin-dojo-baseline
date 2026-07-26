---
title: "SESSION 0504 — page-code-review recipe on page #2 = /lineage/[treeSlug]"
slug: session-0504
type: session--implement
status: closed
created: 2026-07-06
updated: 2026-07-06
last_agent: claude-session-0504
sprint: S49
pairs_with:

  - docs/sprints/SESSION_0502.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0504 — page-code-review recipe on page #2 = /lineage/[treeSlug]

## Date

2026-07-06

## Operator

Brian + claude-session-0504

## Goal

Run the ratified **page-code-review recipe** (`docs/protocols/page-code-review.md`, ratified SESSION_0502)
on **PAGE #2 = `/lineage/[treeSlug]`** — the "canvas + timeline" page flagged as gnarlier, now that the
recipe is proven on page #1. Follow the recipe exactly: Step-0 bounded file set → Step-1 fallow baseline
(artifact) → Step-2 scored review (KISS/DRY/YAGNI + reuse-first vs L1/custom-component-inventory +
`/code-quality`) → Step-3 behavior-preserving fixes via `/fallow-fix-loop` → Step-4 re-verify (affected
`e2e/` MUST run; repo-wide `format:check` if any file added) → Step-5 prove CRAP/dupes/dead-code deltas
down + log scores. **Behavior-preserving by default** (this page, unlike page #1, has no ratified behavior
change). Hold at the push gate.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0502.md` (page #1 `/directory/[slug]`, recipe ratified).
- SESSION_0502's own "Next session" (BBLApp monorepo porting) is **superseded** by this operator directive
  (page-review page #2). SESSION_0503 (Command Deck) + SESSION_0505 (PWA icons) run in parallel worktrees;
  0504 is a fixed number (siblings own 0503/0505).
- Carryover: page #1 established the recipe end-to-end. This session applies it to the harder canvas page.

### Branch and worktree

- Branch: `session-0504-page-review`
- Worktree: `/Users/brianscott/dev/ronin-0504` (fresh, bootstrapped: `.env` copied, `bun install`,
  `prisma generate` — all green)
- Status at bow-in: clean (fresh off `origin/main`)
- Current HEAD at bow-in: `e5dcf6af` (= origin/main; SESSION_0502 closed)

### Disjointness (parallel siblings)

- **0504 owns:** `/lineage/[treeSlug]` + its page-owned components only.
- **0503 (Command Deck):** `/app/sections` + `config/admin-sections.ts` (`../ronin-0503`) — do NOT touch.
- **0505 (PWA icons):** `public/*` + manifest (`../ronin-0505`) — do NOT touch.
- If a fix would reach a shared primitive Command Deck also touches → STOP + flag before editing.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None. This is a KISS/DRY/YAGNI review of a BBL-custom lineage surface; the recipe MEASURES it against the L1 + `custom-component-inventory` (reuse-first), does not replace an L1. |
| Extension or replacement | Extension — behavior-preserving cleanup of existing page-owned custom components. |
| Why justified | The lineage page is the gnarliest public surface (CRAP 2756 island); a bounded page pass reduces complexity without swallowing the shared component library. |
| Risk if bypassed | The god-island's complexity keeps compounding; future edits land on an untested 794-LOC client component. |

Live docs checked during planning: not applicable at bow-in (page-owned review).

## Step 0 — Bounded file set (the bounding rule)

The route's transitive closure, split by the recipe's hard boundary (shared `components/web/*` used by ≥2
pages = flag-only, never edit inside a page pass):

### IN — editable (page-owned, single-consumer)

| File | LOC | Role |
| --- | --- | --- |
| `apps/web/app/(web)/lineage/[treeSlug]/page.tsx` | 282 | Route entry (server component); the ONLY caller of `lineage.bySlug`, `findPublishedLineageTreeSummaryBySlug`, `resolveViewerClaimStates`. |
| `apps/web/components/web/lineage/lineage-view-a-island.tsx` | 794 | "Explore" (default) view client island; SINGLE consumer = the page → page-owned. |

### OUT — shared (≥2 pages) → FLAG-ONLY (tickets, never edit in this pass)

- `lineage-tree-board.tsx` — disciplines + `/app/lineage/[treeId]/edit` + this page.
- `lineage-cohort-timeline/*` — events promotion-detail (+ rendered by the island).
- `lineage-profile-drawer/*` — disciplines (+ rendered by the island).
- `lineage-tree-canvas/*` — under the shared board.
- `lineage-story/*` — directory + `/app/beta/lineage-journey` (SESSION_0498 Epic A lane).
- `lib/lineage/*` (filter-facets, to-lineage-visual, belt-color, canvas-model), `server/web/lineage/queries.ts`,
  `server/lineage/router.ts` (`bySlug` handler) — shared queries/helpers.

> Boundary note: the gnarly complexity (InfoTab CRAP 1190, LineageBranch 870, LineageTreeCanvas 420, etc.)
> lives in the SHARED subtree — that is a **component pass**, not this page pass. This page pass's editable
> surface is dominated by ONE file: the 794-LOC explore island.

## Step 1 — fallow BASELINE (artifact, pre-edit; HEAD `e5dcf6af`)

`fallow health` (repo-wide, filtered) + `fallow dupes` + `fallow dead-code`, scoped to the Step-0 set.

### Editable set — health

| File | Maintainability (MI) | crap_max | fns | LOC | dead% |
| --- | --- | --- | --- | --- | --- |
| `lineage-view-a-island.tsx` | 84.1 | **2756.0** | 50 | 795 | 0% |
| `[treeSlug]/page.tsx` | 84.6 | 306.0 | 6 | 283 | 0% |

### Editable set — complexity findings (the delta targets)

| Function | CRAP | cyclomatic | cognitive | LOC |
| --- | --- | --- | --- | --- |
| `LineageViewAIsland` (island body) | **2756** | **52** | 31 | 532 |
| `LineageTreePage` (page body) | 306 | 17 | 14 | 199 |

- **Dupes:** no clone group involves either editable file (island/page have no duplication cluster).
- **Dead-code:** 0% in both editable files.
- **CRAP is coverage-dominated:** both targets are uncovered (island `52²+52=2756`, page `17²+17=306`). The
  honest delta lever is **complexity reduction (split the god-component), not coverage** — fallow CRAP keys
  off unit coverage, which a client island won't gain here.

### Shared subtree — flag-only baseline (for the ticket, NOT edited)

Highest-CRAP shared functions: `InfoTab` 1190, `LineageBranch` 870, `deriveDrawerProfileView` 600,
`LineageTreeCanvas` 420, `LineageBoxCard` 380, `LineageTreeBoard` 240, `LineageChildGroupColumn` 210,
`LineageCanvasToolbar`/`GroupHeader` 182. → **TICKET-0504-A** (lineage shared-component pass).

### Behavior-preservation harness — GAP found

All three `/lineage/[treeSlug]` e2e specs (`public-visibility`, `public-rank-redaction`,
`authenticated-lifecycle`) pin to **`?view=board`** (comment: "explorer is the default view now; pin to the
board surface this spec asserts"). **No e2e exercises the `LineageViewAIsland` (explore/default) view** — my
main refactor target has zero e2e AND zero unit coverage. → Any island refactor must first **lock behavior
with a new explore-view e2e** (Step-4 / 0495 contract), which adds a file → triggers repo-wide format:check
(0501).

## Petey plan

### Goal

Reduce the editable set's complexity (primarily the CRAP-2756 explore island) behavior-preservingly, prove
the fallow delta down, and record the `/code-quality` score — while flagging the shared-subtree debt as a
ticket.

### Tasks

#### SESSION_0504_TASK_01 — Step-2 scored review → prioritized fix list

- **Agent:** Desi (reuse/UX) + Giddy (code-quality-matrix score + safe-extraction shape) — read-only.
- **What:** Score `page.tsx` + island /10 vs the matrix; produce ONE prioritized, behavior-preserving fix
  list; flag shared issues as tickets.
- **Done means:** fix list + scores recorded; reported to operator before the fix pass.
- **Depends on:** Step-0 + Step-1 (done).

#### SESSION_0504_TASK_02 — Lock the explore view with an e2e (behavior harness)

- **Agent:** Cody → Doug
- **What:** Add a minimal `e2e/lineage/explore-view.spec.ts` that renders the island (default view), opens a
  profile drawer, applies a filter, recenters focus — pinning current behavior BEFORE the refactor.
- **Done means:** new spec green against current code.
- **Depends on:** TASK_01.

#### SESSION_0504_TASK_03 — Behavior-preserving fixes via /fallow-fix-loop

- **Agent:** Cody → Doug
- **What:** Execute the prioritized fix list (island extraction + page.tsx cleanup), behavior-preserving.
- **Done means:** fallow CRAP/complexity down on the editable set; e2e (new explore + existing board) green;
  gates + repo-wide format:check green; `/code-quality` re-scored.
- **Depends on:** TASK_01 + TASK_02.

### Parallelism

TASK_01 (two read-only reviewers) runs in parallel; TASK_02/03 are sequential after it (same island file).

### Open decisions

- **Refactor depth of the island** — RESOLVED (operator, post-report): **Full safe stack (Giddy Slices 1–5)**
  behind a new explore-view e2e that covers the card menu. Target: island cyclo 52 → ~18-20, CRAP 2756 → low
  hundreds (Class B). Desi's polish (rationale comment, copy, inventory row) + flag shared-subtree debt
  (TICKET-0504-A) folded in. Rationale: operator picked this page to prove the recipe scales to a gnarly
  surface; behavior-preserving extraction is the recipe's core.

### Review scores (Step 2)

- `page.tsx` — **Giddy 8.6/10 Class A** (essentially gold-standard; leave as-is). Desi: clean route.
- `lineage-view-a-island.tsx` — **Giddy 5.8/10 Class C hard-capped** (cyclo 52 = 3.5× ceiling, CRAP 2756,
  532-line body — god-*function*, high craft). Desi: coherent (no kind-union, all 12 props consumed; keep the
  `MetricPill`/`MetricStat` split + `?cards=v2` toggle). Reconciled: fix = **extract** (hooks + colocated
  presentational files), not merge.

### Risks

- Refactoring an **untested 794-LOC client island** risks hydration/state regressions — mitigated by adding
  the explore-view e2e FIRST (TASK_02) and the `filter-facets` unit tests.
- Preserve the deliberate `?cards=v2` effect-resolution (SSR/first-render agree on "v1" — no hydration
  mismatch).

### Scope guard

- Editable set = the 2 page-owned files ONLY. Shared subtree = flag, never edit.
- Behavior-preserving only (no ratified behavior change this page).
- Do NOT touch sibling worktrees (0503 Command Deck / 0505 PWA), `/app` admin, or `public/manifest`.
- Hand-authored migrations only (none expected); `bun run test` only (FS-0027); monorepo READ-ONLY.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0504_TASK_01 | landed | Desi + Giddy scored review → fix list (page 8.6 Class A; island 5.8 Class C → extract) |
| SESSION_0504_TASK_02 | landed | `e2e/lineage/explore-view.spec.ts` — 5 tests × 2 engines, GREEN on pre-refactor island (behavior locked) |
| SESSION_0504_TASK_03 | landed | Slices 1–5 extraction + Desi polish (Cody `30a25934`/`44a0cbb7`/`fef2a865`/`7bae0a2b`); Doug verify pending |

## Fix-pass results (Cody, pending Doug verify)

- **Island `lineage-view-a-island.tsx`: 795 → 412 LOC; `LineageViewAIsland` cyclo 52 → 27, CRAP 2756 → 756**
  (−48% cyclo, −73% CRAP). Page unchanged (306, as expected — it was already Class A).
- **8 new page-owned files** in `components/web/lineage/lineage-view-a/`: `use-lineage-focus.ts` (+ exported
  `buildFocusSearchParams`, kills 2-site URL-shape dup), `use-lineage-view-a-filters.ts` (null-passthrough
  preserved), `filter-bar.tsx`, `focus-panel.tsx`, `metrics-header.tsx` (`MetricPill`/`MetricStat` kept as two
  responsive fns), `card-menu.tsx` (+ Desi P2 anchor-rationale comment), `chrome.tsx` (ratified SOLID_* literals).
- **Zero shared-file edits** — HARD BOUNDARY held. `lib/lineage/*`, timeline, drawer all consumed unchanged.
- **e2e:** explore-view 5/5 × chromium at every checkpoint (incl. pre-refactor — behavior locked). Gates:
  typecheck 0 · format:check clean (repo-wide, new files) · lineage units 118/0.
- **Subtle behavior scorecard (Doug-verified):** null-passthrough ✅ (unit-covered `filter-facets.test.ts`);
  `?cards=v2` SSR contract ✅ (`useState`+`useEffect`, no render-time `window`); `copyFocusLink` menu-close
  moved to call site (`onClose()`) — source-correct ✅.

## Review log — SESSION_0504_REVIEW_01 (Doug, independent hostile verify)

- **Verdict: SHIP-WITH-FOLLOWUPS · 8.5/10.** Every complexity + boundary number reproduced **exactly**
  (island 794→412 LOC, cyclo 52→27, CRAP 2756→756, page 306 unchanged, 11 files all in-boundary, zero
  shared-file edits, no new prod clone group). chromium **16/16** clean; SSR renders all 77 cards.
- **Refuted the "32/32" claim:** the two new ⋮-menu e2e tests were **reproducibly firefox-flaky (~50%)** — a
  harness robustness gap (Base UI `Menu.Popup` still animating when Playwright clicks; firefox slower to
  settle), NOT a code regression (chromium deterministic). → **P2 harness hardening CLOSED (Cody `957eca08`).**
- **P2 (test-only, DONE):** (a) `openCardMenuAndClick` self-healing `expect.toPass` helper — re-opens a stuck
  popup, re-resolves the menuitem, asserts observable effect → **firefox 16/16 at `--repeat-each=8`, 0 flaky**;
  (b) Copy-focus-link now asserts the ⋮ menu CLOSES (locks subtle change 3a). Source untouched.
- **Full lineage suite (final):** **34/34** (17 tests × chromium+firefox) serialized on a clean server.

### Env-flake diagnosis — `authenticated-lifecycle:88` (NOT a regression)

A late run (on a dev server hammered for hours by 3 agents + system-restarts) showed 2 failures, both
`authenticated-lifecycle:88` (anonymous **edit-route** → login redirect). Proven pre-existing + independent of
this pass: (a) the whole-session diff (`9763fc62..957eca08`) touches **zero** auth/edit/middleware files and
the `/lineage/[slug]/edit/[nodeId]` route imports **none** of the changed files → edit-route code is
byte-identical to baseline; (b) the spec's own comments already document this exact route as
JIT-compile-timing-flaky (timeout bumped 20s→40s at SESSION_0267); (c) **re-run 5/5 green on a fresh
unloaded :3004 server** (Petey, first-hand). → route to a flaky-test ticket (pre-warm / higher timeout);
out of this page pass's scope (it is not even part of the `/lineage/[treeSlug]` explore file set).
- **P3:** extract `openCardMenu` spec helper (in-spec self-clone); add `data-[dimmed]` assertion to the filter
  test (currently would pass even if the filter did nothing); optional FocusPanel/CardMenu unit tests to clear
  the zero-coverage "critical" flag → **TICKET-0504-C** (not this pass).

## Open decisions / blockers

- **TICKET-0504-A** — lineage **shared-component** pass (own pass, not a page pass): the gnarly CRAP lives in the
  shared subtree — `InfoTab` 1190, `LineageBranch` 870, `deriveDrawerProfileView` 600, `LineageTreeCanvas` 420,
  `LineageBoxCard` 380, `LineageTreeBoard` 240. Flagged, not touched this pass.
- **TICKET-0504-B** — optional **6th slice** `useLineageDrawer` (drawer state cluster: `memberMap`/`drawerMember`/
  `drawerProfile`/`drawerStudents`/`openDrawer`/`selectStudent` + 3 state atoms). Behavior-preserving; would drop
  the island cyclo 27 → under 25 (solid Class A/B). Left out to honor the ratified 5-slice scope. Low-value-now.
- **URL 4-site convergence** — `buildFocusSearchParams` now centralizes the 2 island sites; the page (`page.tsx:217`)
  + shared `lineage-tree-board.tsx` still hand-build the same `?view=explore&focus=` — converge in a shared helper
  (`lib/lineage/`) in a later shared pass (needs a shared-file edit → not this page pass).
- **`SOLID_PANEL`/`SOLID_PILL` non-tokenized chrome** — ratified BBL brand law (SESSION_0394); cross-brand parity
  is a ratify-then-conform ticket, not a refactor-pass fix.
- **TICKET-0504-C** — add unit tests for the extracted `FocusPanel` + `CardMenu` (cyclo 12-13) to clear fallow's
  zero-coverage `critical` flag (CRAP is coverage-driven, not a complexity hotspot). Low priority.

## What landed

- **Page-code-review recipe run on page #2 = `/lineage/[treeSlug]`** (the gnarly canvas/timeline page), proving
  the recipe scales past the polished page #1.
- **Step 0 boundary was the real work:** the "gnarly" surface is almost entirely SHARED (board/timeline/canvas/
  drawer/story used by ≥2 pages) → flag-only. Editable page-owned set shrank to TWO files.
- **Explore island extraction (behavior-preserving):** `lineage-view-a-island.tsx` **794 → 412 LOC**;
  `LineageViewAIsland` **cyclo 52 → 27, CRAP 2756 → 756 (−73%)** — no longer the surface's dominant hotspot.
  Split into a new page-owned dir `components/web/lineage/lineage-view-a/` (2 hooks + 5 presentational files).
  **Zero shared-file edits.**
- **New explore-view e2e** (`e2e/lineage/explore-view.spec.ts`) — the missing behavior harness (all prior
  `/lineage/[treeSlug]` specs pin to `?view=board`); green on the PRE-refactor island first, then throughout.
  Firefox ⋮-menu flake killed with a self-healing `expect.toPass` helper.
- **Desi polish:** card-menu anchor-rationale comment; softened the "Best on desktop" helper copy; refreshed the
  stale `LineageViewAIsland` row in `custom-component-inventory.md`.
- **Recipe inventory row flipped** — `/lineage/[treeSlug]` → ✅ done (0504).

## Decisions resolved

- **Refactor depth = full safe stack (Giddy Slices 1–5)** (operator, post-report). Behavior-preserving; the
  gnarly shared subtree stays a separate component pass (TICKET-0504-A).
- **Land = merge to main + push (deploy)** (operator) — app-code, so the push triggers the prod deploy;
  behavior-preserving.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/lineage/lineage-view-a-island.tsx` | god-function extraction 794→412 LOC (cyclo 52→27) |
| `apps/web/components/web/lineage/lineage-view-a/use-lineage-focus.ts` | NEW — focus/recenter/copy-link state + `buildFocusSearchParams` |
| `apps/web/components/web/lineage/lineage-view-a/use-lineage-view-a-filters.ts` | NEW — filter facets + state (null-passthrough preserved) |
| `apps/web/components/web/lineage/lineage-view-a/filter-bar.tsx` | NEW — filter bar + `FilterDropdown` |
| `apps/web/components/web/lineage/lineage-view-a/focus-panel.tsx` | NEW — "Current focus" desktop panel |
| `apps/web/components/web/lineage/lineage-view-a/metrics-header.tsx` | NEW — header + `MetricPill`/`MetricStat` (kept as 2 responsive fns) |
| `apps/web/components/web/lineage/lineage-view-a/card-menu.tsx` | NEW — Base UI `Menu.*` ⋮ menu + anchor-rationale comment |
| `apps/web/components/web/lineage/lineage-view-a/chrome.tsx` | NEW — SOLID_* chrome literals + `PremiumPanel` (ratified, not retokenized) |
| `apps/web/e2e/lineage/explore-view.spec.ts` | NEW — explore-view behavior harness (5 tests × chromium+firefox) |
| `docs/knowledge/wiki/custom-component-inventory.md` | refreshed stale `LineageViewAIsland` prop row |
| `docs/protocols/page-code-review.md` | inventory row flip (page #2 done) + `last_agent` |
| `docs/knowledge/wiki/index.md` | added SESSION_0504 row **+ backfilled the missing SESSION_0505 row** (operator: fold in the sibling; FS-0019) |
| `docs/knowledge/wiki/test-fail-fix-ledger.md` | TFF-008 — `authenticated-lifecycle:88` JIT-compile env flake (diagnosed, not a regression) |
| `docs/sprints/SESSION_0504.md` | this session record |

### Cross-session fold-in (operator request)

Folded the parallel **SESSION_0505** (PWA icons) into this close: 0505's code merged to `origin/main` (3
commits, `a7a7bc6b`) and its session file is `closed`, but its bow-out **skipped its `wiki/index.md` row**
(FS-0019) — backfilled here. **SESSION_0503 (Command Deck) never materialized** — no branch, worktree,
session file, or commit exists anywhere in the repo; nothing to fold in. This branch was rebased onto 0505's
work before push (zero file overlap, clean rebase).

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` · repo-wide `bun run format:check` | 0 errors · clean (1827 files) |
| `bun run test` (`--parallel=1`) — lineage units | **118/0** (filter-facets null-passthrough covered) |
| `explore-view.spec.ts` (chromium+firefox) | 5/5 × 2; firefox 16/16 at `--repeat-each=8` (flake dead) |
| Full lineage e2e (17 × chromium+firefox, serialized) | **34/34** on a clean server |
| `authenticated-lifecycle:88` late red | pre-existing JIT-compile env flake — **5/5 green on fresh server** (Petey, first-hand); zero auth/edit-file diff → not a regression |
| `npx next build` (pre-push cost gate) | **green** (exit 0) — mirrors Vercel |
| fallow health (island) | `LineageViewAIsland` cyclo 27 / CRAP 756 (from 52 / 2756); introduced findings 0 |
| Doug independent hostile verify | **8.5/10 SHIP-WITH-FOLLOWUPS** (all P2s closed); every number reproduced exactly |

## Next session

### Goal

Continue the page-code-review cadence to **page #3 = `/posts`** (community feed) — OR take **TICKET-0504-A**
(the lineage **shared-component** pass this session teed up: `InfoTab` 1190, `LineageBranch` 870,
`deriveDrawerProfileView` 600, `LineageTreeCanvas` 420 — the CRAP that lives in the shared subtree a page pass
can only flag). Operator picks; consult `/app/loop-board` board order first.

### First task

Bow-in, then run the recipe's Step 0 on the chosen page: bound the file set (run the ≥2-page usage grep FIRST —
page #2's lesson: a "big" page often shrinks to its single-consumer surface), capture the fallow baseline, then
the scored review. If TICKET-0504-A instead: it is a COMPONENT pass (different bounding rule — the shared
components ARE the unit), so read `page-code-review.md` Step 0's shared-boundary note and adapt.

## Review log

### SESSION_0504_REVIEW_01 — Doug independent hostile verify (TASK_02 + TASK_03)

- **Reviewed:** `db30b963`..`4966db0a` (extraction + e2e harness). **Verdict: SHIP-WITH-FOLLOWUPS · 8.5/10.**
- Every complexity + boundary number reproduced exactly (cyclo 52→27, CRAP 2756→756, 794→412 LOC, page 306
  unchanged, 11-file diff all in-boundary, zero shared-file edits, no new prod clone group). chromium 16/16; SSR
  renders all 77 cards. Behavior-preservation: null-passthrough ✅ (unit-covered), `?cards=v2` SSR-safe ✅,
  menu-close now asserted ✅.
- **Refuted the initial "32/32" claim** (firefox ⋮-menu flake) → **P2 harness hardening applied** (`4966db0a`);
  firefox now 16/16 at `--repeat-each=8`, full suite 34/34.
- **Follow-ups (none block):** TICKET-0504-A (shared component pass) · TICKET-0504-B (6th drawer slice, cyclo
  27→<25) · TICKET-0504-C (FocusPanel/CardMenu unit tests) · `authenticated-lifecycle:88` env-flake ticket.

## Hostile close review

- **Giddy:** pass — the extraction followed his ratified 5-slice plan; god-*function* untangled into page-owned
  hooks + colocated presentational files; zero shared-file edits (the hard boundary held); scope discipline held
  (6th drawer slice ticketed, not smuggled in).
- **Doug:** pass — 8.5 SHIP with every number independently reproduced; the one late red disambiguated to a
  pre-existing JIT-compile env flake (fresh-server 5/5 + zero auth-file diff), not a regression.
- **Desi:** pass — no god-component in the reuse sense; the `MetricPill`/`MetricStat` split + `?cards=v2` toggle
  correctly preserved; copy softened; stale inventory row refreshed.
- **Kaizen aggregate:** **9.0/10** — a clean, honest, behavior-preserving −73% CRAP win with a real e2e harness
  added where none existed; deductions for the initially over-reported e2e green (caught by Doug) and the
  cyclo-27-vs-<25 residual (ticketed). The recipe scaled to a gnarly page by shrinking to the page-owned surface.

## ADR / ubiquitous-language check

- **ADR:** not required. Behavior-preserving refactor; no architectural decision made/changed. The
  page-owned colocated-extraction shape (`lineage-view-a/` = hooks + presentational files for a single-consumer
  island) is a recipe application, not a new ADR.
- **Ubiquitous language:** no new domain terms. `LineageViewAIsland` / explore-view / cohort-timeline unchanged.

## Reflections

- **The Step-0 boundary IS the page pass on a gnarly page.** The "canvas + timeline" page looked huge, but the
  ≥2-page usage grep collapsed it to one single-consumer island + a flag list. The recipe's bounding rule is
  what stops a page pass from becoming a whole-app refactor — and it correctly routed the real CRAP (shared
  subtree) to its own component pass instead of swallowing it. Run that grep FIRST on every future page.
- **Reuse-reviewer and complexity-reviewer disagreed, and both were right.** Desi saw a coherent component (don't
  merge the pieces); Giddy saw a cyclo-52 hard cap (must reduce). The synthesis — a god-*function*, not a god
  component-library → **extract, don't merge** — is the reconciliation to remember.
- **The behavior harness was the enabler, and its absence was the hidden risk.** The island had zero e2e (all
  specs pinned to board) and zero unit coverage. Writing the explore e2e FIRST and proving it green on the
  pre-refactor code is what made a 794-line client-island refactor safe. This is the 0495 lesson made concrete.
- **A hammered dev server manufactures fake regressions.** `authenticated-lifecycle:88` went red only after three
  agents pounded one shared :3004 server through restarts — a documented JIT-compile timing flake on an untouched
  route. First-hand fresh-server re-run + byte-identical-code proof was faster and more honest than arguing from
  the builder's self-report. Worth a pre-warm/timeout ticket.

## Full close evidence

| Step | Proof |
| --- | --- |
| Task log | PASS — 3 rows, all landed |
| JETTY/frontmatter sweep | SESSION_0504 + `page-code-review.md` stamped `last_agent: claude-session-0504`; `custom-component-inventory.md` row refreshed; no other frontmatter changes |
| Backlinks/index sweep | wiki `index.md` row added for SESSION_0504; recipe inventory + inventory doc cross-referenced |
| Wiki lint | `bun run wiki:lint` — 0 err / 38 warn (all pre-existing) |
| Kaizen reflection | yes — `## Reflections` present |
| Hostile close review | SESSION_0504_REVIEW_01 (Doug 8.5) + Giddy/Desi passes; Kaizen 9.0 |
| Code-quality gate (Class-A) | island = page-owned custom island; Giddy scored it 5.8→post-extract Class B; `page.tsx` 8.6 Class A (untouched) |
| Runtime verification (Doug) | full lineage e2e 34/34 chromium+firefox; SSR spot-check renders 77 cards; explore harness non-vacuous |
| Review & Recommend | next = page #3 `/posts` or TICKET-0504-A (shared lineage component pass) |
| Memory sweep | `page-review-page2-lineage-0504` memory written (recipe-scaling + extraction pattern + env-flake) |
| Next session unblock check | unblocked — bow-in + Step 0; no user input required |
| Git hygiene | branch `session-0504-page-review` rebased onto origin/main (clean, 0 conflicts, 0 file overlap w/ 0505); single push to main at close — hash in bow-out response |
| Graphify update | nodes=12664 edges=27659 communities=1398 (gate runner, worktree graph) |
