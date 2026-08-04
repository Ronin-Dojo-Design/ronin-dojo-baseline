---
title: "SESSION 0748 — L3 lane: #378 lineage test-gate fix (collision-free codes + flake stabilization)"
slug: session-0748
type: session--implement
status: closed
created: 2026-08-04
updated: 2026-08-04
last_agent: claude-cody-session-0748
sprint: S13
lane: bbl
lane_seq:
recipe: lane
vault_session:
goal_ids: [G-031]
tickets: ["378"]
next_session:
pairs_with:

  - docs/sprints/SESSION_0744.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0748 — L3 lane: #378 lineage test-gate fix (collision-free codes + flake stabilization)

**Date:** 2026-08-04 · **Operator:** overnight lane (SESSION_0744 fanout) + claude-cody-session-0748
**Driver note:** Claude Cody salvage lane — Codex down for the night, operator-authorized. Commit-only; no push/PR.

## Goal

Issue #378 (test-only, AFK-safe): fix the `slice(0, 16)` Discipline-code truncation-collision in
`node-profile-actions.test.ts` (collision-free codes) + stabilize the P2002/P2034 cross-suite
concurrency flakes in `lineage-member-placement.test.ts` + `reconcile-pending-claims.test.ts`.
Acceptance: full `bun run test` green ×3 consecutive repeats.

## Status

Frontmatter `status:` is the single source of truth.

## Bow-in

- Previous session: `docs/sprints/SESSION_0744.md` — overnight fanout launch; this file is the L3 lane record.
- Branch/worktree: `auto/session-0748-378-lineage-tests` @ `/Users/brianscott/dev/ronin-0748` · status: clean (only untracked `lane-prompt.md`) · HEAD at start: `d2a622a4`
- Parallel-lane assessment: n/a — dispatched lane.
- Pre-build verification (lane prompt mandate): re-read all three test files + the shared fixture; grepped `slice(0, 16)` under `apps/web/**/*.test.ts`; confirmed NO fix landed since #378 was filed (last commits touching owned files: #400/#397/#359); confirmed local prodsnap currently has NO stranded `session-018x-*`/`editor-actions-*` rows and already contains the `{BBL, LINEAGE_PREMIUM/ELITE}` Entitlement definition rows; baseline full-suite run was green (flakes are intermittent — SESSION_0725 observed them at 241-file scale).

## Root causes (confirmed mechanics)

1. **Discipline-code truncation-collision** (`node-profile-actions.test-fixture.ts:39`, shared by
   `node-profile-actions.test.ts` + `node-profile-actions.safe-action.test.ts`):
   `tag("DISC").slice(0, 16)` keeps `session-NNNN-` (13 chars) + the first **3 digits of
   `Date.now()`** — a time-invariant constant (`session-0184-178…`), identical across runs AND
   across concurrent lanes running the same file. Any stranded row (killed run) or concurrent
   seed P2002s `Discipline @@unique([code, brand])`. TFF-010-recurrence documented this exact
   owed fix.
2. **reconcile-pending-claims P2002** (`ensureEntitlement`): non-atomic findUnique-then-create on
   the shared `Entitlement @@unique([brand, key])` definition rows — two concurrent suites on the
   shared local DB both miss, both create, loser throws P2002 in `beforeAll`. Compounding hazard:
   `afterAll` deleted the definition rows it created, yanking them from under any concurrent
   suite's comp-grant path mid-run.
3. **lineage-member-placement P2034**: `applyLineageMemberPlacementUpdate` is one SERIALIZABLE
   transaction over a broad read-set (tree+members) + an AuditLog insert; `services/db.ts` pins
   the client on `globalThis`, and concurrent lanes/suites (incl. the lifecycle seed's
   `sweepStaleLifecycleRows` bulk deleteMany) share the same Postgres — SSI aborts/deadlocks
   surface as Prisma P2034 ("Please retry your transaction") straight into the test.
4. **reconcile happy-path assertion flake** (same conflict class as 3): the reconciler runs each
   binding in a Serializable tx and BY CONTRACT swallows failures, leaving the binding unconsumed
   "so a later sign-in retries" — under cross-suite SSI pressure that surfaces as a happy-path
   assertion failure.

## Delivered

| ID | Status | What landed |
| --- | --- | --- |
| SESSION_0748_TASK_01 | landed | `node-profile-actions.test-fixture.ts` — Discipline code now `createFixtureRunIdentity("node-profile-fx").shortCode("disc")` (unique 8-hex suffix kept inside the 16-char budget; the sanctioned TFF-010 move). Both fixture consumers covered. |
| SESSION_0748_TASK_02 | landed | `reconcile-pending-claims.test.ts` — `ensureEntitlement` → atomic native `upsert`; definition rows no longer deleted in `afterAll` (mirrors `seed-lineage-lifecycle-db.ts`; rows are brand-wide definitions live in prod/prodsnap); happy path wrapped in bounded (×3) loud `reconcileUntilConsumed` mirroring the runtime retry-on-next-sign-in contract. All assertions untouched. |
| SESSION_0748_TASK_03 | landed | `lineage-member-placement.test.ts` — the two placement calls wrapped in bounded (×3) `applyPlacementWithConflictRetry`, retrying on Prisma `P2034` ONLY (Postgres SSI retry contract), any other error rethrows immediately, warn logged when a retry fires. All assertions untouched. |

**Decisions resolved:** None (no assertion was deleted, skipped, loosened, or `.todo`'d — rule 4 upheld).

## Verification

| Command / smoke | Result |
| --- | --- |
| `cd apps/web && bun run test` (baseline, pre-change) | REAL_EXIT=0 — 1972 pass / 0 fail / 5367 expect · 247 files · 312.9s |
| Single-file smokes (4 affected files, post-change) | 6+2+5+2 pass / 0 fail |
| `cd apps/web && bun run typecheck` | REAL_EXIT=0 |
| `cd apps/web && bun run lint` (writes files) | REAL_EXIT=0 — warnings only (pre-existing, unrelated files); working tree after: ONLY the 3 owned test files modified |
| `cd apps/web && bun run test` — proof run 1 | **REAL_EXIT=0** — 1972 pass / 0 fail / 5367 expect · 247 files · 293.4s |
| `cd apps/web && bun run test` — proof run 2 | **REAL_EXIT=0** — 1972 pass / 0 fail / 5367 expect · 247 files · 361.1s |
| `cd apps/web && bun run test` — proof run 3 | **REAL_EXIT=0** — 1972 pass / 0 fail / 5367 expect · 247 files · 286.7s |
| Retry-path telemetry in proof logs | 0 retries fired (`grep "retrying (cross-suite conflict"` = 0 in all 3 runs) — retries are dormant guards, not load-bearing for green |

All gate runs bare (no pipes); `$?` captured immediately as REAL_EXIT after each run.

## Artifacts

None.

## Open decisions / blockers

None. Lane is commit-only; push/PR/merge routed to the AM (SESSION_0744).

## Deliberately NOT done (out of owned set — route forward)

- `editor-actions.test.ts:788` has the SAME truncation bug (`regressionTag("DISC").slice(0, 16)` →
  constant `editor-actions-1`, brand BASELINE_MARTIAL_ARTS) — outside #378's owned files; needs the
  same `shortCode()` move.
- `seed-lineage-lifecycle-db.ts` `sweepStaleLifecycleRows` is not run-scoped: under concurrent
  lanes one lane's sweep can delete another lane's LIVE lifecycle fixture (failure mode would be
  MEMBER_NOT_FOUND, distinct from the P2034 observed; victim-side retry landed here covers the SSI
  side only). Not touched — also consumed by `e2e/lineage/authenticated-lifecycle.spec.ts`.
- No runtime source changed: the reconciler/placement Serializable-tx design and its
  swallow-and-retry contract are untouched (test-only lane).
- Stranded-row DB cleanup: none needed (verified zero stranded rows pre-run).

## Proposed ledger edits (routed via this SESSION file only — shared ledgers not touched, lane rule 3)

- `test-fail-fix-ledger.md` TFF-010 recurrence paragraph: flip the owed `node-profile-actions`
  fix to **fixed (SESSION_0748)**; note remaining `slice(0, 16)` site = `editor-actions.test.ts:788`.
- New/updated TFF row for the SESSION_0725 pair: reconcile P2002 (find-then-create race → upsert +
  keep-definitions) and placement P2034 (SSI abort → bounded P2034-only retry) — **fixed
  (SESSION_0748)**, with the reusable patterns: "find-then-create on a shared unique key is a
  cross-suite race — upsert it" and "a Serializable-tx call in a test needs a bounded
  P2034-only retry on a shared DB".
- Issue #378: close-comment with this session's evidence once the AM merges.

## Close evidence

Lane-scoped close (commit-only exit contract per lane prompt; AM owns merge/push, wiki-lint, and
Graphify refresh in SESSION_0744).

| Step | Proof |
| --- | --- |
| Gates | typecheck 0 · lint 0 · full suite 0/0/0 ×3 (table above) |
| Owned-paths staging | explicit paths only; `lane-prompt.md` NOT staged; `git status` clean of non-owned modifications after lint |
| Tests not weakened | zero assertions removed/loosened; retries bounded, loud, and conflict-class-scoped; proof runs green with 0 retries fired |
| Commit | exact message per lane prompt exit contract |

## Reflections

- A "unique" code derived by truncating OFF the unique suffix is a collision CLASS (TFF-010) — the third
  sighting; grep `slice(0, 16)` on any new fixture. → route: TFF-010 update proposed above (AM applies)
- find-then-create on shared unique keys + delete-shared-definitions-in-afterAll are both cross-suite
  races; upsert + leave definitions is the lifecycle-seed precedent. → route: TFF row proposed above (AM applies)
- Serializable txs on the shared local DB need victim-side bounded retry in tests (P2034-only) —
  runtime contract is retry anyway. → route: TFF row proposed above (AM applies)
