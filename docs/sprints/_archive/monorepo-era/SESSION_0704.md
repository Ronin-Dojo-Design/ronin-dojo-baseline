---
title: "SESSION 0704 — belt-order students on the BBL lineage tree (PL-026 quick fix)"
slug: session-0704
type: session--lane
status: closed
created: 2026-07-25
updated: 2026-07-25
last_agent: cody-session-0704
sprint: S7
lane: repo
recipe: lane
goal_ids: []
tickets: []
next_session:
pairs_with:
  - docs/sprints/SESSION_0681.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0704 — belt-order students on the BBL lineage tree (PL-026 quick fix)

## Date

2026-07-25

## Operator

Brian + cody-session-0704 (worktree build lane, dispatched from the 0681 W20 wave)

## Goal

Students rendered on the BBL lineage tree appeared in arbitrary order (import-order
`visualSortOrder`). Make them render in **belt order, highest → lowest**, sorted at the READ
MODEL (server projection, `memberTopRank` mechanism — awarded truth, ADR 0035, discipline-scoped)
with a deterministic name-asc tiebreak pinned in tests. Read-model change only; no schema change;
behavior-preserving elsewhere (editor drag-reorder untouched).

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Branch and worktree

- Branch: `auto/session-0704-belt-order-students`
- Worktree: `/Users/brianscott/dev/ronin-0704`
- Status at bow-in: clean, at main `b615cd75`

### Graphify check

- Queries used: `lineage tree students roster read model memberTopRank` (run from canonical, 98 nodes)
- Files selected from graph: `server/web/lineage/queries.ts`, `server/web/lineage/payloads.ts`,
  `lib/lineage/canvas-model.ts`, `components/web/lineage/students-carousel.tsx`,
  `lib/lineage/flatten-lineage.ts`, `components/web/lineage/lineage-tree-board-model.ts`
- Verification note: every file opened and read after Graphify; Graphify used as navigation only.

## Cody pre-flight

### Pre-flight: Backend — belt-order members in the lineage tree projection

#### 1. Auth predicates planned

- No new surface: change lives inside the existing `materializeLineageTreeResult` projection.
  Visibility scoping (PUBLIC / viewer-aware) is untouched and runs BEFORE the sort, so rank
  redaction (`projectPublicPassport` → empty `ranks` → stripped awards) also applies before
  ordering — a rank-hidden member sorts as unranked (no ordering side-channel leak).

#### 2. Existing action scan

- Read path traced: `/lineage/[treeSlug]` (+ claim page, discipline section, galaxy) → oRPC
  `lineage.bySlug` → `getLineageTreeBySlug` → `materializeLineageTreeResult` (the projection).
- Ordering mechanism today: DB `orderBy visualSortOrder asc` + client comparator
  `sortMembers` (`visualSortOrder` → name) in `lib/lineage/canvas-model.ts`, consumed by
  `flattenLineage` (View A timeline), `buildChildGroups` (board/canvas), honor strip and galaxy
  (`visualSortOrder`-keyed). `students-carousel` already groups BY belt but within-group order
  was input-array order.
- Key finding: sorting the array alone would be undone client-side (`sortMembers` re-sorts by
  `visualSortOrder`), so the projection must also REMAP `visualSortOrder` to the belt-order index.
- Editor surface `/app/lineage/[treeId]/edit` uses `getLineageEditorTree` (separate query, raw DB
  `visualSortOrder`) → drag-reorder placement math and its e2e (`editor-drag-reorder.spec.ts`,
  which asserts DB values) are unaffected.
- L1 pattern match: pure-projection helper next to the existing `sortMembers` in the shared
  canvas model — no new component, no new action.

#### 3. Data flow reference

- Flow: public lineage tree read model (SESSION_0179/0180 materialize path).
- Lifecycle stage: public tree viewing (pre-claim funnel surface).

#### 4. FAILED_STEPS check

- Prior failures in this area: FS-0027 (test runner) — mitigated: suite run via `bun run test`
  (`--parallel=1`); new tests use the file's existing runner conventions, no `mock.module` added.
- Domain invariants honored: NEVER scope belt queries by `rank.brand` (BBL BJJ ranks are
  brand-null) — sort scopes by `disciplineId` only, via `memberTopRank` (ADR 0035 §3); BBL roster
  members are placeholder Passports via LineageTree (no Membership/Affiliation dependency).

## Task log

### SESSION_0704_TASK_01 — belt-order sort at the read model — landed

- Added `sortMembersByBeltOrder` to `lib/lineage/canvas-model.ts`: pure, generic over any
  `{ node }` row; orders by `memberTopRank(node, disciplineId)?.sortOrder` desc (highest belt
  first), unranked last, then display-name asc (pinned tiebreak), then node-id asc (full
  determinism). Discipline-scoped exactly like every tree surface; never touches `rank.brand`.
- `materializeLineageTreeResult` (server projection) now belt-orders the surviving members with
  the tree's `disciplineId` and remaps `visualSortOrder` to the belt-order index, so every public
  surface (board, View A timeline, students carousel, galaxy, honor strip) inherits belt order
  through the existing `visualSortOrder`-first comparators with zero component changes.
- Editor read path (`getLineageEditorTree`) untouched — raw DB placement values preserved for
  drag-reorder.

### SESSION_0704_TASK_02 — tests pinning the order — landed

- `lib/lineage/canvas-model.test.ts`: 4 new tests — highest→lowest, unranked last, name-asc
  tiebreak (pinned), node-id determinism fallback, discipline scoping (globally-higher
  other-discipline dan ignored when scoped; wins when unscoped).
- `server/web/lineage/queries.test.ts`: 2 new pure `materializeLineageTreeResult` tests —
  belt order + `visualSortOrder` remap `[0..n]`, and discipline scoping at the projection
  (other-discipline award reads unranked). Existing DB-backed order assertion still passes
  (both fixtures unranked → name-asc tiebreak; comment updated).

## What landed

- Belt-order (highest → lowest) student rendering on the BBL lineage tree, implemented at the
  read model (`materializeLineageTreeResult` + `sortMembersByBeltOrder`), with deterministic
  name-asc tiebreak pinned in unit tests. No schema change, no component changes.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/lib/lineage/canvas-model.ts` | Add `sortMembersByBeltOrder` (pure belt-order comparator, discipline-scoped, name-asc tiebreak) |
| `apps/web/server/web/lineage/queries.ts` | `materializeLineageTreeResult` belt-orders members + remaps `visualSortOrder` to belt-order index |
| `apps/web/lib/lineage/canvas-model.test.ts` | 4 tests pinning belt order, tiebreaks, discipline scoping |
| `apps/web/server/web/lineage/queries.test.ts` | 2 projection tests (order + remap, discipline scoping); fixture helpers extended |
| `docs/sprints/SESSION_0704.md` | This session file |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` (root) | pass (exit 0) |
| `bun run lint:check` (apps/web) | pass (exit 0 — warnings only, all pre-existing) |
| `bun run format:check` (apps/web) | pass (exit 0, 2078 files) |
| `bun run test` (root, full suite) | **flaked — no verdict** (see note) |
| `bun test lib/lineage/canvas-model.test.ts` | pass, 24 tests (exit 0) |
| `bun test server/web/lineage/queries.test.ts` | pass, 35 tests (exit 0) |
| `bun test lib/lineage/flatten-lineage.test.ts` | pass, 5 tests (exit 0) |
| `bun test components/web/lineage/galaxy/bbl-galaxy-from-lineage.test.ts` | pass, 7 tests (exit 0) |
| `bun test lib/lineage/search.privacy.test.ts` | pass, 5 tests (exit 0) |

**Full-suite flake note (honest record):** two full-suite attempts did not produce a clean
verdict. Attempt 1 was self-terminated (a `pkill` re-run race — exit 143, void). Attempt 2 ran
while **multiple sibling-lane suites loaded the host** (≥8 concurrent `bun test` processes on the
shared local DB) and accumulated beforeEach/afterEach **hook timeouts + fixture collisions in
UNRELATED areas** (lead actions, promotion-event authorization — none touched by this diff);
killed as no-signal per merge-owner direction. Signal taken instead from the affected + adjacent
files above (all exit 0, single-file runs per sop-test-writing §2). **CI is authoritative** for
the full suite at the PR gate.

## Artifacts

None.

## Proposed ledger edits

> Lane rule: shared ledgers are NOT edited from this worktree — merge owner applies.

1. **planning-ledger PL-026** — mark the routed quick-fix bullet resolved:
   under "Related quick-fix routed to build (not plan)", append: *"→ RESOLVED SESSION_0704
   (PR: belt-order at the read model — `materializeLineageTreeResult` belt-orders members via
   `sortMembersByBeltOrder` (`memberTopRank` sortOrder desc, discipline-scoped, name-asc
   tiebreak) and remaps `visualSortOrder` so every public surface inherits the order; editor
   drag-reorder path untouched)."*

## Open decisions / blockers

- The projection now **overrides** manual `visualSortOrder` on public surfaces (belt order wins).
  The editor's drag-reorder still writes/reads real DB values on `/app/lineage/[treeId]/edit`,
  but a steward's manual sibling ordering no longer shows on the public tree. If manual-order
  islands are ever wanted back on public surfaces, that's a PL-026 plan-session decision, not a
  quick fix.
- Not verified in a browser from this worktree (no dev server bootstrapped for the lane); ordering
  is pinned by unit tests at the projection + comparator layers. Post-merge visual spot-check of
  `/lineage/rigan-machado-lineage` recommended at merge review.

## Next session

### Goal

Merge-owner review: apply the PL-026 ledger edit, visual spot-check the public tree, merge.

### First task

Open the PR, run the merge-wave gates, spot-check `/lineage/[treeSlug]` student order (black →
lower belts → unranked, alphabetical within a belt).

## Review log

### SESSION_0704_REVIEW_01 — belt-order read model

- **Reviewed tasks:** SESSION_0704_TASK_01, SESSION_0704_TASK_02
- **Dirstarter docs check:** not applicable (no L1 surface touched)
- **Verdict:** Minimal, correct-layer fix: one pure comparator + one projection hook; the
  `visualSortOrder` remap is the load-bearing move (array order alone would be re-sorted
  client-side) and is documented at both sites and pinned by the remap test. Redaction-before-sort
  ordering avoids a rank leak. Editor path proven separate.
- **Score:** 9.0/10
- **Follow-up:** post-merge visual spot-check (see blockers).

## Hostile close review

- **Giddy:** pass — comparator lives beside `sortMembers` in the ONE canvas model; no new
  component, no god-helper; discipline scoping reuses `memberTopRank` (awarded truth, ADR 0035).
- **Doug:** pass with flag — 6 new tests pin order/tiebreak/scoping at both layers; typecheck /
  lint / format exit 0; full local suite produced NO verdict under sibling-lane host load
  (recorded honestly in Verification) — affected + adjacent files all exit 0; CI must be green
  before merge.
- **Desi:** not applicable — no UI component changed.
- **Kaizen aggregate:** 9/10 — smallest change that makes every surface conform; residual is the
  manual-order override note routed to PL-026.

## ADR / ubiquitous-language check

- ADR update not required — ADR 0035 (awarded-truth rank display) confirmed valid and reused;
  no new decision introduced (display-order policy is a read-model detail).
- Ubiquitous language update not required — no new domain terms.

## Reflections

The bug read as "sort the query" but the real mechanism was two layers deep: the DB already
ordered by `visualSortOrder`, and the client comparators re-sort by the same field — so a naive
array sort at the projection would have been silently undone. Remapping `visualSortOrder` inside
the projection turned the existing client machinery into the delivery vehicle for belt order,
keeping the change at exactly one seam. The trap to remember: when a "read model sort" feeds
comparator-driven views, sort the KEY the comparators read, not just the array.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Frontmatter complete (lane: repo, recipe: lane, status: closed, last_agent: cody-session-0704) |
| Backlinks/index sweep | backlinks → wiki index; pairs_with → SESSION_0681 (dispatch origin) |
| Wiki lint | covered by `bun run lint:check` gate (exit 0) |
| Kaizen reflection | Reflections section above |
| Hostile close review | SESSION_0704_REVIEW_01 + hostile table above |
| Review & Recommend | Next session goal written (merge-owner review) |
| Memory sweep | No new standing rule — domain invariants already in memory (rank-brand-nullable, roster-via-lineage-tree) |
| Next session unblock check | No blocker for merge owner; ledger edit staged in Proposed ledger edits |
| Git hygiene | Conventional commit on `auto/session-0704-belt-order-students`; push + PR per lane exit (no merge) |
| Graphify update | Skipped in worktree by design (worktree graphs read 0 nodes; canonical refresh at merge) |
