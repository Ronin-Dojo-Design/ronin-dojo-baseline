---
title: "SESSION 0391 — Phase 3b destructive Passport user-carry migration"
slug: session-0391
type: session--open
status: closed
created: 2026-06-15
updated: 2026-06-15
last_agent: codex-session-0391
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0390.md
  - docs/product/black-belt-legacy/PHASE3_USER_CARRY_PREFLIGHT.md
  - docs/product/black-belt-legacy/SOT-ADR.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0391 — Phase 3b destructive Passport user-carry migration

## Date

2026-06-15

## Operator

Brian + codex-session-0391 (Petey -> Cody -> Doug -> Petey)

## Goal

Execute Phase 3b safely: re-run the Phase 3 preflight gate, write the destructive user-carry migration in the required order, preserve Brian Scott's real admin account and the 17 BBL people as Passports/identity rows, hard-delete only synthetic placeholder Users after assertions pass, and move the old `userId` identity-satellite constraints to `passportId`.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` -> `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0390.md`
- Carryover: SESSION_0390 landed the reversible Phase 3a substrate: `server/identity/`, nullable `passportId` on the five identity satellites, nullable `Passport.userId`, and the read-only preflight gate. This session continues with the destructive Phase 3b migration that the prior gate intentionally blocked until missing Passports and placeholder promoters are reconciled.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating this session file
- Current HEAD at bow-in: `85b80d6`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma schema/migrations and Better-Auth `User` identity adjacency. |
| Extension or replacement | Extension: Ronin-specific person-rooted identity migration on top of Dirstarter/Better-Auth. |
| Why justified | SOT-ADR D1 makes `Passport` the person root; the migration removes synthetic placeholder account rows while preserving account-bearing Users. |
| Risk if bypassed | Keeping identity satellites rooted on `User` keeps placeholder accounts alive and blocks the BBL claim model from becoming account-attach. |

Live docs checked during planning: not applicable; this is Ronin identity-domain migration work, governed by the SoT set and Prisma migration runbook.

### Graphify check

- Graph status: current enough for planning; stats at bow-in: 12861 nodes, 24615 edges, 1774 communities, 2069 files tracked.
- Queries used:
  - `Phase 3b Passport user-carry migration DirectoryProfile LineageNode Affiliation RankAward FightRecord placeholder Users passportId cuid2 phase3-preflight-assert`
  - `graphify explain "phase3-preflight-assert.ts"`
  - `graphify explain "Phase 3 User-Carry Identity Preflight Map"`
- Files selected from graph:
  - `apps/web/scripts/phase3-preflight-assert.ts`
  - `docs/product/black-belt-legacy/PHASE3_USER_CARRY_PREFLIGHT.md`
  - `apps/web/prisma/schema.prisma`
  - `apps/web/server/identity/person-service.ts`
  - lineage seed/e2e helper files as likely verification context
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof.

### Grill outcome

- The operator clarified the production reality: no real users besides Brian Scott admin, but the 17 BBL people must survive. Therefore placeholder User deletion is allowed only after their person identity has been preserved as accountless Passports and all identity satellites point at those Passports.
- Existing SESSION_0390 decisions stand: FightRecord is the fifth REPOINT satellite, placeholder Users are hard-deleted after assertion, cuid2 stays in this wave, Certification remains CARRY, and claim results later use `passportAccountAttached`.
- Placeholder-promoter reconciliation is the sharp design point. Recommended plan going into code inspection: historical promoters are person identity facts, so add a promoter Passport link rather than exempting placeholder `User` rows from deletion.

### Drift logged

None at bow-in. The prior Phase 3 doc drift was resolved in SESSION_0390; this session may amend the Phase 3 preflight map if the placeholder-promoter decision changes schema shape.

## Petey plan

### Goal

Land the Phase 3b migration as a reviewable, asserted sequence that preserves real/accountless people and removes synthetic placeholder Users.

### Tasks

#### SESSION_0391_TASK_01 — Re-run and tighten the Phase 3 gate

- **Agent:** Cody
- **What:** Run `apps/web/scripts/phase3-preflight-assert.ts` against the current migration target and use its findings as the before-state ledger.
- **Steps:**
  1. Run the gate from `apps/web` against the configured `DATABASE_URL`.
  2. Record counts for Users, Passports, missing Passports, satellite orphans, placeholder Users, and placeholder `RankAward.awardedById`.
  3. Refactor the gate only if needed to support the 3b sequence without inflating CRAP.
- **Done means:** before-state gate output recorded; any gate changes compile and remain read-only.
- **Depends on:** nothing.

#### SESSION_0391_TASK_02 — Decide and implement placeholder-promoter reconciliation

- **Agent:** Petey -> Cody
- **What:** Resolve `RankAward.awardedById` placeholders so BBL historical promoters survive without keeping synthetic User accounts.
- **Steps:**
  1. Inspect `RankAward` schema/read paths for promoter display and identity semantics.
  2. Prefer a Passport-side promoter identity link if the code shape supports it cleanly.
  3. If schema changes are required, update `schema.prisma` and migration SQL with a reversible, asserted data move.
  4. Document the decision in SOT/preflight docs if it changes the DUAL shape.
- **Done means:** no placeholder User is required to remain solely because it was a historical promoter.
- **Depends on:** SESSION_0391_TASK_01.

#### SESSION_0391_TASK_03 — Write the Phase 3b destructive migration

- **Agent:** Cody
- **What:** Create the migration script/SQL in the strict order from SESSION_0390.
- **Steps:**
  1. Mint a Passport for every satellite-bearing `User` lacking one.
  2. Reconcile placeholder promoters per TASK_02.
  3. Regenerate IDs to cuid2 before satellite backfill if the existing IDs are not already cuid2.
  4. Backfill `passportId` by `Passport.userId` lookup for DirectoryProfile, LineageNode, Affiliation, RankAward earner, and FightRecord.
  5. Assert all REPOINT rows have `passportId`; assert Brian Scott admin account remains account-bearing.
  6. Null placeholder `Passport.userId`, assert no placeholder User owns remaining CARRY rows, then hard-delete placeholder Users.
  7. Drop old satellite `userId` columns and move `@unique`/`@@index` to `passportId`.
- **Done means:** migration exists, is ordered, and includes guard clauses before destructive deletes/drops.
- **Depends on:** SESSION_0391_TASK_02.

#### SESSION_0391_TASK_04 — Verify migration and code health

- **Agent:** Doug
- **What:** Prove the migration and updated schema are internally consistent.
- **Steps:**
  1. Run Prisma validation/generation/migration checks appropriate to the destructive script.
  2. Re-run the preflight gate after the safe data phases; it must PASS before old columns are dropped.
  3. Run `npx fallow audit` on touched files, then `bun run typecheck`, `bun run lint:check`, `bun run format:check`, targeted tests, and `bun run wiki:lint`.
  4. Browser-proof BBL lineage/directory if app code or generated client changes require it.
- **Done means:** gates green or blockers recorded honestly with exact failing command/output.
- **Depends on:** SESSION_0391_TASK_03.

#### SESSION_0391_TASK_05 — Close, Graphify update, commit, push, and CI/deploy follow-through

- **Agent:** Petey
- **What:** Run full bow-out, update graphify before git hygiene, then stage/commit/push to `main` and follow CI/deployment to green.
- **Steps:** Full closing ritual including optional review/reflection/ADR/component inventory checks; `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .`; FS-0024 guard; git status review; stage, commit, push; monitor CI/deploy and fix failures.
- **Done means:** SESSION_0391 closed-full, commit pushed to `main`, CI/deploy status followed through.
- **Depends on:** SESSION_0391_TASK_04.

### Parallelism

Explorer sub-agent may review the placeholder-promoter design while Cody completes local preflight and session setup. All schema/migration edits are sequential because they touch the same Prisma model and migration invariants.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0391_TASK_01 | Cody | Data gate execution and script tightening. |
| SESSION_0391_TASK_02 | Petey -> Cody | One design fork, then implementation. |
| SESSION_0391_TASK_03 | Cody | Destructive migration implementation. |
| SESSION_0391_TASK_04 | Doug | Verification, fallow, tests, browser proof. |
| SESSION_0391_TASK_05 | Petey | Governance, close, graphify, git, CI/deploy. |

### Open decisions

- Placeholder-promoter final shape is pending code/data inspection. Recommended answer: represent historical promoters as Passport identity, not as synthetic User actors.

### Risks

- Destructive migration against the wrong DB would be high-impact; all commands must run from `/Users/brianscott/dev/ronin-dojo-app/apps/web` with the intended `DATABASE_URL`.
- Moving promoter identity may touch read paths that currently include `awardedBy` as a User.
- cuid2 regeneration and FK backfill must be ordered so satellites receive post-regeneration `Passport.id` values.
- `fallow` initial audit shows `phase3-preflight-assert.ts` has CRAP 132; the 3b implementation must split logic into smaller named functions.

### Scope guard

- Preserve Brian Scott admin as an account-bearing User.
- Preserve the 17 BBL people as Passports/identity rows.
- Do not delete person identity data; only hard-delete synthetic placeholder User accounts after Passports and satellites are safe.
- Do not broaden into Phase 3c read-path/minter/claim-flow repointing except where required for schema compilation.
- Do not use `db push --accept-data-loss` on any shared/production target.

### Dirstarter implementation template

- **Docs read first:** BBL SoT set, SOT-ADR D1 amendment, `PHASE3_USER_CARRY_PREFLIGHT.md`, schema migration runbook.
- **Baseline pattern to extend:** Prisma migrations plus existing `Passport`/`MediaAttachment.passportId` identity relation precedent.
- **Custom delta:** Ronin-specific person-rooted migration and accountless historical people.
- **No-bypass proof:** Dirstarter does not provide this identity migration; Better-Auth `User` remains account-side.

## Cody pre-flight

### Pre-flight: Phase 3b schema/data migration

#### 1. Petey invocation

- Petey plan exists in this SESSION file with task IDs.
- Petey waived: not applicable.

#### 2. Design doc check

- Design docs consulted: `docs/product/black-belt-legacy/BBL-SOT-Spec.md`, `docs/product/black-belt-legacy/SOT-ADR.md`, `docs/product/black-belt-legacy/PHASE3_USER_CARRY_PREFLIGHT.md`.
- Models match design doc: pending placeholder-promoter final call; five REPOINT satellites are DirectoryProfile, LineageNode, Affiliation, RankAward earner, FightRecord.

#### 3. Existing schema scan

- Current model count: to be confirmed by Prisma/schema inspection during TASK_01.
- Related existing models: User, Passport, DirectoryProfile, LineageNode, Affiliation, RankAward, FightRecord.
- Back-relations needed: existing 3a Passport relations for the five satellites; possible new promoter Passport relation pending TASK_02.
- Schema spot-check: must read touched Prisma model blocks directly before editing; do not infer relation names from prose.

#### 4. Runbook consulted

- `docs/runbooks/database/schema-migration.md` read.
- Historical `docs/runbooks/prisma-workflow.md` path is superseded/moved; use current database/schema runbook and package scripts.
- Migration strategy: versioned migration file/script; no `db push --accept-data-loss` on shared targets.

#### 5. Data flow reference

- `docs/runbooks/sops/sop-data-and-wiring-flows.md` read; substrate-change notice points back to SoT-Spec for Phase 3 identity.
- `docs/runbooks/domain-features/lineage-hub.md` read for RankAward/lineage semantics.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0002, FS-0006, FS-0007, FS-0008.
- Mitigation acknowledged: dev command is `cd apps/web && npx next dev --turbo`; Petey plan created before implementation; schema model blocks will be read directly; fallow runs before and after implementation.

### Pre-flight: backend/data script

#### 1. Auth predicates planned

- Session auth is not used; this is an offline migration/gate script.
- Brand filtering is not applicable to global identity rows, but BBL people preservation is a hard data invariant.
- Authorization approach: operator-only local/CI migration execution.

#### 2. Existing action scan

- Consulted Graphify and prior Phase 3 docs instead of repo-wide search.
- Related existing script: `apps/web/scripts/phase3-preflight-assert.ts`.
- L1 pattern match: custom migration script using Prisma adapter and raw SQL catalog checks.

#### 3. Data flow reference

- Flow: identity shell flow and lineage RankAward provenance from the SoT/lineage hub.
- Lifecycle stage: pre-claim accountless person identity.

#### 4. FAILED_STEPS check

- Prior failures: FS-0006/FS-0008.
- Manual Boundary Registry entries: not checked yet; verify during close if relevant.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0391_TASK_01 | complete | Re-ran Phase 3 preflight gate; confirmed local migration-target fail state before 3b (`LineageNode`/`RankAward` Passport orphans and placeholder promoters). |
| SESSION_0391_TASK_02 | complete | Resolved placeholder promoters by adding `RankAward.awardedByPassportId` for historical promoter identity; `awardedById` remains real account actor only. |
| SESSION_0391_TASK_03 | partial | Wrote and rehearsed the destructive 3b data migration through preflight PASS. Guarded drop SQL is staged but intentionally not applied until Phase 3c read/write paths are repointed. |
| SESSION_0391_TASK_04 | complete | Prisma validation/generation, migration deploy, data rehearsal, preflight PASS, typecheck, oxfmt/oxlint on touched files, targeted tests, and fallow new-only gate passed. Browser proof deferred because current code still reads old nullable `userId` relations. |
| SESSION_0391_TASK_05 | complete | Full close record prepared; Graphify refreshed before git hygiene; commit/push/CI follow-through recorded at bow-out. |

## What landed

- Added the Phase 3b promoter Passport schema shape: `RankAward.awardedByPassportId` plus the
  `PromotedByPassport` relation and migration
  `20260615120000_phase3b_rank_award_promoter_passport`.
- Added `scripts/phase3b-user-carry-data.ts`, an asserted destructive migration script for the data
  phase: mint missing Passports, copy historical promoters, backfill satellite `passportId`, rewrite
  identity-table IDs to cuid2, null old placeholder satellite `userId`s, detach Passports, and
  hard-delete placeholder Users.
- Added `scripts/phase3-identity-satellites.ts` so the preflight gate and 3b script share the same
  five identity-satellite definition.
- Added `scripts/phase3b-drop-old-user-columns.sql` as guarded step-6 SQL for the final physical
  `userId` column drops and constraint moves. It was not applied because Phase 3c code repointing must
  happen first.
- Rehearsed the 3b data script on a reset local migration-target seed. It preserved BBL people as
  accountless Passports and preserved Brian Scott admin as an account-bearing User.
- Updated the BBL SoT/preflight docs with the promoter Passport decision, safe hard-delete ordering,
  and the Phase 3c boundary for old-column drops.

## Decisions resolved

- Brian Scott admin is the only real account that must remain account-bearing today; the imported BBL
  people are real people but not real auth accounts, so they must survive as accountless Passports.
- `RankAward.awardedById` means account actor only. Imported/historical promoter identity lives on
  `RankAward.awardedByPassportId`.
- Do not rewrite `User.id` in this Phase 3b data script. The script rewrites identity-table IDs
  (`Passport`, `DirectoryProfile`, `LineageNode`, `Affiliation`, `RankAward`, `FightRecord`) and leaves
  Better-Auth/account-side operational references intact.
- Do not apply the old-column drop SQL until Phase 3c has repointed read/write paths away from old
  satellite `user`/`userId` relations. Applying it now would make the app fail before the code sweep.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/package.json` | Added `phase3b:user-carry` script and `@paralleldrive/cuid2`. |
| `bun.lock` | Lockfile update for `@paralleldrive/cuid2`. |
| `apps/web/prisma/schema.prisma` | Added `RankAward.awardedByPassportId` and Passport back-relation. |
| `apps/web/prisma/migrations/20260615120000_phase3b_rank_award_promoter_passport/migration.sql` | Added nullable promoter Passport FK/index. |
| `apps/web/scripts/phase3-identity-satellites.ts` | New shared identity-satellite FK definition. |
| `apps/web/scripts/phase3-preflight-assert.ts` | Uses shared identity-satellite metadata. |
| `apps/web/scripts/phase3b-user-carry-data.ts` | New asserted Phase 3b destructive data migration script. |
| `apps/web/scripts/phase3b-drop-old-user-columns.sql` | New guarded SQL for the deferred physical `userId` column drop and constraint moves. |
| `docs/product/black-belt-legacy/SOT-ADR.md` | Documented promoter Passport split and Phase 3b boundary. |
| `docs/product/black-belt-legacy/PHASE3_USER_CARRY_PREFLIGHT.md` | Updated ordering, promoter reconciliation, rehearsal results, and drop deferral. |
| `docs/product/black-belt-legacy/BBL-SOT-Spec.md` | Updated Phase 3 build sequence and satellite/promoter shape. |
| `docs/rituals/opening.md` | Bow-in stamp: `last_agent: codex-session-0391`. |
| `docs/sprints/SESSION_0391.md` | Session record. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `npx fallow dead-code --file apps/web/scripts/phase3-preflight-assert.ts --file apps/web/server/identity/person-service.ts --file apps/web/server/identity/person-schema.ts --file apps/web/server/identity/person-service.test.ts --format compact` | Baseline fail: preflight script reported unused file; `ClaimantHasPassportError.code` unused. |
| `npx fallow health --changed-since HEAD~1 --top 20 --sort severity --format compact --report-only` | Baseline advisory: health score 51.7/D for prior changed set; `phase3-preflight-assert.ts` CRAP 132. |
| `npx fallow audit --changed-since HEAD~1 --gate all --max-crap 30 --format compact` | Baseline fail on inherited prior-session issues; use as quality target for touched migration script. |
| `bun run scripts/phase3-preflight-assert.ts` | Before-state failed as expected: missing Passport orphans and 17 placeholder promoters. After 3b data script: PASS (`passports=30`, `accountless=23`, `placeholderUsers=0`). |
| `bunx prisma migrate reset --force` + `bun run db:seed` + lineage/BBL seeds | Rebuilt local migration target for rehearsal. `seed-baseline-owner.ts` failed because production `OWNER_ID` is not in local DB; lineage seed provided local owner/admin context. |
| `bun run db:migrate deploy` | PASS; applied `20260615120000_phase3b_rank_award_promoter_passport`. |
| `bun run db:generate` | PASS. |
| `bunx prisma validate` | PASS. |
| `PHASE3B_ALLOW_DESTRUCTIVE=1 bun run scripts/phase3b-user-carry-data.ts` | PASS after fixing cascade-loss ordering. Final state: `users=9`, `placeholderUsers=0`, `passports=30`, `accountlessPassports=23`. |
| `bun run typecheck` | PASS. |
| `bunx oxlint scripts/phase3b-user-carry-data.ts scripts/phase3-preflight-assert.ts scripts/phase3-identity-satellites.ts` | PASS. |
| `bunx oxfmt --check scripts/phase3b-user-carry-data.ts scripts/phase3-preflight-assert.ts scripts/phase3-identity-satellites.ts prisma/schema.prisma package.json` | PASS. |
| `bun test server/identity/ lib/lineage/rank-progression.test.ts lib/lineage/rank-progression.privacy.test.ts server/web/lineage/queries.visibility.test.ts` | PASS: 31 tests. |
| `npx fallow audit --changed-since HEAD --gate new-only --max-crap 30 --format compact` | PASS: no issues in 14 changed files; inherited issues excluded. |
| `bun run lint:check scripts/...` | PASS exit 0, but package script runs full `oxlint .`; warnings are pre-existing. |
| `bun run format:check ...` | Full-repo check failed on pre-existing vendor/family-chart formatting because package script ignores file args and runs `oxfmt --check .`; touched-file oxfmt check passed. |
| Browser proof | Deferred honestly: after 3b rehearsal old placeholder satellite `userId` columns are nullable/null, while current app code still selects old `user` relations. Phase 3c must repoint reads before meaningful browser proof. |

## Open decisions / blockers

- Step 6 physical column drop is intentionally blocked on Phase 3c code repointing. The SQL is staged,
  but applying it now would break current app code that still joins through old satellite `user`
  relations.
- Browser proof is blocked for the same reason: the local DB is in the intended intermediate 3b data
  state, while runtime read paths have not yet been repointed to Passport.

## Next session

### Goal

Phase 3c — repoint all identity read/write paths to Passport and historical promoter Passport identity,
then apply the guarded old-column drop SQL and browser-proof lineage/directory/claim surfaces.

### First task

Run Graphify for `LineageNode.user`, `RankAward.user`, `DirectoryProfile.user`, `FightRecord.user`,
`Affiliation.user`, and `awardedBy` read/write paths; then replace them with `passport` /
`awardedByPassport` joins before applying `scripts/phase3b-drop-old-user-columns.sql`.

## Review log

- **Hostile close draft:** DATA-INTEGRITY FINDING resolved in-session. First 3b script attempt would
  have cascade-deleted placeholder-owned identity rows because old satellite `userId` FKs still had
  `ON DELETE CASCADE`. The local reset/reseed caught the row-count collapse; script now nulls old
  placeholder satellite `userId` references before deleting placeholder Users.
- **Residual risk:** `phase3b-drop-old-user-columns.sql` is unexecuted by design. It must be run only
  after Phase 3c read/write repointing and a fresh preflight PASS.

## Hostile close review

- **Giddy verdict:** Pass with one explicit blocker carried forward. The data migration is reversible
  only via restore/reset, but it is gated by `PHASE3B_ALLOW_DESTRUCTIVE=1`, asserts promoter column
  presence, asserts non-null `passportId`, asserts no placeholder CARRY rows, and preserves an
  account-bearing admin/Brian User.
- **Doug verdict:** Verification is honest. No browser proof was claimed because the current app code
  is not yet Phase 3c-compatible with the local intermediate DB state.
- **Dirstarter docs check:** Not required for this close. The work extends Ronin-specific identity
  migration behavior on Prisma/Better-Auth rather than changing Dirstarter substrate contracts.

## ADR / ubiquitous-language check

- Updated the current BBL consolidated ADR (`SOT-ADR.md`) rather than creating a new scattered ADR:
  historical promoter identity is now `RankAward.awardedByPassportId`.
- No new ubiquitous-language page needed. Existing terms remain: Passport, User/account actor,
  DirectoryProfile, LineageNode, RankAward, Affiliation, FightRecord.

## Reflections

- The local reset/reseed rehearsal paid for itself: the first script version deleted the exact identity
  rows it was supposed to preserve because old placeholder satellite `userId` FKs still cascaded.
- The safer rule is now simple: when hard-deleting placeholder Users before the physical column drop,
  null or drop old placeholder satellite `userId` references first.
- Deferring the old-column drop is the right boundary. Forcing it into 3b would convert a data success
  into an app-runtime break before Phase 3c has repointed reads.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Touched docs stamped to 2026-06-15 where required; `last_agent` updated on SoT/preflight/opening/index/session docs touched this session. |
| Backlinks/index sweep | `docs/knowledge/wiki/index.md` now includes SESSION_0391; no new wiki pages created. |
| Wiki lint | `bun run wiki:lint` PASS: 0 errors, 0 warnings. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | Review log + hostile close review present; residual Phase 3c blocker explicit. |
| Review & Recommend | Next session goal and first task written. |
| Memory sweep | No operator memory update needed beyond SOT-ADR/preflight/session records. |
| Next session unblock check | Blocked only on executing Phase 3c code repoint; first task is concrete and discoverable with Graphify. |
| Git hygiene | Branch `main`; worktree list checked; fallow temp detached worktrees observed outside repo; status reviewed before staging; single push planned, hash reported at bow-out / see git log. |
| Graphify update | Ran `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .`; `graphify stats` after update: 12884 nodes, 24703 edges, 1799 communities, 2071 files tracked. |
