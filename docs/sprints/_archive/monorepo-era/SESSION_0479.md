---
title: "SESSION 0479 - RankMilestone Schema Slice"
slug: session-0479
type: session--implement
status: closed
created: 2026-07-01
updated: 2026-07-01
last_agent: codex-session-0479
sprint: S49
pairs_with:
  - docs/sprints/SESSION_0478.md
  - docs/petey-plan-0477-belt-journey-crm-epic.md
  - docs/runbooks/database/schema-migration.md
  - docs/runbooks/database/prisma-workflow.md
  - docs/runbooks/domain-features/lineage-hub.md
  - docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0479 - RankMilestone Schema Slice

## Date

2026-07-01

## Operator

Brian + codex-session-0479

## Goal

Execute Slice 2 of `docs/petey-plan-0477-belt-journey-crm-epic.md`: add the `RankMilestone` schema model,
hand-authored migration, ADR, and ubiquitous-language updates while preserving `RankAward` as the canonical
promotion fact.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` -> `closed` at bow-out, per
closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0478.md`
- Carryover: SESSION_0478 shipped Slice 1 of the epic: the schema-free school-leads flywheel and custom-school
  Join-the-Legacy wiring. Its `Next session` block explicitly points here to Slice 2 in
  `docs/petey-plan-0477-belt-journey-crm-epic.md`.

### Branch and worktree

- Branch: `auto/session-0479`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `e3ba02b2`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma/database, media attachment schema |
| Extension or replacement | Extension: additive BBL belt-journey enrichment on top of existing `RankAward` and `MediaAttachment` primitives |
| Why justified | The BBL rank-history pillar needs member-owned story/media without letting profile enrichment become promotion truth |
| Risk if bypassed | Belt stories would either overload `RankAward` or store media in legacy JSON instead of the existing media-attachment substrate |

Live docs checked during planning: cached Dirstarter baseline index and BBL SoT set; no live browser doc check
needed because the slice follows existing local Prisma runbooks and does not alter Dirstarter integration config.

### BBL SoT check

- Read the BBL SoT set required by opening.md for BBL work:
  `BBL-SOT-Spec.md`, `SOT-ADR.md`, `PRD.md`, `STORIES.md`, `CUTOVER_CHECKLIST.md`, and `GAP_MATRIX.md`.
- Relevant product truth: BBL's North Star is the verified lineage graph; rank history is a product pillar, and
  automatic verification remains a non-goal.
- Relevant architecture truth: `Passport`/lineage identity work is current substrate context; this slice does not
  change claim, RBAC, or verification policy.

### Graphify check

- Graph status: current; stats at bow-in: 15,826 nodes, 31,141 edges, 2,158 communities, 2,381 files tracked.
- Queries used:
  - `RankMilestone RankAward MediaAttachment belt journey rank award fact member milestone`
- Files selected from graph and direct follow-up reads:
  - `docs/petey-plan-0477-belt-journey-crm-epic.md`
  - `docs/runbooks/domain-features/lineage-hub.md`
  - `docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md`
  - `apps/web/prisma/schema.prisma` (exact model spot-check before schema edits)
- Verification note: Graphify was used as navigation only; exact sources are opened directly before editing.

### Backlog scan

- `bun scripts/ledger-backlog.ts --top=10`: 52 open items; P0/P1 items exist, but the operator pinned the latest
  SESSION `Next session` block.
- `(cd apps/web && bun scripts/board-backlog.ts --top=10)`: 51 open board cards; board order is acknowledged, but
  the operator-pinned Slice 2 task wins this session.

### Routing and grill outcome

- Router: "Build a feature against a clear plan" -> Cody pre-flight + implementation, then Doug verification.
  Petey remains the inline orchestrator because the session is multi-step schema/docs work.
- No grill performed: headless sessions cannot re-decide the epic plan.
- Locked decision applied: `RankAward` remains the canonical promotion fact; `RankMilestone` is a member-owned,
  member-editable, non-verified enrichment that is 1:1 with `RankAward`.
- Locked decision applied: media attaches via the existing polymorphic `MediaAttachment` pattern using a nullable
  `rankMilestoneId`; `RankAward.mediaUrls` is deprecated, not dropped.

### Drift logged

No new drift identified during bow-in. Existing product docs are older than the epic plan in places, but no direct
contradiction blocks Slice 2.

## Petey plan

### Goal

Ship the additive RankMilestone schema slice plus its decision and language records without changing rank authority.

### Tasks

#### SESSION_0479_TASK_01 - Schema and migration

- **Agent:** Cody
- **What:** Add `RankMilestone`, add `MediaAttachment.rankMilestoneId`, add the `RankAward.milestone`
  back-relation, and deprecate `RankAward.mediaUrls`.
- **Steps:**
  1. Complete schema pre-flight with exact model and relation spot-checks from `schema.prisma`.
  2. Edit `apps/web/prisma/schema.prisma` additively.
  3. Hand-author a migration with `CREATE TABLE`, nullable FK/index on `MediaAttachment`, and cascade from
     `RankMilestone.rankAwardId` to `RankAward.id`.
  4. Run Prisma validation/generation and confirm the migration applies.
- **Done means:** `schema.prisma` validates, Prisma client generates, and the migration applies locally without
  destructive SQL.
- **Depends on:** nothing.

#### SESSION_0479_TASK_02 - ADR and ubiquitous language

- **Agent:** Cody
- **What:** Record the fact/enrichment split in a new ADR and add `RankMilestone` / `Belt Journey` language.
- **Steps:**
  1. Author `docs/architecture/decisions/0043-rank-award-fact-vs-member-milestone.md`.
  2. Update `docs/architecture/ubiquitous-language.md` with concise terms.
  3. Keep links/backlinks/frontmatter aligned for wiki lint.
- **Done means:** ADR and ubiquitous-language entries explain that milestones never verify or change rank facts.
- **Depends on:** SESSION_0479_TASK_01.

#### SESSION_0479_TASK_03 - Verify schema slice

- **Agent:** Doug
- **What:** Run focused schema gates and required read-only repo gates.
- **Steps:**
  1. Run `cd apps/web && bunx prisma validate`.
  2. Run `cd apps/web && bun run db:generate` after schema edits.
  3. Run the relevant migration apply check on the local dev DB.
  4. Run `bun run wiki:lint`, `bun run typecheck`, and read-only Oxc gates.
  5. Run `cd apps/web && npx next build` because app schema/code generated output changes can affect build.
  6. Run `npx fallow audit --base origin/main` and require `dead_code_introduced: 0`.
- **Done means:** gates pass with honest notes for any pre-existing warnings.
- **Depends on:** SESSION_0479_TASK_02.

#### SESSION_0479_TASK_04 - Full close and commit

- **Agent:** Doug
- **What:** Perform full bow-out, memory sweeps, hostile close review, `graphify update`, FS-0024 git guard, and
  commit only.
- **Steps:**
  1. Fill this SESSION file, wiki index/log sweep, and component inventory sweep.
  2. Run final `bun run wiki:lint`, `bun run typecheck`, and read-only Oxc gates exactly as requested.
  3. Write hostile close review and next-session recommendation.
  4. Run `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` before commit.
  5. Run FS-0024 `pwd`/remote guard, stage, review, and commit with a conventional message.
- **Done means:** SESSION_0479 is closed, one commit exists on the current branch, and Codex does not push or open
  a PR.
- **Depends on:** SESSION_0479_TASK_03.

### Parallelism

Sequential. The ADR and language depend on the final schema shape, and verification/close depend on the diff.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0479_TASK_01 | Cody | Schema/migration implementation |
| SESSION_0479_TASK_02 | Cody | Architecture and domain-language documentation |
| SESSION_0479_TASK_03 | Doug | Gate execution and verification honesty |
| SESSION_0479_TASK_04 | Doug | Closing ritual, hostile review, and git hygiene |

### Open decisions

None. Slice 2 decisions are locked by `docs/petey-plan-0477-belt-journey-crm-epic.md`.

### Risks

- Prisma relation names must match existing `RankAward` and `MediaAttachment` conventions or generated client
  types will churn unexpectedly.
- `RankAward.mediaUrls` is deprecated only; dropping it would violate the locked additive slice.
- Migration must not depend on production data access; prod migration is operator-reviewed through the PR/deploy
  path, not run manually here.

### Scope guard

- Do not build Slice 3 oRPC CRUD, UI cards, profile tabs, or lead pipeline work.
- Do not add privacy/visibility fields to `RankMilestone`.
- Do not change rank verification, claim review, `RankAward.rankId`, or lineage relationship semantics.
- Do not send emails, mutate prod data, push, open a PR, or deploy.
- Skip operator-only browser/device smoke and record it as operator-side if relevant.

### Dirstarter implementation template

- **Docs read first:** `docs/runbooks/database/schema-migration.md`,
  `docs/runbooks/database/prisma-workflow.md`, `docs/protocols/cody-preflight.md`,
  `docs/runbooks/domain-features/lineage-hub.md`, ADR 0016, BBL SoT set, and `schema.prisma`.
- **Baseline pattern to extend:** Prisma additive migration plus existing `MediaAttachment` polymorphic nullable FK
  pattern.
- **Custom delta:** BBL belt-journey story/media enrichment attached 1:1 to a canonical rank award.
- **No-bypass proof:** No replacement of Dirstarter database tooling or media table; this reuses Prisma
  migrations and the existing media attachment model.

## Cody pre-flight

### Pre-flight: Schema - RankMilestone model

#### 1. Petey invocation

- Petey plan exists in SESSION file with task IDs: yes, `SESSION_0479_TASK_01` through
  `SESSION_0479_TASK_04`.
- Petey waived: no; schema work requires Petey orchestration.

#### 2. Design doc check

- Design doc consulted: `docs/petey-plan-0477-belt-journey-crm-epic.md` Slice 2.
- Models match design doc: yes, with local relation naming matched to existing schema conventions.

#### 3. Existing schema scan

- Current model count: 126 (`rg -c "^model " apps/web/prisma/schema.prisma`).
- Related existing models:
  - `Rank`: `id`, `sortOrder`, `name`, `shortName`, `colorHex`, `rankSystemId`; back-relation
    `rankAwards RankAward[]`.
  - `RankAward`: `id`, `awardedAt`, `notes`, `location`, `mediaUrls Json?`, `source RankAwardSource`,
    `verificationStatus RankAwardVerificationStatus`, `passportId`, `rankId`, `awardedById?`,
    `awardedByPassportId?`, `organizationId?`, `promotionEventId?`; existing back-relations
    `lineageRelationships`, `gamificationEvents`, `mediaAttachments`.
  - `MediaAttachment`: nullable owner ids `passportId`, `techniqueId`, `eventId`, `rankAwardId`, `courseId`,
    `organizationId`, `contentAtomId`, `certificateTemplateId`, `promotionEventId`; matching nullable relations
    and one `@@index` per FK.
  - `RankAwardSource` enum: `STATED`, `EARNED`.
  - `RankAwardVerificationStatus` enum: `UNVERIFIED`, `VERIFIED`, `DISPUTED`, `IMPORTED`.
- Back-relations needed: `RankAward.milestone RankMilestone?` and `RankMilestone.media MediaAttachment[]`;
  `MediaAttachment.rankMilestoneId String?` plus nullable `rankMilestone RankMilestone?` relation and index.
- Schema spot-check: direct read completed from `apps/web/prisma/schema.prisma` lines around `Rank`, `RankAward`,
  and `MediaAttachment`; no enum spelling inferred from plan prose.

#### 4. Runbook consulted

- `docs/runbooks/database/schema-migration.md` read: yes.
- `docs/runbooks/database/prisma-workflow.md` read: yes.
- Migration strategy: additive production-bound change -> hand-authored versioned migration file; validate/generate
  and apply locally.

#### 5. Data flow reference

- `docs/runbooks/sops/sop-data-and-wiring-flows.md`: rank lifecycle writes to Prisma behind auth/brand seams; this
  slice adds no mutation surface.
- `docs/runbooks/sops/sop-e2e-user-lifecycle.md`: rank lifecycle -> `RankAward`; `RankMilestone` is enrichment
  downstream of the award, not authority.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0006, FS-0008, FS-0021, FS-0024, FS-0025, FS-0027.
- Mitigation acknowledged: Petey plan/task IDs written before schema edits; exact schema spot-check is required
  before edits; migration runbook steps will be recorded; FS-0024 guard runs before mutating git; graphify update
  runs before the single close commit; multi-file tests use `--parallel=1`/`bun run test` if any tests are added.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0479_TASK_01 | landed | Added additive `RankMilestone` schema, `MediaAttachment.rankMilestoneId`, `RankAward.milestone`, and hand-authored migration |
| SESSION_0479_TASK_02 | landed | Added ADR 0043, updated ADR 0016/0035 links, lineage hub, schema wiki annotation, and ubiquitous-language entries |
| SESSION_0479_TASK_03 | landed | Ran schema validation, generate, fresh-DB migration apply/diff, wiki, typecheck, Oxc, build, and fallow gates |
| SESSION_0479_TASK_04 | landed | Ran full close sweep, hostile review, graphify update, FS-0024 guard, and commit prep |

## What landed

- `apps/web/prisma/schema.prisma` now has `RankMilestone`, a 1:1 member-owned enrichment record for
  `RankAward`, with no rank authority, verification, or privacy fields.
- `MediaAttachment` now has nullable `rankMilestoneId` and the matching relation/index, following the existing
  polymorphic media-owner pattern.
- `RankAward.mediaUrls` is marked deprecated in schema comments; it is retained and not migrated/dropped.
- `apps/web/prisma/migrations/20260701000000_add_rank_milestone/migration.sql` hand-authors the additive table,
  nullable FK, indexes, and cascade/SET NULL foreign keys.
- ADR 0043 records the fact/enrichment split; ADR 0016 and ADR 0035 now cross-reference it.
- Ubiquitous language now defines `Belt Journey` and `RankMilestone`; the lineage hub and schema wiki annotation
  point at the new model/decision.

## Decisions resolved

- Applied the locked Slice 2 decision without re-grilling: `RankMilestone` enriches a `RankAward`; it never owns
  rank fact, verification, or privacy.
- Preserved the additive migration boundary. No data backfill, drop, enum, or prod-data touch happened.
- Used a fresh throwaway local database for migration apply/diff proof because the configured local
  `ronindojo_prodsnap` database has pre-existing drift (`playing_with_neon` table). No reset was run.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/prisma/schema.prisma` | Added `RankMilestone`, `MediaAttachment.rankMilestoneId`, `RankAward.milestone`, and deprecated `RankAward.mediaUrls` |
| `apps/web/prisma/migrations/20260701000000_add_rank_milestone/migration.sql` | Hand-authored additive migration for the schema delta |
| `docs/architecture/decisions/0043-rank-award-fact-vs-member-milestone.md` | New ADR for `RankAward` fact vs `RankMilestone` enrichment |
| `docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md` | Added SESSION_0479 amendment and backlink to ADR 0043 |
| `docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md` | Linked ADR 0043 as preserving awarded-truth display |
| `docs/architecture/ubiquitous-language.md` | Added `Belt Journey` and `RankMilestone`; refreshed `RankAward` wording |
| `docs/runbooks/domain-features/lineage-hub.md` | Added ADR 0043 and `RankMilestone` to the lineage schema map |
| `docs/knowledge/wiki/files/schema-prisma.md` | Refreshed schema counts and rank-model summary |
| `docs/knowledge/wiki/index.md` | Added ADR 0043 and SESSION_0479 rows |
| `docs/sprints/SESSION_0479.md` | Bow-in, Petey plan, Cody pre-flight, task log, verification, hostile review, and full close evidence |

## Verification

| Command / smoke | Result |
| --- | --- |
| `cd apps/web && bunx prisma validate` | Pass: schema valid |
| `cd apps/web && bun run db:generate` | Pass: generated Prisma Client 7.8.0 |
| `cd apps/web && bunx prisma migrate dev --name add_rank_milestone --skip-seed` | Expected CLI mismatch: Prisma 7.8 does not support `--skip-seed`; no migration applied |
| `cd apps/web && bunx prisma migrate dev --name add_rank_milestone` | Blocked by pre-existing local DB drift: extra `playing_with_neon` table in `ronindojo_prodsnap`; no reset run |
| `createdb ronindojo_rankmilestone_0479` + `DIRECT_URL=... DATABASE_URL=... bunx prisma migrate deploy` | Pass: all 63 migrations applied to a fresh throwaway DB, including `20260701000000_add_rank_milestone` |
| `createdb ronindojo_rankmilestone_diff_0479` + `bunx prisma migrate deploy` + `bunx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code` | Pass: fresh DB migration apply succeeded; diff reported `No difference detected.` |
| `dropdb ronindojo_rankmilestone_0479` / `dropdb ronindojo_rankmilestone_diff_0479` | Pass: removed only throwaway local proof DBs |
| `bun run wiki:lint` | Pass final: 0 errors, 16 pre-existing R8 warnings outside this session |
| `bun run typecheck` | Pass final rerun after SESSION fill |
| `cd apps/web && bun run lint:check` | Pass final: exit 0 with existing Oxc warnings outside this slice |
| `cd apps/web && bun run format:check` | Pass final: all matched files formatted |
| `cd apps/web && npx next build` | Pass: existing Turbopack NFT warning for storage monitoring and existing `pg` deprecation warning during static generation |
| `npx fallow audit --base origin/main` | Pass: `No issues in 17 changed files`; inherited `pg` dependency, duplication, and complexity findings excluded |
| Operator-only browser/device smoke | Skipped by operator instruction; no UI route or component changed in this slice |

## Open decisions / blockers

- None blocking Slice 3.
- Operational note: the configured local `ronindojo_prodsnap` DB has pre-existing drift (`playing_with_neon`
  table). This session did not reset it; migration proof used throwaway DBs plus a clean datamodel diff.

## Next session

### Goal

Continue with Slice 3 of `docs/petey-plan-0477-belt-journey-crm-epic.md` if Slice 2 closes cleanly: Belt oRPC
CRUD with the rank-ceiling invariant.

### First task

Read Slice 3 in the epic plan and complete backend/oRPC pre-flight against the existing `RankAward`,
`RankMilestone`, `setPassportRank`, and `pickTopAwardInDiscipline` seams before writing any procedure.

## Review log

### SESSION_0479_REVIEW_01 - RankMilestone schema close review

- **Reviewed tasks:** SESSION_0479_TASK_01, SESSION_0479_TASK_02, SESSION_0479_TASK_03, SESSION_0479_TASK_04
- **Dirstarter docs check:** live docs checked for Prisma/database baseline
- **Sources:** `docs/petey-plan-0477-belt-journey-crm-epic.md`,
  `docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md`,
  `docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md`,
  `docs/architecture/decisions/0043-rank-award-fact-vs-member-milestone.md`,
  `apps/web/prisma/schema.prisma`, <https://dirstarter.com/docs/getting-started>,
  <https://dirstarter.com/docs/introduction>
- **Verdict:** Aligned. The schema delta is additive, uses the existing Prisma migration and media attachment
  substrate, and preserves `RankAward` as the only promotion fact. The local drift on `ronindojo_prodsnap` is an
  environment issue, not a schema failure, because fresh deploy plus datamodel diff passed.
- **Score:** 9.5/10
- **Follow-up:** Slice 3 must enforce the rank-ceiling and verified-fact mutation rules before any Belt Journey
  write path can use the new table.

## Hostile close review

- **Giddy:** Pass, 9.5/10. The slice followed the locked epic, kept schema additive, avoided privacy/verification
  fields, and documented the new split in ADR/UL. Main risk is future code accidentally treating
  `RankMilestone` as rank authority; ADR 0043 and the session handoff make that explicit.
- **Doug:** Pass, 9.4/10. Prisma validate/generate, fresh migration apply, migration-schema diff, typecheck,
  Oxc, build, fallow, and wiki gates passed. The configured local DB drift was not papered over; proof moved to
  isolated throwaway DBs.
- **Desi:** Not applicable. No UI component or browser surface changed; component inventory was checked and did
  not need an update.
- **Kaizen aggregate:** 9.5/10 — small, auditable schema slice with a clean migration proof and no runtime UI claim.

### Findings (severity >= medium)

None.

## ADR / ubiquitous-language check

- ADR update required and completed: `docs/architecture/decisions/0043-rank-award-fact-vs-member-milestone.md`.
- Related ADR updates completed: ADR 0016 amendment and ADR 0035 cross-reference.
- Ubiquitous language update required and completed: `Belt Journey` and `RankMilestone` added.

## Reflections

- The important guardrail in this slice was semantic, not mechanical. A `RankMilestone` table is simple; the
  risk is letting it become a second place to infer rank truth. Keeping the model rankless and verification-free
  makes the invariant obvious in the schema.
- The local `migrate dev` drift was useful signal. Resetting the dev DB would have hidden the fact that the
  configured database has unrelated drift; proving against a throwaway DB gave cleaner evidence and avoided
  touching local data.
- The next slice is where the risk moves from schema to authorization: the oRPC write paths must gate against
  rank ceiling, ownership, and verified-fact immutability before the new enrichment table is user-editable.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Updated/stamped touched docs with `updated: 2026-07-01` and `last_agent: codex-session-0479` where applicable: ADR 0016, ADR 0035, ADR 0043, ubiquitous language, lineage hub, schema wiki, wiki index, SESSION_0479. |
| Backlinks/index sweep | Added ADR 0043 and SESSION_0479 to `docs/knowledge/wiki/index.md`; added reciprocal links among ADR 0016, ADR 0035, ADR 0043, ubiquitous language, lineage hub, and schema wiki. Wiki log checked and left superseded; component inventory checked and left unchanged. |
| Wiki lint | Final `bun run wiki:lint` passed with 0 errors and 16 pre-existing warnings, all outside SESSION_0479. |
| Kaizen reflection | Present in `## Reflections` and `## Hostile close review`. |
| Hostile close review | `SESSION_0479_REVIEW_01`; Giddy 9.5/10, Doug 9.4/10, Desi not applicable, aggregate 9.5/10. |
| Code-quality gate (Class-A) | No Class-A custom UI/kernel code. Schema/docs slice only; Prisma and full close gates cover the risk. |
| Runtime verification (Doug) | Schema/runtime build gates passed; operator-only browser/device smoke skipped by instruction; no UI route changed. |
| Review & Recommend | Next session written: Slice 3 Belt oRPC CRUD with rank-ceiling invariant from the epic plan. |
| Memory sweep | Wiki index, schema wiki annotation, lineage hub, ADRs, and ubiquitous language updated. Wiki log superseded; component inventory no update needed. |
| Next session unblock check | Unblocked: Slice 3 can start from ADR 0043, `RankMilestone`, and the existing `RankAward` invariant docs. |
| Git hygiene | Final gates passed; FS-0024 guard, stage review, and one conventional commit run after this evidence patch. Push/PR intentionally skipped by operator override. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` ran before commit; full stats after update: 15,843 nodes, 31,118 edges, 2,124 communities, 2,382 files tracked. |
