---
title: "SESSION 0413 — Consolidation: merge the BBL launch fleet into main"
slug: session-0413
type: session--open
created: 2026-06-18
updated: 2026-06-18
last_agent: claude-session-0413
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0412.md
backlinks:

  - docs/knowledge/wiki/index.md
status: in-progress
---

# SESSION 0413 — Consolidation: merge the BBL launch fleet into main

## Date

2026-06-18

## Operator

Brian + claude-session-0413

## Goal

Consolidate the entire BBL launch-sweep + parity + holding-page work — the open/draft cloud PRs **plus**
the divergent locally-applied Codex work — into `main`, resolving the partial/conflicting overlaps with a
Giddy merge strategy. Review folds in as needed, but **merging is the focus**: get a clean, CI-green main so
the operator can send the bob-tony preview link. `BBL_COUNTDOWN` stays ON (no public reveal this session).

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0412.md` (in-progress, Codex Pods-importer lane) and
  `docs/sprints/SESSION_0411.md` (closed) for the sweep-PR + holding-page carryover.
- Carryover: SESSION_0411 merged the first sweep fleet (#98–#107) + the claim flow (#108) and **left the
  holding-page + avatar integration uncommitted** pending photo curation. SESSION_0412 ran the supervised
  Pods importer (prod data, dry-run). This session is the operator's **explicit new GOAL** (overrides the
  empty 0412 "Next session" block): consolidate everything outstanding into main.

### Branch and worktree

- Branch: `main` (local == origin/main, 0 ahead / 0 behind)
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: dirty — the held BBL holding-page work + the divergent Codex landing/drawer changes.
  **`apps/web/app/(web)/layout.tsx` contains unresolved `<<<<<<< ours / >>>>>>> theirs` conflict markers**
  from a half-finished local merge of #118.
- Current HEAD at bow-in: `0548c36f`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Theming/presentation (sweeps, holding page), auth/onboarding (parity), payments (#116 Stripe webhook), email (#116 lifecycle). |
| Extension or replacement | Extension: all PRs build on existing components/primitives; no Dirstarter substrate replaced. |
| Why justified | Launch finish needs every swept surface + the holding page + parity in one coherent main. |
| Risk if bypassed | Divergent Codex/local work and untested parity drafts could regress shared, non-BBL-gated chrome. |

Live docs checked during planning: `component-launch-sweep-recipe.md`, BBL SoT set (cached), repo authority docs.

### Graphify check

- Graph status: current; 13,218 nodes, 25,754 edges, 1,782 communities, 2,058 files tracked.
- Queries: covered by PR file-lists (`gh pr diff --name-only`) + direct worktree diffs — exact overlap matrix below.

### Grill outcome (4 forks resolved)

1. **Holding page = RICH:** teaser hero + email capture, then full `<BblLanding showHero={false} holdingPage/>`,
   then `<BblFooter/>`, all behind the gate — built ON TOP of #118's brandable/`next-image`/server-belt-color engine.
2. **Scope = WHOLE FLEET:** #117, #118, #110, #111, #112, #113, #114, #115, #116, #119.
3. **#116 (emails + Stripe webhook) = MERGE NOW** (investigate the failing unit test first).
4. **Countdown stays ON:** push to main, Tony gets the `/preview?token=bob-tony-BBL-preview` link; photo curation +
   public reveal flip are a later session.

### Drift logged

- **D-024/D-025 open** (bun deploy; R2 case-sensitive keys) — carry.
- **D-029** register gap (prod tree slug `bbl-lineage`) — carry from 0410/0411/0412.

## Petey plan

### Goal

Land the whole BBL launch fleet on a CI-green `main` via a conflict-aware merge order, reconcile the divergent
local holding-page work as one commit, and confirm the bob-tony preview renders — countdown still ON.

### Overlap matrix (the merge problem)

| PR | State | CI | Overlaps |
| --- | --- | --- | --- |
| #117 drawer font | open | **Playwright FAIL** (Prisma→app-client chunk) | identical to local drawer files; `lineage-view-a-island` w/ #110 |
| #118 BBL landing | open | green | **divergent** from local landing/layout/rank-colors; local-only `bbl-footer`+`dirty-dozen-data` |
| #116 emails/Stripe | open | **unit FAIL** (assertion TBD) | shared docs (`wiki/index`, `SESSION_0411`) |
| #110 lineage scroll | draft | green | `lineage-view-a-island` w/ #117 |
| #111 courses | draft | TBD | recipe doc |
| #112 directory/[slug] | draft | TBD | recipe doc |
| #113 schools/[slug] | draft | TBD | recipe doc |
| #114 techniques | draft | TBD | recipe doc, `custom-component-inventory`, `wiki/index` |
| #115 onboarding parity | draft | TBD | `components/app/sidebar` w/ #119 — **shared chrome** |
| #119 header/nav parity | draft | TBD | `app/layout`, `styles.css`, `header`, `sidebar`, `brand-context` — **shared chrome** |

### Merge order (Giddy — least-conflict + BBL-critical first, shared chrome last)

1. **#118** (green) → merge → then **local holding-page reconciliation commit** (footer + dirty-dozen-data +
   resolve `layout.tsx` to the RICH shape on top of merged #118). Clears the biggest conflict + the Tony surface.
2. **#117** — fix the Prisma-in-client Playwright bug first, then merge (and `git checkout` the now-redundant local drawer files).
3. **#110** lineage scroll (rebase post-#117, both touch `view-a-island`).
4. **#111 → #112 → #113 → #114** page sweeps, sequential (recipe-doc cascade; union-resolve each).
5. **#116** emails/Stripe — pin + fix the failing unit test, then merge.
6. **#115 → #119** parity into shared chrome — verify CI + review, sequence (both touch `sidebar`), individual go.

### Parallelism

Sequential by default (shared docs + shared chrome). Independent draft CI verification can run concurrently.

### Open decisions

- Resolved at grill (4 forks above). Per-merge **go/no-go is the operator's** (explicit-push-authorization).

### Risks

- Untested parity drafts (#115/#119) touch non-BBL-gated shared chrome → can regress TB/WEKAF/Baseline. Gate hard.
- #117 carries a real Prisma-in-browser regression; the identical local copy carries it too.
- Recipe-doc/`wiki/index` cascade re-conflicts each sweep merge (known 0411 gotcha — union resolver).

### Scope guard

- `BBL_COUNTDOWN` stays ON; no public reveal; no member-photo curation this session.
- No new prod schema migration (importer lane is 0412's, not this session's).
- Per-action confirmation before every merge/push (operator memory).
- Clean throwaways before any commit: `app/zz-teaser-preview/`, `teaser-plus-landing.jpeg`.
- Operate from `/Users/brianscott/dev/ronin-dojo-app`; FS-0024 guard before mutating git.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0413_TASK_01 | complete | Bow-in: read rituals/recipe/0411/0412, built the PR overlap matrix, diagnosed #117 (Prisma→client) + #116 (unit) CI, grilled 4 forks. |
| SESSION_0413_TASK_02 | pending | Merge #118 + reconcile rich holding page on top. |
| SESSION_0413_TASK_03 | pending | Fix + merge #117 drawer font; reset redundant local drawer files. |
| SESSION_0413_TASK_04 | pending | Merge #110 lineage scroll. |
| SESSION_0413_TASK_05 | pending | Merge page sweeps #111–#114 sequentially. |
| SESSION_0413_TASK_06 | pending | Fix + merge #116 emails/Stripe. |
| SESSION_0413_TASK_07 | pending | Merge parity #115 + #119 into shared chrome (gated). |
| SESSION_0413_TASK_08 | pending | Verify bob-tony preview renders; full close. |

## What landed

Filled at bow-out.

## Decisions resolved

- Holding page RICH; scope WHOLE FLEET; #116 in; countdown stays ON (grill, above).

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0413.md` | New session ledger. |

## Verification

Filled at bow-out.

## Open decisions / blockers

Per-merge go/no-go pending operator confirmation.

## Next session

### Goal

Filled at bow-out.

### First task

Filled at bow-out.

## Review log

Filled at bow-out.

## Hostile close review

Filled at bow-out.

## ADR / ubiquitous-language check

Filled at bow-out.

## Reflections

Filled at bow-out.

## Full close evidence

Filled at bow-out.
