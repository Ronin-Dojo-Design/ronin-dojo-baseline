---
title: "SESSION 0185 — Lineage Claim Ownership Hardening"
slug: session-0185
type: session--implement
status: closed-full
created: 2026-05-17
updated: 2026-05-17
last_agent: codex-session-0185
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0184.md
  - docs/architecture/lineage/lineage-claim-workflow-evidence-review.md
  - docs/runbooks/lineage-listing-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0185 — Lineage Claim Ownership Hardening

## Date

2026-05-17 MDT

## Operator

Brian Scott + Codex as Petey orchestrator, Cody implementer, Doug/Giddy reviewer.

## Goal

Harden lineage claim approval into durable node ownership/access rights so an APPROVED claim no longer acts as the long-term editor permission by itself.

## Bow-in Notes

- Opening ritual read from `docs/rituals/opening.md`.
- Latest session read: `docs/sprints/SESSION_0184.md`; status `closed-full`.
- Branch at bow-in: `main` clean at `dbd0630` -> created `session-0185-lineage-claim-ownership-hardening`.
- FAILED_STEPS scan: prior mitigation patterns acknowledged: FS-0001/FS-0008 (source/API inspection before implementation), FS-0004/FS-0005 (full-close proof), FS-0021 remains a carried schema/migration caution but no schema change is planned.
- Drift Register scan: no lineage-specific open drift; D-007 remains deferred and unrelated.
- Graphify update ran at bow-in. Graph stats after update: 6239 nodes, 11813 edges, 712 communities.
- Graphify queries used:
  - `petey-plan tasks slated next session durable lineage ownership access rights claim approval LineageTreeAccess`
  - `lineage claim approval ownership node editor LineageClaimRequest LineageTreeAccess LineageNode userId`
  - `lineage claim workflow evidence review approval rule editor flow`
  - `TASK_PLAN_LOG SESSION_0185 project-log TASK_REVIEW_LOG lineage ownership`
- Files selected from Graphify and verified by direct reads:
  - `docs/architecture/lineage/lineage-claim-workflow-evidence-review.md`
  - `docs/runbooks/lineage-listing-runbook.md`
  - `docs/architecture/lineage/lineage-public-viewer-editor-routes.md`
  - `apps/web/server/admin/lineage/claim-review-actions.ts`
  - `apps/web/server/admin/lineage/claim-review-actions.test.ts`
  - `apps/web/server/web/lineage/node-profile-actions.ts`
  - `apps/web/server/web/lineage/node-profile-queries.ts`
  - `apps/web/server/web/lineage/node-profile-actions.test.ts`
  - `apps/web/prisma/schema.prisma`
  - `docs/protocols/project-log.md`

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma data writes/transactions, Better Auth role-gated action chain, server feature folder organization. |
| Extension or replacement | Extension. Uses existing Prisma models and local safe-action clients; no replacement of Dirstarter auth/database patterns. |
| Why justified | SESSION_0184_FINDING_01 identified APPROVED claim status as an interim permission model that can authorize multiple node editors. |
| Risk if bypassed | Multiple approved claims for one node could continue granting edit access; claim approval would remain a status flag instead of a durable ownership/access transition. |

**Live Dirstarter docs checked:** `https://dirstarter.com/docs/database/prisma`, `https://dirstarter.com/docs/authentication`, `https://dirstarter.com/docs/codebase/structure`.

## Petey plan

### Goal

Turn APPROVED lineage-node claims into durable ownership/access state and update the editor to authorize from `LineageTreeAccess` instead of claim status.

### Tasks

#### TASK_01 — Cody: Durable claim approval transition

- **Agent:** Cody
- **What:** Update admin claim approval so APPROVED `LINEAGE_NODE` claims transfer node ownership and grant durable node-editor access.
- **Steps:**
  1. Load the claim with tree brand, node user, claimant user, tree member, and same-node claim conflict context.
  2. Keep PENDING/NEEDS_INFO as the only reviewable statuses.
  3. On APPROVED, block if a different claimant already has an APPROVED claim for the same tree/node.
  4. On APPROVED, block if the claimant already owns a different `LineageNode`.
  5. Transfer `LineageNode.userId` to the claimant and create or preserve an active `LineageTreeAccess` role `NODE_EDITOR` scoped to the tree/node/member.
  6. Write a compact `AuditLog` for all review outcomes with before/after status and claim context.
- **Done means:** `reviewLineageClaim` compiles and DB-backed tests prove transfer, grant creation, duplicate-approval guard, and duplicate-node guard.
- **Depends on:** nothing.

#### TASK_02 — Cody: Editor authorization uses access grant

- **Agent:** Cody
- **What:** Update the claimant editor query/action to require active `LineageTreeAccess` instead of APPROVED claim status.
- **Steps:**
  1. Replace APPROVED-claim checks in `getEditableLineageNodeProfile` with an active access-grant check.
  2. Replace APPROVED-claim checks in `applyLineageNodeProfileUpdate` with the same durable access rule.
  3. Permit `NODE_EDITOR` only when scoped to the requested node/member; permit `TREE_EDITOR` and `TREE_ADMIN` for the tree.
  4. Update tests so an APPROVED claim without access no longer authorizes editing, while an active `NODE_EDITOR` grant does.
- **Done means:** Node-profile tests prove granted access works and claim-status-only access fails.
- **Depends on:** TASK_01 contract, but can implement in parallel after the grant shape is fixed.

#### TASK_03 — Doug/Giddy: Verification and full close

- **Agent:** Doug + Giddy, then Petey for bow-out
- **What:** Verify the focused lineage path and run the requested full-close ritual.
- **Steps:**
  1. Run claim-review tests.
  2. Run node-profile tests.
  3. Run combined lineage regression suite.
  4. Run a scoped typecheck filter for changed lineage files.
  5. Run wiki lint during close.
  6. Update SESSION, project log, wiki index, full-close evidence, git hygiene, push, and post-commit Graphify update.
- **Done means:** Verification and full-close proof are recorded; branch is committed and pushed.
- **Depends on:** TASK_01, TASK_02.

### Parallelism

TASK_01 and TASK_02 are suitable for parallel Cody workers because their production file sets are disjoint after the grant contract is set. TASK_03 is sequential after implementation.

### Agent assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody backend worker | Admin action/transaction/audit logic with clear DB invariants. |
| TASK_02 | Cody editor-auth worker | Query/action authorization change with focused tests. |
| TASK_03 | Doug + Giddy, then Petey | Test gates, hostile review, git hygiene, Graphify refresh, and bow-out. |

### Open decisions

- Petey decision for this session: APPROVED `LINEAGE_NODE` claims do both durable state changes: transfer `LineageNode.userId` to the claimant and create a `LineageTreeAccess` `NODE_EDITOR` grant. This follows the claim workflow spec and keeps editor authorization explicit.
- No user sign-off required before execution; the decision is the staged SESSION_0184 first task and matches the lineage claim workflow doc.

### Risks

- There is no `User.archivedAt` field for placeholder users, so this session can detach the placeholder from the node but cannot archive the placeholder user without a schema change.
- Existing lineage action tests still exercise DB helpers more than the full next-safe-action middleware wrapper; this session can improve DB logic proof but not solve the harness gap.
- Full app typecheck remains nonzero from known baseline debt; verification must use scoped output honestly.

### Scope guard

No schema migration, no tree-owner dashboard, no notification emails, no claim cancellation, no paid lineage tiers, no placeholder-user archive schema, no full safe-action harness.

### Dirstarter implementation template

- **Docs read first:** Dirstarter Prisma, Authentication, and Project Structure docs checked live on 2026-05-17; local lineage claim workflow, listing runbook, and editor route spec read directly.
- **Baseline pattern to extend:** `adminActionClient`, `userActionClient`, Prisma client in `services/db.ts`, server feature folders under `server/admin/lineage` and `server/web/lineage`.
- **Custom delta:** Ronin lineage approval writes durable node ownership and `LineageTreeAccess` grants on top of Dirstarter's auth/database patterns.
- **No-bypass proof:** Uses existing Prisma schema and safe-action clients; does not add parallel auth, custom database clients, or duplicate admin review queues.

## Pre-flight: Backend — Durable lineage claim ownership/access

### 1. Auth predicates planned

- [x] Session auth required
- [ ] Org membership verified
- [x] Brand column filtered (ADR 0004)
- Authorization approach: admin claim review continues through `adminActionClient`; editor profile updates continue through `userActionClient` plus request brand plus durable `LineageTreeAccess`.

### 2. Existing action scan

- Consulted `docs/architecture/dirstarter-baseline-index.md`: not reloaded; local safe-action patterns from SESSION_0183/0184 are exact target files.
- Searched via Graphify for: `lineage claim approval ownership node editor LineageClaimRequest LineageTreeAccess LineageNode userId`
- Related existing actions: `reviewLineageClaim`, `updateLineageNodeProfile`, `submitLineageClaimRequest`.
- L1 pattern match: Dirstarter auth/action chain via local `adminActionClient` and `userActionClient`.

### 3. Data flow reference

- [x] `docs/runbooks/sop-data-and-wiring-flows.md` — flow: Auth + brand context flow.
- [x] `docs/runbooks/sop-e2e-user-lifecycle.md` — lifecycle stage: visitor/account -> identity -> lineage claim -> profile editing.

### 4. FAILED_STEPS check

- Prior failures in this area: FS-0001/FS-0008 source inspection and primitive/schema spot-check rigor; FS-0004/FS-0005 full-close proof rigor.
- Manual Boundary Registry entries: none found for SESSION_0184_FINDING_01 or SESSION_0185.

### Schema spot-check

- `LineageClaimStatus`: `PENDING`, `APPROVED`, `DENIED`, `NEEDS_INFO`, `CANCELLED`.
- `LineageTreeAccessRole`: `TREE_ADMIN`, `TREE_EDITOR`, `BRANCH_EDITOR`, `NODE_EDITOR`.
- `LineageNode.userId`: unique relation to `User`, so transferring a node to a claimant must block claimants that already own a different node.
- `LineageTreeAccess`: has `treeId`, `userId`, `role`, optional `grantedById`, optional `rootMemberId`, optional `memberId`, optional `nodeId`, and `revokedAt`.

## Task Log

SESSION_0185_TASK_01, SESSION_0185_TASK_02, SESSION_0185_TASK_03

## What landed

1. **TASK_01 — Durable claim approval transition:** `reviewLineageClaim` now delegates to `applyLineageClaimReview`, which runs a serializable transaction. APPROVED reviews transfer `LineageNode.userId` to the claimant, create or repair an active `LineageTreeAccess` `NODE_EDITOR` grant scoped to the tree/node/member, block duplicate approved claimants, block claimants that already own another node, and write `AuditLog`.
2. **TASK_02 — Editor authorization uses durable access:** `getEditableLineageNodeProfile` and `applyLineageNodeProfileUpdate` now require active `LineageTreeAccess` instead of APPROVED claim status. `TREE_ADMIN`/`TREE_EDITOR` can edit tree nodes; `NODE_EDITOR` must match the requested node or member; revoked grants are ignored.
3. **TASK_02 support fix — Admin claim UI type cleanup:** `claim-queries.ts` now reads display names through `LineageNode.user.passport.displayName`, matching the schema. Claim page badge/button variants now match the local Dirstarter primitive APIs.
4. **TASK_03 — Verification:** Focused and combined lineage tests pass. Scoped typecheck filter reports no matching errors for touched lineage files; full app typecheck remains nonzero from known baseline debt.

## Files touched

- `apps/web/server/admin/lineage/claim-review-actions.ts` — durable review helper, serializable transaction, ownership transfer, access grant, audit log.
- `apps/web/server/admin/lineage/claim-review-actions.test.ts` — DB-backed tests for transfer/grant/audit, duplicate-approval guard, duplicate-node guard, terminal guard, brand guard.
- `apps/web/server/admin/lineage/claim-queries.ts` — fixed node display-name selection through `user.passport`.
- `apps/web/app/admin/lineage/claims/page.tsx` — display-name fallback and valid badge variant.
- `apps/web/app/admin/lineage/claims/[id]/page.tsx` — display-name fallback.
- `apps/web/app/admin/lineage/claims/[id]/_components/claim-status-actions.tsx` — valid Dirstarter button variants.
- `apps/web/server/web/lineage/node-profile-actions.ts` — editor update requires active `LineageTreeAccess`.
- `apps/web/server/web/lineage/node-profile-queries.ts` — shared active access-grant lookup.
- `apps/web/server/web/lineage/node-profile-actions.test.ts` — DB-backed tests for grant-required editing and revoked-grant denial.
- `docs/sprints/SESSION_0185.md` — current session record and full-close artifact.
- `docs/protocols/project-log.md` — SESSION_0185 task/review entries and SESSION_0184_FINDING_01 status update.
- `docs/knowledge/wiki/index.md` — SESSION_0185 row and metadata.

## Decisions resolved

- APPROVED lineage-node claims now do both durable state changes: transfer `LineageNode.userId` to the claimant and create/preserve a `LineageTreeAccess` `NODE_EDITOR` grant.
- Node-profile editing is authorized by active `LineageTreeAccess`, not by APPROVED claim status.
- Placeholder user archival is explicitly out of scope because `User` has no archive field and this session avoided schema changes.

## Open decisions / blockers

- Placeholder user archival remains unresolved. The lineage claim workflow spec says placeholders should be archived or marked inactive after transfer, but the current `User` schema has no `archivedAt`/placeholder status field.
- Safe-action middleware wrapper coverage remains accepted risk. Tests exercise the exported DB helpers plus queries, matching nearby lineage tests, but not the full `next-safe-action` request-state wrapper.
- Carried forward: SESSION_0178_FINDING_01 (app-wide typecheck baseline), SESSION_0178_FINDING_02 (global seed idempotency), SESSION_0182_FINDING_01 (zodResolver overload), SESSION_0180_FINDING_01 (sequential viewer DB reads), SESSION_0180_FINDING_02 (`LineageTreeAccess` not yet used for viewer visibility scope).

## Verification

| Check | Command | Result |
| --- | --- | --- |
| Claim-review focused test | `cd apps/web && bun test --timeout 90000 server/admin/lineage/claim-review-actions.test.ts` | 6 pass / 0 fail / 26 expect() |
| Node-profile focused test | `cd apps/web && bun test --timeout 90000 server/web/lineage/node-profile-actions.test.ts` | 5 pass / 0 fail / 21 expect() |
| Combined lineage regression suite | `cd apps/web && bun test --timeout 120000 server/web/lineage server/admin/lineage` | 37 pass / 0 fail / 107 expect() |
| Scoped typecheck filter | `cd apps/web && set -o pipefail; bunx tsc --noEmit 2>&1 \| awk 'BEGIN{found=0} /claim-review-actions\|claim-queries\|claim-status-actions\|admin\\/lineage\\/claims\|node-profile-actions\|node-profile-queries\|server\\/admin\\/lineage\|server\\/web\\/lineage\\/node-profile/ { found=1; print } END { if (!found) print "NO_MATCHING_ERRORS" }'` | `NO_MATCHING_ERRORS`; full command exited 2 because broader app typecheck baseline remains nonzero |
| Diff whitespace | `git diff --check` | pass |

## Review log

- SESSION_0185_REVIEW_01 — durable lineage claim ownership/access shipped, recorded in `docs/protocols/project-log.md`.
- SESSION_0184_FINDING_01 — resolved by SESSION_0185_REVIEW_01.
- SESSION_0184_FINDING_02 — accepted-risk, still open for future safe-action harness work.

## Hostile close review

- **Giddy verdict:** The data contract now matches the lineage claim workflow spec more closely: approval is a state transition into ownership/access, not just a reviewed status flag. The work stays within the existing schema and safe-action clients.
- **Doug verdict:** The critical failure mode from SESSION_0184 is covered: an APPROVED claim without a grant no longer authorizes editing, duplicate approved claimants are blocked, and revoked grants are ignored. Helper-level safe-action coverage remains the same known limitation as prior lineage action tests.
- **Dirstarter docs check:** live docs checked on 2026-05-17.
- **Sources:** <https://dirstarter.com/docs/database/prisma>, <https://dirstarter.com/docs/authentication>, <https://dirstarter.com/docs/codebase/structure>, local lineage claim workflow and listing runbook.
- **WORKFLOW score:** 9.6/10. Strong data integrity and lifecycle proof for this slice; held below 10 because placeholder archival remains a future schema decision and full safe-action wrapper coverage is still missing.

## ADR / ubiquitous-language check

No ADR or ubiquitous-language update needed. This session did not introduce a new domain term or schema decision; it implemented the already-documented LineageClaimRequest -> LineageTreeAccess ownership/access flow.

## Next session

- **Goal:** Decide and implement placeholder-user archival for approved lineage claims, or explicitly revise the claim workflow spec if placeholder archival should remain deferred.
- **Inputs to read:** `docs/architecture/lineage/lineage-claim-workflow-evidence-review.md` §Placeholder User Handling, `apps/web/prisma/schema.prisma` (`User`, `LineageNode`, `LineageClaimRequest`), `apps/web/server/admin/lineage/claim-review-actions.ts`, `docs/runbooks/schema-migration.md`.
- **First task:** Petey plan whether to add a lightweight placeholder/archive field to `User`, add a lineage-specific placeholder marker, or amend the workflow spec to treat detached placeholder users as audit-only without schema changes.

## Reflections

- The important shift was removing claim status from the authorization path. `LineageClaimRequest` now records the review decision; `LineageTreeAccess` controls editing.
- The tests got more useful once the admin action exposed a DB helper. The prior direct-update tests were green but did not prove the review behavior.
- The scoped typecheck caught SESSION_0183 admin-claim UI drift (`displayName` and primitive variants). Fixing it in this session was cheaper than recording another known claim-surface exception.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Touched docs checked: `SESSION_0185.md`, `project-log.md`, `wiki/index.md`; `wiki/index.md` metadata updated to `codex-session-0185`. |
| Backlinks/index sweep | Added SESSION_0185 row to `docs/knowledge/wiki/index.md`; SESSION_0185 frontmatter pairs with SESSION_0184 and lineage docs. No new wiki pages. |
| Wiki lint | `bun run wiki:lint` returned 0 errors / 501 warnings; warnings are repo-wide pre-existing lint debt, not introduced as blocking errors by this session. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | SESSION_0185_REVIEW_01 recorded in project log; hostile close review section present above. |
| Review & Recommend | Next session goal written above. |
| Memory sweep | No operator memory update needed; placeholder archival is session-scoped and captured in Next session. |
| Next session unblock check | Unblocked: next session can start from claim workflow spec, schema, and `claim-review-actions.ts`. |
| Git hygiene | Final branch/status/commit proof reported in bow-out response after git hygiene. |
| Graphify update | Final node/edge/community count reported in bow-out response after git hygiene. |

## Status

closed-full
