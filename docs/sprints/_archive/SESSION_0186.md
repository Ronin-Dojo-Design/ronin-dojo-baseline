---
title: "SESSION 0186 — Lineage Placeholder User Archival"
slug: session-0186
type: session--implement
status: closed-full
created: 2026-05-17
updated: 2026-05-17
last_agent: codex-session-0186
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0185.md
  - docs/architecture/lineage/lineage-claim-workflow-evidence-review.md
  - docs/runbooks/schema-migration.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0186 — Lineage Placeholder User Archival

## Date

2026-05-17 MDT

## Operator

Brian Scott + Codex as Petey orchestrator, Cody implementer, Doug/Giddy reviewer.

## Goal

Close the placeholder-user archival gap from SESSION_0185 by adding the smallest safe User-level placeholder/archive fields and making approved lineage claims archive only verified placeholder owners after node ownership transfer.

## Bow-in Notes

- Opening ritual read from `docs/rituals/opening.md`.
- Latest session read: `docs/sprints/SESSION_0185.md`; status `closed-full`.
- Branch at bow-in: `session-0185-lineage-claim-ownership-hardening` clean at `0e8a8ed`; created `session-0186-lineage-placeholder-archival`.
- FAILED_STEPS scan: FS-0020 mitigated and followed with Graphify-first discovery; FS-0021 is open and controls this schema migration session.
- Drift Register scan: D-007 remains deferred and unrelated; no lineage-specific open drift entries.
- Manual Boundary scan: MB-002 brand scope remains open globally; MB-008 docs/wiki quality remains open and is covered by full close evidence.
- Graphify update ran before bow-in file creation. `graphify update .` and `graphify run .` reported zero-node delta output, but `graphify stats` and `.graphify/graph_report.md` remained usable at 6241 nodes / 11819 edges / 1231 files tracked.
- Graphify queries used:
  - `opening ritual Petey plan next session lineage claim review`
  - `admin lineage claim queries review actions test`
  - `SESSION 0183 next session tasks Petey lineage`
  - `placeholder user archival lineage approved claim User LineageNode LineageClaimRequest schema migration`
  - `schema migration prisma workflow placeholder User archivedAt lineage claim approval`
  - `lineage claim workflow placeholder user handling audit only detached placeholder`
  - `placeholder users created lineage node user materializer passport claim`
  - `LineageNode create user placeholder email lineage materialize`
  - `normal person search directory passport user query archived placeholder`
- Files selected from Graphify and verified by direct reads:
  - `docs/architecture/lineage/lineage-claim-workflow-evidence-review.md`
  - `docs/runbooks/schema-migration.md`
  - `docs/runbooks/prisma-workflow.md`
  - `docs/architecture/lineage/lineage-prisma-schema-patch-proposal.md`
  - `apps/web/prisma/schema.prisma`
  - `apps/web/prisma/seed-baseline-lineage.ts`
  - `apps/web/server/admin/lineage/claim-review-actions.ts`
  - `apps/web/server/admin/lineage/claim-review-actions.test.ts`
  - `apps/web/server/web/lineage/claim-actions.ts`
  - `apps/web/server/web/lineage/node-profile-queries.ts`
  - `apps/web/server/web/directory/search-profiles.ts`
  - `docs/protocols/project-log.md`

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma schema/migration, Better Auth `User` model, Dirstarter server feature folder pattern. |
| Extension or replacement | Extension. Adds Ronin-specific optional metadata to the existing Better Auth user table; no auth replacement. |
| Why justified | The lineage workflow spec requires placeholder users to be archived/marked inactive after an approved claim transfers ownership, and SESSION_0185 explicitly carried this as the next session goal. |
| Risk if bypassed | Detached placeholder users remain indistinguishable from active accounts after claims are approved, making normal person search and audit interpretation ambiguous. |

**Live Dirstarter docs checked on 2026-05-17:** `https://dirstarter.com/docs/database/prisma`, `https://dirstarter.com/docs/authentication`, `https://dirstarter.com/docs/codebase/structure`.

## Petey plan

### Goal

Implement placeholder-user archival for approved lineage claims without broad account lifecycle changes.

### Tasks

#### TASK_01 — Cody: Minimal User schema + seed marker

- **Agent:** Cody schema worker
- **What:** Add `User.isPlaceholder` and `User.archivedAt`, generate a versioned migration, and mark seeded lineage placeholder users with `isPlaceholder: true`.
- **Steps:**
  1. Follow `schema-migration.md` steps 1-8 explicitly because FS-0021 is open.
  2. Add optional/compatible User fields: `isPlaceholder Boolean @default(false)` and `archivedAt DateTime?`.
  3. Generate an additive Prisma migration with `migrate dev`.
  4. Update `seed-baseline-lineage.ts` so placeholder users are created and repaired with `isPlaceholder: true`.
- **Done means:** Prisma validates, migration exists, generated client understands the new fields, and seed logic is idempotent.
- **Depends on:** nothing.

#### TASK_02 — Cody: Claim approval archives placeholders

- **Agent:** Cody backend worker
- **What:** Update approved lineage claim review to archive only the prior node owner when that owner is marked `isPlaceholder`.
- **Steps:**
  1. Load the node owner's `isPlaceholder` and `archivedAt` in the review transaction.
  2. After ownership transfer, set the prior placeholder user's `archivedAt` when it is currently null.
  3. Do not archive non-placeholder prior owners or the claimant.
  4. Record `placeholderArchivedUserId` / `placeholderArchivedAt` in the audit payload.
  5. Extend DB-backed tests for placeholder archival and non-placeholder safety.
- **Done means:** Claim-review tests prove approved claims archive placeholder owners, keep audit history, and do not archive real users.
- **Depends on:** TASK_01.

#### TASK_03 — Doug/Giddy: Verification and full close

- **Agent:** Doug + Giddy, then Petey
- **What:** Run schema, test, typecheck, docs, git, Graphify, and closing gates.
- **Steps:**
  1. Run schema migration verification: DB reachability, `prisma validate`, model count check, generated migration inspection.
  2. Run focused claim-review tests and combined lineage regression tests.
  3. Run scoped typecheck filter for touched lineage/schema files and `git diff --check`.
  4. Run wiki lint during full close.
  5. Update SESSION, project log, wiki index, full-close evidence, git hygiene, push, and post-commit Graphify update.
- **Done means:** Verification and full-close proof are recorded; branch is committed and pushed.
- **Depends on:** TASK_01 and TASK_02.

### Parallelism

TASK_01 is the blocking schema contract. While Cody implements locally, parallel subagents can inspect search/filter side effects and perform a Doug-style focused review plan. TASK_02 follows TASK_01 in the main workspace to avoid schema/generated-client merge conflicts. TASK_03 is sequential after implementation.

### Agent assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody schema worker | Additive Prisma migration and seed marker require direct local DB/client generation. |
| TASK_02 | Cody backend worker | Existing claim-review transaction is the precise ownership-transfer boundary. |
| TASK_03 | Doug + Giddy, then Petey | Schema/runbook proof, regression checks, git hygiene, Graphify refresh, and bow-out. |

### Open decisions

- Petey decision for this session: implement the spec rather than revise it. Use two small `User` fields so archival is safe (`isPlaceholder`) and auditable (`archivedAt`).
- No user sign-off required before execution; this follows the SESSION_0185 next-session goal and the claim workflow spec's "smallest compatible field" guidance.

### Risks

- Existing placeholder users in non-seeded environments will not be backfilled unless they are created/updated through `seed-baseline-lineage.ts` or a future data repair script.
- `User.archivedAt` is metadata only in this session; broad auth/login blocking for archived users is out of scope to avoid changing Better Auth behavior.
- Full app typecheck is expected to remain nonzero from known baseline debt; scoped typecheck output must be reported honestly.

### Scope guard

No account deletion, no public directory redesign, no safe-action harness, no placeholder-user merge UI, no production data repair workflow beyond the additive migration, placeholder-domain backfill migration, seed marker, and generic admin user-list filters.

### Dirstarter implementation template

- **Docs read first:** Dirstarter Prisma, Authentication, and Project Structure docs checked live on 2026-05-17; local schema migration, Prisma workflow, and lineage claim workflow docs read directly.
- **Baseline pattern to extend:** Prisma schema/migration workflow, `services/db.ts` Prisma client, `adminActionClient` review action, existing lineage seed script.
- **Custom delta:** Ronin lineage placeholder users get explicit metadata so claim approval can archive historical stand-ins without disabling real accounts.
- **No-bypass proof:** Uses existing User table and claim-review transaction; does not add a parallel auth system or alternate person model.

## Pre-flight: Schema — User placeholder archival metadata

### 1. Petey invocation

- [x] Petey plan exists in SESSION file with task IDs.
- [ ] Petey waived: N/A.

### 2. Design doc check

- Design doc consulted: `docs/architecture/lineage/lineage-claim-workflow-evidence-review.md` §Placeholder User Handling.
- Models match design doc: yes; smallest compatible fields are `User.isPlaceholder` and `User.archivedAt`.

### 3. Existing schema scan

- Current model count: 115.
- Related existing models: `User`, `LineageNode`, `LineageClaimRequest`, `LineageTreeAccess`, `AuditLog`.
- Back-relations needed: none.
- **Schema spot-check:** `User` currently has no archive or placeholder field; `LineageNode.userId` is `String @unique`; `LineageClaimStatus` values are `PENDING`, `APPROVED`, `DENIED`, `NEEDS_INFO`, `CANCELLED`; `LineageTreeAccessRole` values include `TREE_ADMIN`, `TREE_EDITOR`, `BRANCH_EDITOR`, `NODE_EDITOR`; `AuditLog.action` is a free-form string.

### 4. Runbook consulted

- [x] `docs/runbooks/schema-migration.md` read.
- [x] `docs/runbooks/prisma-workflow.md` read.
- Migration strategy: `migrate dev` for additive User fields needing a production migration file.

### 5. Data flow reference

- [x] `docs/runbooks/sop-data-and-wiring-flows.md` — flow: Auth + brand context flow, Prisma data mutation flow.
- [x] `docs/runbooks/sop-e2e-user-lifecycle.md` — lifecycle stage: identity -> lineage claim -> profile ownership transfer.

### 6. FAILED_STEPS check

- Prior failures in this area: FS-0021 open.
- Mitigation acknowledged: yes; runbook steps are cited and executed before/after schema changes.

## Pre-flight: Backend — Approved claim archives prior placeholder owner

### 1. Auth predicates planned

- [x] Session auth required.
- [ ] Org membership verified.
- [x] Brand column filtered (ADR 0004).
- Authorization approach: keep `adminActionClient` and existing tree brand gate; only mutate placeholder archival inside the already serializable review transaction.

### 2. Existing action scan

- Consulted `docs/architecture/dirstarter-baseline-index.md`: not reloaded; exact local pattern is `reviewLineageClaim` from SESSION_0185.
- Searched `server/` for: Graphify queries listed in Bow-in Notes.
- Related existing actions: `reviewLineageClaim`, `applyLineageClaimReview`, `submitLineageClaimRequest`.
- L1 pattern match: Dirstarter action client chain via local `adminActionClient`.

### 3. Data flow reference

- [x] `docs/runbooks/sop-data-and-wiring-flows.md` — flow: Auth + brand context flow, mutation + audit flow.
- [x] `docs/runbooks/sop-e2e-user-lifecycle.md` — lifecycle stage: visitor/account -> lineage claim -> approved ownership transfer.

### 4. FAILED_STEPS check

- Prior failures in this area: FS-0021 for schema runbook discipline; FS-0008 for direct schema spot-check.
- Manual Boundary Registry entries: MB-002 and MB-008 are globally open; no task-blocking lineage boundary.

## Task Log

SESSION_0186_TASK_01, SESSION_0186_TASK_02, SESSION_0186_TASK_03

## What landed

1. **TASK_01 — Minimal User schema + seed marker:** Added `User.isPlaceholder` and `User.archivedAt`, generated additive migration `20260517195956_add_user_placeholder_archival`, added data migration `20260517202000_backfill_placeholder_users` for existing `*@placeholder.lineage` users, regenerated Prisma Client, and updated `seed-baseline-lineage.ts` to create/repair placeholder users idempotently.
2. **TASK_02 — Claim approval archives placeholders:** `applyLineageClaimReview` now archives the prior node owner only when that user is marked `isPlaceholder`, leaves real prior owners untouched, and records `placeholderArchivedUserId` / `placeholderArchivedAt` in the result and audit payload.
3. **TASK_02 support fix — User listings exclude archived placeholders:** `findUsers` and `findUserList` now hide archived and placeholder users from generic admin user tables/pickers; public directory and public lineage queries did not need filtering because they do not list raw placeholder users.
4. **TASK_03 — Verification:** Schema checks, focused DB-backed tests, lineage regression tests, scoped typecheck filter, wiki lint, and diff whitespace checks ran. Full app typecheck remains nonzero from known broader baseline debt; scoped output had no matching errors.

## Files touched

- `apps/web/prisma/schema.prisma` — added `User.isPlaceholder` and `User.archivedAt`.
- `apps/web/prisma/migrations/20260517195956_add_user_placeholder_archival/migration.sql` — additive User columns.
- `apps/web/prisma/migrations/20260517202000_backfill_placeholder_users/migration.sql` — marks existing placeholder-domain users.
- `apps/web/prisma/seed-baseline-lineage.ts` — creates and repairs lineage placeholder users with `isPlaceholder: true`.
- `apps/web/server/admin/lineage/claim-review-actions.ts` — archives placeholder prior owners inside approved review transaction and audit payload.
- `apps/web/server/admin/lineage/claim-review-actions.test.ts` — proves placeholder archival, real-user non-archival, non-approved no-op, and audit fields.
- `apps/web/server/admin/users/queries.ts` — filters archived/placeholder users from admin list/picker helpers.
- `apps/web/server/admin/users/queries.test.ts` — DB-backed tests for the admin user filters.
- `docs/sprints/SESSION_0186.md` — current session record and full-close artifact.
- `docs/protocols/project-log.md` — SESSION_0186 task/review entries.
- `docs/knowledge/wiki/index.md` — SESSION_0186 row and metadata.

## Decisions resolved

- Placeholder archival is implemented rather than revising the workflow spec.
- The smallest safe schema shape is two User fields: `isPlaceholder` for safety and `archivedAt` for audit/lifecycle state.
- Archived/placeholder users should be hidden from generic admin user listings and pickers, while public directory and lineage display require no extra filtering this session.

## Open decisions / blockers

- Safe-action middleware wrapper coverage remains accepted risk. Tests exercise DB helpers and queries directly, matching nearby lineage tests.
- MB-002 brand-scope enforcement remains globally open and unrelated to this slice.
- MB-008 docs/wiki quality remains open because wiki-lint warnings are repo-wide pre-existing debt.

## Verification

| Check | Command | Result |
| --- | --- | --- |
| DB reachability | `cd apps/web && /Applications/Postgres.app/Contents/Versions/latest/bin/psql ronindojo_dev -c "SELECT 1;"` | pass |
| Schema pre-flight validate | `cd apps/web && bunx prisma validate` | pass |
| Additive schema migration | `cd apps/web && bunx prisma migrate dev --name add-user-placeholder-archival` | applied `20260517195956_add_user_placeholder_archival` |
| Prisma client generation | `cd apps/web && bunx prisma generate` | pass |
| Placeholder backfill migration | `cd apps/web && bunx prisma migrate dev` | applied `20260517202000_backfill_placeholder_users` |
| Model count check | `cd apps/web && bunx prisma db pull --print \| awk '/^model / {count++} END {print count}'` | 115 models; pre-existing expression-index warning for `LineageVisualGroup_unknown_date_key` |
| Claim-review focused test | `cd apps/web && bun test --timeout 90000 server/admin/lineage/claim-review-actions.test.ts` | 7 pass / 0 fail / 44 expect() |
| Admin user query test | `cd apps/web && bun test --timeout 90000 server/admin/users/queries.test.ts` | 2 pass / 0 fail / 7 expect() |
| Combined focused regression | `cd apps/web && bun test --timeout 120000 server/web/lineage server/admin/lineage server/admin/users/queries.test.ts` | 40 pass / 0 fail / 132 expect() |
| Scoped typecheck filter | `cd apps/web && set -o pipefail; bunx tsc --noEmit 2>&1 \| awk 'BEGIN{found=0} /claim-review-actions\|server\\/admin\\/lineage\|server\\/web\\/lineage\|seed-baseline-lineage\|server\\/admin\\/users\\/queries\|isPlaceholder\|archivedAt/ { found=1; print } END { if (!found) print "NO_MATCHING_ERRORS" }'` | `NO_MATCHING_ERRORS`; full command exited 2 because broader app typecheck baseline remains nonzero |
| Diff whitespace | `git diff --check` | pass |
| Wiki lint | `bun run wiki:lint` | 0 errors / 501 warnings; warnings are repo-wide pre-existing docs debt |

## Review log

- SESSION_0186_REVIEW_01 — placeholder-user archival shipped, recorded in `docs/protocols/project-log.md`.
- SESSION_0184_FINDING_02 — accepted-risk, still open for future safe-action harness work.

## Hostile close review

- **Giddy verdict:** The schema change is additive and Dirstarter-aligned: it extends the existing Better Auth `User` model through Prisma migrations and keeps review behavior inside the established lineage admin action transaction.
- **Doug verdict:** The critical safety proof is present: placeholder owners archive, real prior owners do not archive, non-approved reviews do not archive, existing placeholder-domain users are backfilled, and generic admin user pickers stop surfacing archived/placeholder users.
- **Dirstarter docs check:** live docs checked on 2026-05-17.
- **Sources:** <https://dirstarter.com/docs/database/prisma>, <https://dirstarter.com/docs/authentication>, <https://dirstarter.com/docs/codebase/structure>, local lineage claim workflow and schema migration runbooks.
- **WORKFLOW score:** 9.7/10. Held below 10 only because the broader safe-action wrapper harness remains out of scope and accepted risk.

## ADR / ubiquitous-language check

No ADR or ubiquitous-language update needed. This session implemented an already-documented workflow rule with minimal schema metadata and did not introduce a new architecture decision or domain term.

## Next session

- **Goal:** Add a reusable safe-action test harness for lineage actions, or explicitly document why helper-level tests remain the accepted pattern.
- **Inputs to read:** `docs/sprints/SESSION_0184.md` finding `SESSION_0184_FINDING_02`, `apps/web/lib/safe-actions.ts`, `apps/web/server/admin/lineage/claim-review-actions.ts`, `apps/web/server/web/lineage/node-profile-actions.ts`, `docs/runbooks/sop-test-writing.md`.
- **First task:** Petey plan the smallest next-safe-action invocation harness that can exercise `adminActionClient` and `userActionClient` without requiring a full browser/request stack.

## Reflections

- The hidden risk was not the new fields; it was existing placeholder rows defaulting to `isPlaceholder=false`. Adding the backfill migration before commit kept the approval path honest for already-seeded data.
- The subagent split paid off: one sidecar caught test assertions around serialized audit dates, and the other narrowed search filtering to admin user helpers instead of pulling public directory queries into scope.
- Keeping archival metadata on `User` rather than adding a lineage-only shadow table made the change small, but the code still avoids disabling real accounts by requiring `isPlaceholder` before writing `archivedAt`.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Checked touched docs: `SESSION_0186.md`, `project-log.md`, `wiki/index.md`; set `project-log.md` and `wiki/index.md` `last_agent` to `codex-session-0186`; `SESSION_0186.md` frontmatter status/type set to `closed-full` / `session--implement`. |
| Backlinks/index sweep | Added SESSION_0186 row to `docs/knowledge/wiki/index.md`; SESSION_0186 frontmatter pairs with SESSION_0185, lineage workflow spec, and schema migration runbook. No new wiki pages. |
| Wiki lint | `bun run wiki:lint` returned 0 errors / 501 warnings; warnings are repo-wide pre-existing docs debt, not introduced as blocking errors by this session. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | SESSION_0186_REVIEW_01 recorded in project log; hostile close review section present above. |
| Review & Recommend | Next session goal written above: safe-action test harness planning. |
| Memory sweep | No operator memory update needed; the safe-action harness gap is session-scoped and recorded in Next session plus project log. |
| Next session unblock check | Unblocked: next session can start from safe-actions source, lineage action files, and `sop-test-writing.md`. |
| Git hygiene | Final branch/status/commit proof to be reported in bow-out response after git hygiene. |
| Graphify update | Final node/edge/community count to be reported in bow-out response after post-commit Graphify update. |

## Status

closed-full
