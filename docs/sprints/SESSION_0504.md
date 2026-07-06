---
title: "SESSION 0504 — page-code-review recipe on page #2 = /lineage/[treeSlug]"
slug: session-0504
type: session--implement
status: in-progress
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

- **Refactor depth of the island** — how aggressively to extract (hooks + presentational sub-components) vs.
  a lighter touch. Resolved after the review + operator report (directive: report baseline + findings first).

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
| SESSION_0504_TASK_01 | in-progress | Desi + Giddy scored review → prioritized fix list |
| SESSION_0504_TASK_02 | pending | explore-view e2e (behavior harness) |
| SESSION_0504_TASK_03 | pending | /fallow-fix-loop behavior-preserving fixes |
