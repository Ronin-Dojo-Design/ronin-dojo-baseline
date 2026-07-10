---
title: "SESSION 0519 — Consolidate RankAward writers behind RankEntry"
slug: session-0519
type: session--implement
status: closed
created: 2026-07-09
updated: 2026-07-09
last_agent: codex-session-0519
sprint: S6-rank-entry
pairs_with:
  - docs/sprints/SESSION_0518.md
  - docs/knowledge/wiki/wiring-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0519 — Consolidate RankAward writers behind RankEntry

## Date

2026-07-09

## Operator

Brian + codex-session-0519

## Goal

Resolve WL-P2-42 by routing the remaining live RankAward writers through one RankEntry compatibility boundary, preserving each path's existing authorization and domain semantics while synchronizing canonical RankEntry state atomically.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0518.md`.
- Carryover: SESSION_0518 made `/app/profile` RankEntry-rooted and recorded WL-P2-42 for the claim-finalization, add-person, and lineage-node promotion-date writers that still bypass the compatibility helper.

### Branch and worktree

- Branch: `main`.
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`.
- Status at bow-in: clean.
- Current HEAD at bow-in: `cd26c449`.
- FS-0024 guard: canonical cwd and `Ronin-Dojo-Design/ronin-dojo-baseline` origin confirmed.

### Dirstarter alignment

| Field                       | Answer                                                                                                                                       |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Dirstarter baseline touched | Prisma transaction/service boundaries; no schema or baseline UI change planned.                                                              |
| Extension or replacement    | Extension: centralize Ronin's RankEntry compatibility write invariant inside the existing Prisma service layer.                              |
| Why justified               | RankEntry is BBL domain state layered over the retained RankAward migration anchor; every live writer must preserve both in one transaction. |
| Risk if bypassed            | A writer can update RankAward while leaving the canonical RankEntry stale, recreating a two-source-of-truth defect.                          |

Live docs checked during planning: local Dirstarter Prisma inventory and alignment URL; no upstream capability is replaced.

### Graphify check

- Graph status: current; stats at bow-in: 16,809 nodes, 33,465 edges, 2,297 communities, 2,570 files tracked.
- Query used: `RankEntry RankAward claim finalize add person lineage promotion writers WL-P2-42`.
- Files selected from graph:
  - `apps/web/server/admin/lineage/claim-finalize.ts`
  - `apps/web/server/admin/users/actions.ts`
  - `apps/web/server/web/lineage/node-profile-actions.ts`
  - `apps/web/server/belt/router.ts`
  - `apps/web/server/belt/queries.ts`
- Verification note: exact files and focused tests were opened after Graphify; Graphify was navigation, not proof.

### Drift logged

- No new drift ID. WL-P2-42 is the existing canonical wiring item for this migration boundary.
- D-040 confirms `passport-and-shells.md` is stale on Passport cardinality and RankAward wording; SOT-ADR D1 and the RankEntry spec govern this work.

## Petey plan

### Goal

Make RankAward-to-RankEntry synchronization one reusable transaction-safe write boundary and consume it from every live writer named by WL-P2-42.

### Tasks

#### SESSION_0519_TASK_01 — Extract the shared compatibility boundary

- **Agent:** Cody.
- **What:** Move the private belt-router synchronization behavior into one reusable service with the existing canonical status mapping.
- **Steps:** preserve the required RankAward compatibility anchor, accept a transaction client, and keep writes atomic with the caller's existing transaction.
- **Done means:** the belt router and external writers can call one tested compatibility function without duplicating status mapping or upsert shape.
- **Depends on:** nothing.

#### SESSION_0519_TASK_02 — Route claim-finalization writers

- **Agent:** Cody.
- **What:** Synchronize RankEntry when identity-claim and rank-promotion approval update or mint verified RankAwards.
- **Steps:** retain claim idempotency, Passport ownership, verified status, and current audit/authorization behavior; extend focused claim-finalization tests.
- **Done means:** both existing-award and new-award approval paths leave a matching canonical RankEntry.
- **Depends on:** SESSION_0519_TASK_01.

#### SESSION_0519_TASK_03 — Route add-person and promotion-date writers

- **Agent:** Cody.
- **What:** Synchronize RankEntry from admin add-person creation and lineage-node promotion-date updates.
- **Steps:** retain placeholder/person creation authority, transaction rollback behavior, node ownership checks, and immediate date-edit semantics; add focused regression proof.
- **Done means:** both paths update the RankAward anchor and matching RankEntry in the same transaction.
- **Depends on:** SESSION_0519_TASK_01.

#### SESSION_0519_TASK_04 — Verify the global writer boundary

- **Agent:** Doug.
- **What:** Review the diff against the RankEntry canon, sweep live RankAward status/rank writers, and run focused plus proportional repository gates.
- **Done means:** no live bypass named by WL-P2-42 remains; focused tests, typecheck, lint, format, and build pass or any blocker is recorded.
- **Depends on:** SESSION_0519_TASK_02, SESSION_0519_TASK_03.

### Parallelism

TASK_01 is foundational. TASK_02 and TASK_03 touch disjoint writer/test files after the service exists, but one Cody owns the coherent implementation to avoid transaction-contract drift. Doug runs only after the complete diff is ready.

### Agent assignments

| Task                 | Agent | Rationale                                                                 |
| -------------------- | ----- | ------------------------------------------------------------------------- |
| SESSION_0519_TASK_01 | Cody  | Clear service extraction and reuse task.                                  |
| SESSION_0519_TASK_02 | Cody  | Claim authority and idempotency must stay coupled to the shared boundary. |
| SESSION_0519_TASK_03 | Cody  | Add-person and node edits share the same compatibility invariant.         |
| SESSION_0519_TASK_04 | Doug  | Independent standards/spec verification and writer sweep.                 |

### Open decisions

- None at plan-lock. The live schema and SESSION_0518 compatibility contract determine the implementation shape.

### Risks

- Extracting the helper without its caller transaction would permit partial writes.
- Claim-finalization has update-or-create and idempotent branches; all must synchronize without changing approval semantics.
- A broad RankAward grep includes seeds/tests/read-only association writers; only live status/rank fact writers belong in WL-P2-42.

### Scope guard

- No destructive migration, RankMilestone retirement, public-profile read cutover, certificate work, new editor, production data mutation, push, merge, or deploy.
- Do not change existing authorization, claim-compensation, lineage placement, or current-rank rules.

### Dirstarter implementation template

- **Docs read first:** local Dirstarter Prisma inventory; live alignment URL recorded in `dirstarter-docs-inventory.md` (2026-07-09).
- **Baseline pattern to extend:** existing Prisma `$transaction` service/action boundaries.
- **Custom delta:** BBL RankEntry compatibility synchronization over the retained RankAward anchor.
- **No-bypass proof:** no new data layer or form is introduced; existing transaction clients and actions are reused.

## Cody pre-flight

### Pre-flight: Backend — RankAward writer consolidation

#### 1. Auth predicates planned

- [x] Session auth required.
- [x] Org membership verified — not applicable to these existing paths; no org-membership predicate is added or removed.
- [x] Brand column filtered (ADR 0004) — existing action/tree brand boundaries remain unchanged; the compatibility row itself is Passport/rank keyed and has no brand column.
- Authorization approach: preserve each caller's existing boundary: `belt.manage` / `belt.admin` oRPC permissions plus Passport ownership, `adminActionClient` for add-person and claim review callers, and active `NODE_EDITOR` access plus BBL tree lookup for lineage-node edits. The shared service performs persistence only and adds no independent authorization system.

#### 2. Existing action scan

- Consulted `docs/architecture/dirstarter-baseline-index.md`: yes.
- Searched `server/` for: `RankAward`, `RankEntry`, `syncRankEntryFromAward`, `rankAward.create`, `rankAward.update`, `rankAward.updateMany`, and `rankAward.upsert`.
- Related existing actions: `server/belt/router.ts`, `server/admin/lineage/claim-finalize.ts`, `server/admin/users/actions.ts#createPerson`, and `server/web/lineage/node-profile-actions.ts#applyLineageNodeProfileUpdate`.
- L1 pattern match: custom Ronin compatibility service composed inside established Prisma transaction callbacks; no new route/action layer.

#### 3. Data flow reference

- [x] `docs/runbooks/sops/sop-data-and-wiring-flows.md` — flow: existing server mutation → caller-owned Prisma transaction → RankAward compatibility anchor + canonical RankEntry.
- [x] `docs/runbooks/sops/sop-e2e-user-lifecycle.md` — lifecycle stage: admin person creation, claim approval/identity attach, and post-claim lineage profile maintenance.
- Exact schema spot-check: `RankAwardVerificationStatus` = `UNVERIFIED`, `VERIFIED`, `DISPUTED`, `IMPORTED`; `RankEntryStatus` = `PENDING`, `UNVERIFIED`, `VERIFIED`, `DISPUTED`; `RankAward.rankEntry` and `RankEntry.rankAward` are the temporary one-to-one anchor, with `RankEntry.rankAwardId @unique` and `RankEntry @@unique([passportId, rankId])`.
- Test-writing runbook: `docs/runbooks/sops/sop-test-writing.md` read in full before modifying tests; claim-finalize keeps the rolled-back transaction pattern, while the action-only add-person path uses the standard safe-action harness and cleanup.

#### 4. FAILED_STEPS check

- Prior failures in this area: FS-0008 (read exact schema/API contracts), FS-0027 (Bun test isolation), and LR 0008's no-partial-migration lesson.
- Manual Boundary Registry entries: none.
- Mitigation: the service requires an explicit DB/transaction client and has no default connection; every caller invokes it inside the same transaction as the RankAward write. Focused test files run separately to avoid mock-module leakage.

## Task log

| ID                   | Status    | Summary                                                                                                                                          |
| -------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| SESSION_0519_TASK_01 | completed | Extracted one transaction-required RankAward → RankEntry compatibility service and routed every belt-router call through it.                     |
| SESSION_0519_TASK_02 | completed | Claim finalization synchronizes both newly created and existing/upgraded awards, with direct RankEntry assertions.                               |
| SESSION_0519_TASK_03 | completed | Add-person and lineage promotion-date writers synchronize matching RankEntry rows in their existing transactions, with focused regression proof. |
| SESSION_0519_TASK_04 | completed | Doug found no P1/P2 code issue or writer bypass; all focused and production-build gates passed.                                                   |

## What landed

- Extracted `syncRankEntryFromAward(dbClient, rankAwardId)` into a reusable belt compatibility service. Its required client parameter prevents accidental escape from the caller's transaction.
- Replaced the belt router's private helper and duplicated inline upsert with the shared service.
- Routed claim-finalization create and upgrade-in-place branches, admin add-person creation, and lineage node promotion-date edits through the service without moving their auth, audit, ownership, or idempotency decisions.
- Added direct RankEntry regression assertions for every WL-P2-42 path.

## Decisions resolved

- The explicit SESSION_0518 handoff and operator goal override the board's unrelated higher-ranked cards for this session.
- WL-P2-42 is closed: every live RankAward rank/status writer now uses the shared compatibility boundary.
- The helper requires an explicit compatible client and has no default database escape. TypeScript structural typing cannot nominally distinguish root `db` from `tx`; current callers are all transaction-scoped, so this is accepted as a non-blocking convention rather than a new follow-up.

## Files touched

| File                                                            | Change                                                                                 |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `docs/sprints/SESSION_0519.md`                                  | Opened the session and recorded the writer-consolidation plan.                         |
| `docs/knowledge/wiki/wiring-ledger.md`                          | Marked WL-P2-42 resolved with implementation and verification evidence.                |
| `docs/knowledge/wiki/index.md`                                  | Indexed the closed session and refreshed agent attribution.                            |
| `apps/web/server/belt/rank-entry-compatibility.ts`              | Added the reusable transaction-required RankAward → RankEntry synchronization service. |
| `apps/web/server/belt/router.ts`                                | Replaced the private/duplicated compatibility writes with the shared service.          |
| `apps/web/server/admin/lineage/claim-finalize.ts`               | Synchronized RankEntry after both existing-award approval and new-award minting.       |
| `apps/web/server/admin/users/actions.ts`                        | Synchronized the add-person award in the existing transaction.                         |
| `apps/web/server/web/lineage/node-profile-actions.ts`           | Synchronized the shown award's entry after a promotion-date edit.                      |
| `apps/web/server/admin/lineage/claim-finalize.test.ts`          | Asserted VERIFIED RankEntry state for create and upgrade-in-place approval paths.      |
| `apps/web/server/admin/lineage/finalize-rank-promotion.test.ts` | Asserted the same RankEntry contract through direct rank-promotion finalization.       |
| `apps/web/server/admin/users/create-person.safe-action.test.ts` | Added focused add-person action coverage for the UNVERIFIED award/entry pair.          |
| `apps/web/server/web/lineage/node-profile-actions.test.ts`      | Asserted RankEntry synchronization on the authorized promotion-date path.              |

## Verification

| Command / smoke                                                 | Result                                                                                                                                                      |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `graphify stats` and bounded RankEntry writer query             | PASS — navigation completed.                                                                                                                                |
| FS-0024 cwd/origin/branch/status guard                          | PASS — canonical clean `main` worktree at `cd26c449`.                                                                                                       |
| `bun test server/admin/lineage/claim-finalize.test.ts`          | PASS — 7 tests / 19 assertions, including new and existing award RankEntry proof.                                                                           |
| `bun test server/admin/lineage/finalize-rank-promotion.test.ts` | PASS — 8 tests / 27 assertions, including direct new/existing promotion-finalize RankEntry proof.                                                           |
| `bun test server/admin/users/create-person.safe-action.test.ts` | PASS — 1 test / 4 assertions after correcting the test fixture's initial invalid nullable filter.                                                           |
| `bun test server/web/lineage/node-profile-actions.test.ts`      | PASS — 6 tests / 32 assertions, including promotion-date RankEntry proof.                                                                                   |
| `bun test server/belt/router.integration.test.ts`               | PASS — 30 tests / 98 assertions through the extracted service.                                                                                              |
| Global live RankAward writer sweep                              | PASS — no additional rank/status-fact bypass; promotion-event writes only associate `promotionEventId`, and deletes cascade the temporary RankEntry anchor. |
| `bun run typecheck`                                             | PASS — Next route types generated and TypeScript completed with no errors.                                                                                  |
| `bunx oxlint` on 9 touched TypeScript files                     | PASS — no diagnostics.                                                                                                                                      |
| `bunx oxfmt --check` on 9 touched TypeScript files              | PASS — all matched files formatted.                                                                                                                         |
| `git diff --check`                                              | PASS — no whitespace errors.                                                                                                                                |
| `bun run build`                                                 | PASS — migrations current; Next compiled, TypeScript completed, 201 static pages generated, and sitemap generation passed. One pre-existing storage-monitoring NFT trace warning. |
| `bash scripts/bow-out-gates.sh`                                 | PASS — wiki lint 0 errors / 48 pre-existing warnings; build pass; Graphify 16,812 nodes / 33,408 edges / 2,239 communities; fallow introduced findings 0. |
| `bun scripts/deferral-guard.ts docs/sprints/SESSION_0519.md`     | PASS — every deferral is backed by a real ledger row. |
| `bun scripts/board-mark-done.ts WL:WL-P2-42 --json`             | PASS — clean no-op because WL-P2-42 was not present as an open board card. |

## Open decisions / blockers

None. Push remains explicitly unauthorized and will wait for the operator's word.

## Next session

- **Goal:** Resume the board-top FI-001/G-001 lane and bring Brian Truelson's first-tester onboarding to the explicit-send gate.
- **Inputs to read:** `docs/product/black-belt-legacy/POST_LAUNCH_SOT.md`, `docs/knowledge/wiki/goals-ledger.md`, `docs/knowledge/wiki/manual-boundary-registry.md`, `docs/sprints/SESSION_0519.md`, and the current loop-board backlog.
- **First task:** Re-run the FI-001 pre-send verification against the live intended target, confirm remaining ledger/boundary prerequisites, and present the exact onboarding/thank-you email plus evidence for operator approval; do not send without explicit authorization.
- **Candidate after FI-001:** G-002 per-product database separation remains the next in-progress P1 board lane.

## Review log

### SESSION_0519_REVIEW_01 — RankAward writer compatibility close

- **Reviewed tasks:** SESSION_0519_TASK_01, SESSION_0519_TASK_02, SESSION_0519_TASK_03, SESSION_0519_TASK_04.
- **Dirstarter docs check:** live Prisma docs checked.
- **Sources:** <https://dirstarter.com/docs/database/prisma> and `docs/knowledge/wiki/dirstarter-docs-inventory.md`.
- **Verdict:** PASS. One O(1), transaction-composed compatibility service replaces the belt router's private duplicate and synchronizes all live fact/status writers without changing authorization, ownership, audit, idempotency, or claim semantics. No P1/P2 findings; the structural-client typing caveat is non-blocking because every call site is inside its existing transaction.
- **Score:** 9.7/10 after the completed production build; no hard cap.

## Hostile close review

**Giddy verdict:** PASS. The plan targeted the exact three WL-P2-42 bypasses, extended the established Prisma transaction pattern, removed duplication, and did not widen scope into schema, public reads, or a second editor. Branch/worktree hygiene is clean for the canonical `main` checkout; unrelated fallow cache worktrees were left untouched.

**Doug verdict:** PASS. Direct database assertions cover both claim create/upgrade branches, rank-promotion create/upgrade, add-person, node promotion-date, and belt-router behavior. Database parity remains 61 RankAwards / 61 RankEntries with zero missing entries and zero leaked tagged test users. Typecheck, touched-file lint/format, diff check, and production build pass.

**Dirstarter docs check:** live docs checked; source <https://dirstarter.com/docs/database/prisma>. Verdict: aligned — the custom RankEntry invariant composes Dirstarter's existing Prisma client/service pattern rather than replacing it.

**Kaizen:**

1. Safe and secure: existing caller authorization remains the gate, the service accepts no user input and executes inside caller transactions, and direct integration tests prove the paired writes. The global writer sweep and build close the claimed boundary; no manual runtime surface changed.
2. Failed steps prevented: zero protocol failures. Graphify-first discovery, exact schema/API inspection, isolated Bun test files, and the required build avoided the known FS-0008/FS-0027 failure classes. Next time, allow the production build's quiet TypeScript phase to finish while checking process activity rather than treating silence as a hang.
3. Scale confidence: 100 = 9.8, 1,000 = 9.7, 10,000 = 9.5. Each mutation adds one indexed anchor read plus one unique-key upsert inside an already-required transaction; there is no list scan, N+1 read path, or new public exposure. Aggregate 9.5 — proceed.

## ADR / ubiquitous-language check

No ADR or ubiquitous-language update needed. This session completed the already-ratified RankEntry compatibility boundary; it did not change the model, status vocabulary, or migration order.

## Reflections

- The migration boundary became safer by making the caller supply its database client and deleting the helper's default root connection; the remaining type-system limitation is visible rather than hidden.
- A quiet Next TypeScript phase was active, not hung. Process CPU evidence prevented an unnecessary second abort and produced a definitive build pass.
- The close runner currently counts only tracked diff files, so newly added files still need explicit manual review; targeted oxfmt/oxlint and the final staged-file review cover that gap this session.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0519, wiring ledger, and wiki index stamped for codex-session-0519; code files require no frontmatter. |
| Backlinks/index sweep | SESSION_0519 and wiring ledger now cross-link; wiki index includes SESSION_0519 and recent session continuity was spot-checked. |
| Wiki lint | `bun run wiki:lint` via close runner — 0 errors / 48 pre-existing warnings. |
| Kaizen reflection | Reflections and three hostile-review Kaizen answers present. |
| Hostile close review | SESSION_0519_REVIEW_01 — PASS, 9.7/10; no P1/P2 findings or hard cap. |
| Code-quality gate (Class-A) | No Class-A module: thin custom compatibility service over existing Prisma transactions; Doug/Giddy reviewed it in the diff. |
| Runtime verification (Doug) | 52 focused tests / 180 assertions, DB parity 61/61 with zero gaps/leaks, typecheck/lint/format/build all pass. |
| Review & Recommend | Next goal seeded from board-top FI-001/G-001; explicit-send authorization preserved. |
| Memory sweep | None needed; architecture stays in the RankEntry canon and resolved state is in WL-P2-42. |
| Next session unblock check | Unblocked for verification/pre-send preparation; actual email send remains blocked on explicit operator authorization. |
| Git hygiene | `main`, canonical worktree; local commit prepared at close, no push without explicit authorization. |
| Graphify update | 16,812 nodes / 33,408 edges / 2,239 communities before close commit. |
