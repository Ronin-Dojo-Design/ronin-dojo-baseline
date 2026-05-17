---
title: "SESSION 0178 - Lineage Schema Migration + Backfill Proof"
slug: session-0178
type: session--implement
status: closed-full
created: 2026-05-17
updated: 2026-05-17
last_agent: codex-session-0178
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0177.md
  - docs/runbooks/graphify-repo-memory.md
  - docs/runbooks/schema-migration.md
  - docs/runbooks/prisma-workflow.md
  - docs/architecture/lineage/lineage-prisma-schema-patch-proposal.md
  - docs/architecture/lineage/lineage-rank-promotion-sync-rules.md
  - docs/architecture/lineage/lineage-v1-acceptance-test-plan.md
  - docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md
  - docs/architecture/ubiquitous-language.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0178 - Lineage Schema Migration + Backfill Proof

## Date

2026-05-17 MDT

## Operator

Brian Scott + Codex as Petey orchestrator, Cody implementer, Doug/Giddy reviewer.

## Goal

Apply the additive Lineage Tree v1 Prisma schema migration and prove the migration/backfill path before server read models or UI editor work begins.

## Bow-in Notes

- Opening ritual read from `docs/rituals/opening.md`.
- Target repo: `/Users/brianscott/dev/ronin-dojo-app`.
- Latest closed session: `docs/sprints/SESSION_0177.md` (`closed-full`).
- Branch at bow-in: `main`; switched to `session-0178-lineage-schema` before schema migration work.
- Worktree status at bow-in: clean.
- Worktree map: core-platform/schema lane belongs to `wt-core-platform`; current active checkout is `main` with no extra session worktree.
- FS-0021 remains relevant: schema migration discipline must follow `docs/runbooks/schema-migration.md` and `docs/runbooks/prisma-workflow.md`.

## Graphify Check

- Graph status: refreshed at bow-in; `6098` nodes, `11519` edges, `717` communities, `1209` files.
- Queries run:
  - `graphify query --graph . --depth 3 --budget 4000 "opening.md ritual closing.md ritual petey-plan.md graphify-repo-memory.md"`
  - `graphify query --graph . --depth 3 --budget 5000 "lineage schema migration RankAward LineageRelationship LineageTree LineageTreeMember Claim evidence permissions backfill schema-migration"`
  - `graphify query --graph . --depth 3 --budget 3000 "SESSION_0178 TASK_PLAN_LOG TASK_REVIEW_LOG project-log lineage schema migration"`
- Files selected from graph and verified directly:
  - `docs/runbooks/schema-migration.md`
  - `docs/runbooks/prisma-workflow.md`
  - `docs/protocols/project-log.md`
  - `docs/architecture/lineage/lineage-prisma-schema-patch-proposal.md`
  - `docs/architecture/lineage/lineage-rank-promotion-sync-rules.md`
  - `docs/architecture/lineage/lineage-v1-acceptance-test-plan.md`
  - `apps/web/prisma/schema.prisma`

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma/database schema and migration workflow |
| Extension or replacement | Extension. This adds Ronin lineage models/relations on top of Dirstarter's Prisma/Postgres baseline. |
| Why justified | SESSION_0177 locked the lineage v1 schema direction; schema must land before server read models, editor permissions, claim workflow, or React canvas port work. |
| Risk if bypassed | UI/editor work would encode fake or unstable data contracts, and production deploy would lack versioned migration proof. |

Live Dirstarter docs checked: `https://dirstarter.com/docs/database/prisma` on 2026-05-17. The docs confirm Prisma schema edits, versioned migrations, push, generate, and seed commands as the baseline database workflow.

## Petey plan

### Goal

Land the Lineage Tree v1 additive schema migration with verification-status backfill and enough proof that the next session can safely build server read models.

### Tasks

#### TASK_01 - Cody: Prisma schema patch

- **Agent:** Cody
- **What:** Apply the SESSION_0177 lineage schema proposal to `apps/web/prisma/schema.prisma`: new enums, `PROMOTED_BY`, nullable `RankAward.awardedAt`, verification statuses, tree/member/group/access/claim/evidence models, and required relation arrays.
- **Steps:**
  1. Patch `schema.prisma` from the exact proposal.
  2. Preserve existing `isVerified` fields for transitional compatibility.
  3. Keep relationship orientation: `fromNodeId` promoter, `toNodeId` promoted person.
  4. Validate Prisma schema before migration generation.
- **Done means:** Prisma schema validates and model count increases from `109` to the expected additive count.
- **Depends on:** nothing.

#### TASK_02 - Cody: Additive migration + backfill proof

- **Agent:** Cody
- **What:** Generate a versioned additive Prisma migration and make the SQL backfill `verificationStatus` from existing `isVerified` fields.
- **Steps:**
  1. Run `bunx prisma migrate dev --name add_lineage_tree_v1_schema` from `apps/web`.
  2. Inspect generated SQL.
  3. Add explicit SQL updates for `LineageNode.verificationStatus` and `LineageRelationship.verificationStatus` if Prisma does not generate data backfill.
  4. Generate Prisma Client and run seed/lineage-safe verification where available.
- **Done means:** Migration file exists, Prisma client generates, and backfill SQL/proof is recorded.
- **Depends on:** TASK_01.

#### TASK_03 - Doug + Giddy: Verification and handoff

- **Agent:** Doug + Giddy
- **What:** Verify migration safety, launch risk, and next-session readiness.
- **Steps:**
  1. Run schema validation and targeted type/test checks.
  2. Confirm existing public lineage viewer contracts are not intentionally changed.
  3. Record hostile close findings and next session recommendation.
- **Done means:** `SESSION_0178` and `project-log.md` contain review evidence, blockers, and a concrete next session.
- **Depends on:** TASK_02.

### Parallelism

TASK_01 and TASK_02 are sequential because they own the same Prisma files. Doug/Giddy can review docs and verification commands in parallel after the migration is generated.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Clear implementation against a signed-off schema proposal. |
| TASK_02 | Cody | Migration generation and SQL proof are same-file continuation. |
| TASK_03 | Doug + Giddy | QA/migration safety and architecture/git hygiene review. |

### Open decisions

- None before implementation. Promoter-change UX, ACL server actions, and claim reviewer flows are explicitly next-session work after schema lands.

### Risks

- Prisma enum migration plus nullable `RankAward.awardedAt` can surface generated-client type fallout.
- Existing lineage queries may assume only `INSTRUCTOR_STUDENT` relationships until server read models are updated.
- Backfill must not guess ambiguous promotion facts; only verification-status backfill is required in this migration.

### Scope guard

No server read models, dashboard editor routes, claim actions, React canvas port, D3 removal, or UI changes in this session. Adjacent issues go into `Open decisions / blockers`.

### Dirstarter implementation template

- **Docs read first:** `https://dirstarter.com/docs/database/prisma` checked 2026-05-17; `docs/runbooks/schema-migration.md`; `docs/runbooks/prisma-workflow.md`.
- **Baseline pattern to extend:** Prisma schema + `prisma/migrations/` + generated client workflow.
- **Custom delta:** Ronin lineage schema, verification-status backfill, and claim/evidence data contract.
- **No-bypass proof:** Uses Dirstarter's Prisma/Postgres migration path instead of ad hoc SQL-only schema changes.

## Pre-flight: Schema - Lineage Tree v1

### 1. Petey invocation

- [x] Petey plan exists in SESSION file with task IDs.
- [ ] Petey waived: not applicable.

### 2. Design doc check

- Design docs consulted: `lineage-prisma-schema-patch-proposal.md`, `lineage-rank-promotion-sync-rules.md`, `lineage-v1-acceptance-test-plan.md`.
- Models match design doc: intended; deviations must be listed in `Decisions resolved`.

### 3. Existing schema scan

- Current model count: `109`.
- Related existing models: `RankAward`, `LineageNode`, `LineageRelationship`, `User`, `Organization`, `Discipline`, `Style`, `Media`, `AuditLog`, `Membership`, `Role`.
- Back-relations needed: `User` lineage access/grant/claim/review arrays; `Organization` lineage trees; `Discipline` lineage trees; `Style` lineage trees; `LineageNode` owner trees/tree members/access rows/claim requests; `Media` claim evidence rows; `RankAward` tree members/relationships.
- Schema spot-check:
  - `LineageRelationType`: `INSTRUCTOR_STUDENT`, `TOURNAMENT_PARTNER`, `AFFILIATION`, `TRAINING_PARTNER`, `SEMINAR`, `COMPETITION_TEAM`.
  - `RankAward.awardedAt`: currently required `DateTime @default(now())`.
  - `LineageNode` has `visibility`, `isVerified`, `slug`, `bio`, `relationshipsFrom`, `relationshipsTo`; no `verificationStatus`.
  - `LineageRelationship` has `type`, `description`, `startedAt`, `endedAt`, `isVerified`, `createdAt`; no `verificationStatus`, `updatedAt`, or `rankAwardId`.

### 4. Runbook consulted

- [x] `docs/runbooks/schema-migration.md` read.
- [x] `docs/runbooks/prisma-workflow.md` read.
- Migration strategy: `migrate dev` for additive production-track migration files.

### 5. Data flow reference

- [x] `docs/runbooks/sop-data-and-wiring-flows.md` — relevant flow: high-level platform flow, auth + brand context flow, identity shell flow.
- [x] `docs/runbooks/sop-e2e-user-lifecycle.md` — lifecycle stage covered: Rank lifecycle (`RankAward` as promotion fact) and public directory/profile lineage display groundwork.

### 6. FAILED_STEPS check

- Prior failures in this area: FS-0006, FS-0007, FS-0008, FS-0021 from prior session notes.
- Mitigation acknowledged: Petey plan/task IDs created before schema edits; schema spot-check pasted from source; migration runbooks loaded; Graphify used before repo-wide discovery.

## Task Log

SESSION_0178_TASK_01, SESSION_0178_TASK_02, SESSION_0178_TASK_03

## What landed

- **TASK_01 done** - `apps/web/prisma/schema.prisma` now has the Lineage Tree v1 additive schema: new lineage enums, `PROMOTED_BY`, nullable `RankAward.awardedAt`, verification status fields, new tree/member/group/access/claim/evidence models, and required relation arrays.
- **TASK_02 done** - Added and applied migration `20260517000100_add_lineage_tree_v1_schema`. Migration includes safe `LineageRelationship.updatedAt` backfill, `isVerified -> verificationStatus` backfill, `RankAward.awardedAt` nullability, and custom integrity indexes.
- **TASK_03 done** - Verified migration status/diff/generate/targeted lineage seed/backfill queries. Full app typecheck still fails in unrelated baseline areas; filtered typecheck output had no lineage/schema-specific errors.
- Added ADR 0016 and glossary entries for lineage promotion source-of-truth language.

## Files touched

- `docs/sprints/SESSION_0178.md` — created current session log and Petey/Cody pre-flight.
- `docs/protocols/project-log.md` — appended SESSION_0178 task plan and review entries.
- `apps/web/prisma/schema.prisma` — added Lineage Tree v1 schema models/enums/relations; formatted by `prisma format`.
- `apps/web/prisma/migrations/20260517000100_add_lineage_tree_v1_schema/migration.sql` — created additive production-track migration with safe backfill SQL.
- `docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md` — created ADR for `RankAward` canonical promotion truth and `PROMOTED_BY` mirror.
- `docs/architecture/ubiquitous-language.md` — added lineage terms and updated RankAward meaning.
- `docs/knowledge/wiki/index.md` — added ADR 0016 and sessions 0174-0178 rows.
- `docs/architecture/lineage/lineage-prisma-schema-patch-proposal.md` — added ADR/session backlinks.
- `docs/architecture/lineage/lineage-rank-promotion-sync-rules.md` — added ADR/session backlinks.

## Decisions resolved

- Use `session-0178-lineage-schema` branch for the schema work instead of continuing dirty work on `main`.
- `RankAward` is canonical promotion truth; ADR 0016 records this.
- `LineageRelationship(type=PROMOTED_BY)` is a graph mirror, with `fromNodeId` as promoter and `toNodeId` as promoted person.
- `LineageRelationship` is unique by `rankAwardId` so repeated promotions between the same promoter/student can each be mirrored. Legacy non-award pair/type uniqueness is preserved by custom partial SQL index `LineageRelationship_pair_type_without_rank_award_key`.
- `LineageVisualGroup` keeps Prisma's generated uniqueness and adds custom SQL index `LineageVisualGroup_unknown_date_key` so unknown-date groups are actually unique despite nullable SQL behavior.

## Open decisions / blockers

- Full `bun run db:seed` failed on pre-existing non-idempotent `prisma/seed.ts` duplicate `User.email` path. Targeted `bun prisma/seed-baseline-lineage.ts` passed against the migrated DB.
- Full `bun run typecheck` fails in unrelated existing areas: Zod resolver version mismatch, React/Slot prop duplicate type issues, Next config duplicate package types, Resend API type drift, and `seed-baseline-platform.ts` DayOfWeek enum typing. Filtered typecheck output for `lineage`, `Lineage`, `RankAward`, `seed-baseline-lineage`, `schema.prisma`, and the migration name was empty.
- No lineage adapter/unit tests exist yet (`bun test server/web/lineage` found no matching test files). Next session should add tests before changing the public viewer.

## Next session

- **Goal:** Build the lineage server read model and tree adapter tests on top of the landed schema.
- **Inputs to read:** `docs/sprints/SESSION_0178.md`, `docs/architecture/lineage/lineage-rank-promotion-sync-rules.md`, `docs/architecture/lineage/lineage-v1-acceptance-test-plan.md`, `apps/web/server/web/lineage/queries.ts`, `apps/web/prisma/schema.prisma`.
- **First task:** Query the new `LineageTree`/`LineageTreeMember` schema into a public viewer payload without changing the UI yet.

## Hostile close review

- **Review log:** `SESSION_0178_REVIEW_01`.
- **Dirstarter docs check:** live docs checked.
- **Sources:** `https://dirstarter.com/docs/database/prisma`, `docs/runbooks/schema-migration.md`, `docs/runbooks/prisma-workflow.md`.
- **Verdict:** Aligned. The session used Prisma schema + versioned migration files and did not use `db push` or reset the existing dev DB. Data integrity risk from repeated promotions was caught before migration and resolved with `rankAwardId` uniqueness plus a custom partial legacy uniqueness index. Verification is credible for the schema slice, but full-app typecheck and global seed are still not clean for unrelated baseline reasons.

## ADR / ubiquitous-language check

- ADR needed and created: `docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md`.
- Ubiquitous language updated with LineageNode, LineageRelationship, PROMOTED_BY, LineageTree, LineageTreeMember, LineageVisualGroup, LineageTreeAccess, LineageClaimRequest, LineageClaimEvidence, and LineageVerificationStatus.

## Verification

| Check | Result |
| --- | --- |
| DB reachability | `/Applications/Postgres.app/Contents/Versions/latest/bin/psql ronindojo_dev -c "SELECT 1;"` passed |
| Prisma validate | `bunx prisma validate` passed before and after `prisma format` |
| Migration apply | `bunx prisma migrate deploy` applied `20260517000100_add_lineage_tree_v1_schema` |
| Migration status | `bunx prisma migrate status` reported database schema up to date |
| Migration diff | `bunx prisma migrate diff --from-migrations prisma/migrations --to-config-datasource --exit-code` reported no difference |
| Prisma generate | `bun run db:generate` passed |
| Backfill proof | LineageNode: 18 PENDING; LineageRelationship: 8 PENDING, 9 VERIFIED; 0 null `LineageRelationship.updatedAt`; 4 existing non-null `RankAward.awardedAt` preserved |
| Custom indexes | `LineageRelationship_pair_type_without_rank_award_key` and `LineageVisualGroup_unknown_date_key` exist in Postgres |
| Targeted lineage seed | `bun prisma/seed-baseline-lineage.ts` passed; 0 created, 17 users found, 18 nodes found, 17 relationships found |
| Full seed | `bun run db:seed` failed on duplicate `User.email` in pre-existing `prisma/seed.ts` createMany path |
| Typecheck | `bun run typecheck` failed in unrelated baseline areas; filtered lineage/schema output was empty |
| Lineage tests | `bun test server/web/lineage` found no matching test files |
| Wiki lint | `bun run wiki:lint` passed with 0 errors and 501 warnings: 2 orphan page warnings plus 499 pre-existing R8 markdown warnings |
| Diff hygiene | `git diff --check` passed |

## Reflections

- Giddy caught the critical schema issue before migration: preserving old `fromNodeId + toNodeId + type` uniqueness would have blocked repeated promotions by the same promoter.
- Prisma's non-interactive `migrate dev --create-only` would not generate the unexecutable migration, so `migrate diff` plus a manually curated migration file was the right path.
- The existing dev DB was valuable here because it forced the `updatedAt` backfill problem to surface before the migration file was committed.
- `prisma format` touched alignment in unrelated schema blocks. It is harmless but adds review noise; future schema sessions should decide whether full-schema formatting is acceptable before running it.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Checked touched docs: `SESSION_0178`, ADR 0016, Ubiquitous Language, wiki index, lineage schema/sync specs, project log. Updated dates/last_agent/backlinks where needed. |
| Backlinks/index sweep | Added ADR 0016 to wiki index; added sessions 0174-0178 to wiki index; added ADR/session backlinks to lineage schema and sync specs; paired ADR 0016 with Ubiquitous Language and SESSION_0178. |
| Wiki lint | `bun run wiki:lint` passed with 0 errors and 501 warnings (2 existing lineage spec orphans, 499 existing R8 warnings across older docs). |
| Kaizen reflection | Reflections section present: yes. |
| Hostile close review | `SESSION_0178_REVIEW_01` added to `docs/protocols/project-log.md`; findings recorded for full-seed idempotency, full typecheck debt, and missing lineage tests. |
| Review & Recommend | Next session goal written: build lineage server read model and tree adapter tests on landed schema. |
| Memory sweep | ADR 0016 and Ubiquitous Language updated; no separate operator memory needed because durable repo docs now carry the decision. |
| Next session unblock check | Unblocked for server read-model work; must treat full typecheck/global seed debt as unrelated existing blockers unless next task touches those surfaces. |
| Git hygiene | Branch `session-0178-lineage-schema`; worktree/giting status and commit hash will be reported in final response after commit. |
| Graphify update | Will run after git hygiene per closing ritual and report final node/edge/community count in final response. |

## Status

closed-full
