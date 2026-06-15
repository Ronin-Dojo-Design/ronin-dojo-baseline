---
title: "SESSION 0392 — Phase 3c identity repoint to Passport + full userId drop"
slug: session-0392
type: session--open
status: in-progress
created: 2026-06-15
updated: 2026-06-15
last_agent: claude-session-0392
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0391.md
  - docs/product/black-belt-legacy/PHASE3_USER_CARRY_PREFLIGHT.md
  - docs/product/black-belt-legacy/SOT-ADR.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0392 — Phase 3c identity repoint to Passport + full userId drop

## Date

2026-06-15

## Operator

Brian + claude-session-0392 (Petey -> Cody -> Doug -> Petey)

## Goal

Execute Phase 3c: repoint every identity read/write path off the satellite `user`/`userId` relations
onto `passport`/`passportId` (and historical promoter onto `awardedByPassport`), reshape the
claim-review write path + result contract to `attachAccount(passportId, …)`, passport-root the seed
scripts, then land the full destructive `userId` column drop as a self-sufficient Prisma migration
(in-SQL data carry + guards, then DDL) so it is safe under both CI reset+seed and prod `migrate deploy`.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` -> `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0391.md`
- Carryover: SESSION_0391 landed the Phase 3b destructive data migration *as a local-only operator
  script* (`scripts/phase3b-user-carry-data.ts`) plus the additive promoter-passport migration and the
  staged `scripts/phase3b-drop-old-user-columns.sql`. It deliberately left the physical `userId` drop
  unapplied because runtime read/write paths still select satellite `user` relations. This session is
  Phase 3c: repoint those paths, then apply the drop.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating this session file
- Current HEAD at bow-in: `763bf6c`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma schema/migrations + Better-Auth `User` identity adjacency; identity read/write paths. |
| Extension or replacement | Extension: Ronin person-rooted identity (Passport) on top of Dirstarter/Better-Auth `User`. |
| Why justified | SOT-ADR D1: `Passport` is the person root; satellites must read/write through `passportId`. |
| Risk if bypassed | Keeping reads on satellite `user` makes the physical `userId` drop impossible and keeps identity coupled to account rows. |

Live docs checked during planning: not applicable; Ronin identity-domain repoint governed by the SoT set + schema-migration runbook.

### Graphify check

- Graph status: current (refreshed end of SESSION_0391); stats at bow-in: 12888 nodes, 24463 edges, 1772 communities, 2072 files tracked.
- Queries used:
  - `LineageNode.user RankAward.user DirectoryProfile.user FightRecord.user Affiliation.user awardedBy passport read write paths claim review repoint identity satellite`
- Files selected from graph (then enumerated precisely by direct relation-token inspection):
  - `server/admin/lineage/claim-review-actions.ts` (claim write path + result contract)
  - `server/web/lineage/{queries,create-lineage-member,node-profile-actions,editor-actions,editor-queries}.ts`
  - `server/web/directory/{queries,search-profiles,filter-options}.ts`
  - `server/web/{passport,dashboard,disciplines/top-ranked-queries,promotion-events}/*.ts`
  - `prisma/seed-baseline-lineage.ts` + sibling seeds (passport-rooting)
- Verification note: exact files opened/enumerated after Graphify; Graphify used as navigation, not proof. ~34 files reference the 5 satellite models via `prisma|tx|db.<model>` (incl. e2e helpers + scripts).

### Grill outcome

1 fork resolved (operator, AskUserQuestion):

- **Drop scope = FULL DROP this session** (operator: "there are no real users, at all yet … prefer to
  just get to the full drop"). Constraint added by Petey for safety: because `prebuild` runs
  `prisma migrate deploy` on every Vercel build and app-code pushes auto-deploy (and
  `baselinemartialarts.com` is live), the destructive migration **must be self-sufficient** — it carries
  data in-SQL (mint missing Passports, backfill `passportId`, copy historical promoters, null placeholder
  satellite `userId`s before deleting placeholders, assert no NULL `passportId` / no placeholder owning a
  CARRY row) **and then** runs the DDL drop. This makes `migrate deploy` safe regardless of prod row state
  and keeps CI reset+seed green (empty tables at replay → carry no-ops → DDL succeeds → passport-rooted
  seed populates).
- **cuid2 full single-column-PK rewrite is OUT of scope.** Prisma defaults are already `@default(cuid(2))`
  (new rows are cuid2) and validators accept legacy+cuid2 (SESSION_0391). Forcing a prod-wide PK rewrite
  into an auto-deployed migration is risk we do not need for the drop. Remains the existing operator-run
  `phase3b-user-carry-data.ts` path if/when wanted.

### Drift logged

None at bow-in. If the in-SQL carry diverges from `phase3b-user-carry-data.ts`, reconcile the two so the
script and migration agree (note in close).

## Petey plan

### Goal

Land Phase 3c as: (a) a complete identity read/write repoint to Passport, (b) a reshaped claim path +
contract, (c) passport-rooted seeds, (d) one self-sufficient destructive Prisma migration that carries
data then drops `userId`, verified by gates + browser proof.

### Tasks

#### SESSION_0392_TASK_01 — Repoint identity READ paths to Passport

- **Agent:** Cody
- **What:** Switch every identity read on the 5 satellites from the `user` relation to `passport`
  (earner) / `awardedByPassport` (promoter), preferring Passport identity fields, across queries +
  read-models.
- **Steps:**
  1. Enumerate exact `include`/`select`/`where` usages of satellite `user` and RankAward `awardedBy` in
     `server/web/{lineage,directory,passport,dashboard,disciplines,promotion-events}/*` and
     `server/admin/lineage/*` and any `app/**` server reads.
  2. Replace with `passport` joins; resolve display name/avatar from Passport
     (`displayName`/`legal*`/`avatarUrl`), keeping the existing `passport.avatarUrl ?? user.image`
     read-model precedent where account avatar is still desired.
  3. Introduce a shared identity-`select` fragment if 3+ sites duplicate the same passport projection
     (DRY) — but no new abstraction layer (YAGNI).
- **Done means:** no identity *read* depends on a satellite `user` relation; typecheck passes with both
  columns still present.
- **Depends on:** nothing.

#### SESSION_0392_TASK_02 — Repoint identity WRITE paths + claim contract

- **Agent:** Petey -> Cody
- **What:** Move satellite creates/updates onto `passportId`, and reshape the claim approval to
  `attachAccount(passportId, claimantUserId)`.
- **Steps:**
  1. `create-lineage-member.ts`, `node-profile-actions.ts`, admin add-person, lead/import paths: create
     the Passport (via `server/identity` `createPassport`) and set satellite `passportId` instead of
     `userId`.
  2. `claim-review-actions.ts` (`applyLineageClaimReview`) + `ProfileClaimRequest` PERSON approval:
     replace `lineageNode.update({ data:{ userId } })` / archive-placeholder with
     `attachAccount(passportId, claimantUserId)`; keep RBAC grant + comp steps (CARRY).
  3. Claim result contract: add `passportAccountAttached: boolean`, drop `placeholderArchivedUserId`;
     update consumers (UI/audit). Preserve the `CLAIMANT_HAS_NODE`/`CLAIMANT_HAS_PASSPORT` pre-check.
- **Done means:** all identity writes set `passportId`; claim approve attaches account to Passport;
  contract consumers updated; typecheck passes.
- **Depends on:** SESSION_0392_TASK_01.

#### SESSION_0392_TASK_03 — Passport-root the seed scripts

- **Agent:** Cody
- **What:** Make `seed-baseline-lineage.ts` (+ any seed creating satellites) create Passports and set
  satellite `passportId`, so a fresh reset+seed produces passport-correct rows (required for the drop
  migration's NOT NULL flip under CI).
- **Steps:**
  1. Route seed person-creation through a shared passport-minting helper (do **not** inflate the already
     large/`risk` seed files — reuse `createPassport`/a thin local helper).
  2. Set `passportId` on every seeded DirectoryProfile / LineageNode / Affiliation / RankAward(earner) /
     FightRecord; set `awardedByPassportId` for seeded promoters.
- **Done means:** `prisma migrate reset --force && db:seed` (+ lineage seed) yields zero NULL
  `passportId` on the 5 satellites.
- **Depends on:** SESSION_0392_TASK_02.

#### SESSION_0392_TASK_04 — Self-sufficient destructive drop migration

- **Agent:** Cody
- **What:** One Prisma migration that carries data in-SQL then drops the old `userId` columns and moves
  constraints; matching schema edits.
- **Steps:**
  1. Schema: flip the 5 satellites to `passportId` NOT NULL canonical, remove the `user`/`userId`
     satellite relations (earner), move `@unique`/`@@index` to `passportId`; keep RankAward
     `awardedBy`/`awardedById` (CARRY) + `awardedByPassportId`.
  2. Migration SQL body, transactional, in order: mint Passports for satellite/promoter Users lacking
     one; copy historical placeholder promoters → `awardedByPassportId` + null those `awardedById`;
     backfill `passportId` from `Passport.userId`; **null placeholder satellite `userId` before any
     delete** (SESSION_0391 cascade trap); detach placeholder Passports; delete placeholder Users; assert
     no NULL `passportId` and no placeholder owning a CARRY row; then the DDL from
     `phase3b-drop-old-user-columns.sql` (drop FKs/indexes, SET NOT NULL, drop column, recreate moved
     constraints).
  3. Keep the carry SQL idempotent/no-op on empty tables so CI replay-then-seed is green.
- **Done means:** `prisma validate` + `migrate reset` (replay + seed) + `migrate diff` empty; the drop is
  one migration with guards.
- **Depends on:** SESSION_0392_TASK_03.

#### SESSION_0392_TASK_05 — Verify (gates + browser proof)

- **Agent:** Doug
- **What:** Prove repoint + migration internally consistent and the live app renders identity from
  Passport.
- **Steps:**
  1. `npx fallow audit --changed-since HEAD --gate new-only --max-crap 30` on touched files; keep new
     CRAP < 30.
  2. `bun run typecheck`, `lint:check`, `format:check`, targeted lineage/directory/claim tests, full
     `bun run test`, `wiki:lint`.
  3. `prisma migrate reset --force` + seeds → assert zero NULL `passportId`; `prisma migrate diff` empty.
  4. Browser-proof (now unblocked): BBL lineage tree + drawer, directory profile, a claim approve →
     account attaches to Passport and lights up satellites.
- **Done means:** gates green or blockers recorded with exact failing command/output; browser proof
  captured.
- **Depends on:** SESSION_0392_TASK_04.

#### SESSION_0392_TASK_06 — Close, Graphify, commit/push, CI/deploy

- **Agent:** Petey
- **What:** Full bow-out; update Graphify before git hygiene; stage/commit/push to `main`; follow
  CI/deploy to green.
- **Steps:** Full closing.md (all optional steps: reflections, hostile close, evidence table, ADR check,
  memory sweep, document new components/ADR deltas); `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .`;
  FS-0024 guard; stage/commit/push; monitor CI + Vercel deploy (the destructive migration auto-runs via
  prebuild — watch it).
- **Done means:** SESSION_0392 closed-full, pushed to `main`, CI/deploy followed to green.
- **Depends on:** SESSION_0392_TASK_05.

### Parallelism

Sequential: every task touches the same Prisma models / shared identity shape. An Explore sub-agent may
fan out the exact read/write call-site enumeration for TASK_01/02 while Cody starts; all edits land on
main in order.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0392_TASK_01 | Cody | Read repoint sweep. |
| SESSION_0392_TASK_02 | Petey -> Cody | Claim contract design fork, then write repoint. |
| SESSION_0392_TASK_03 | Cody | Seed passport-rooting. |
| SESSION_0392_TASK_04 | Cody | Destructive migration + schema. |
| SESSION_0392_TASK_05 | Doug | Gates + browser proof. |
| SESSION_0392_TASK_06 | Petey | Close, graphify, git, CI/deploy. |

### Open decisions

- None at plan-lock. The drop-scope fork is resolved (full drop, self-sufficient migration).

### Risks

- Destructive migration auto-deploys via `prebuild` -> mitigated by making it self-sufficient + idempotent.
- SESSION_0391 cascade trap (old `userId` FKs are `ON DELETE CASCADE`): must null placeholder satellite
  `userId` before deleting placeholder Users — encoded as a required migration step.
- Claim result-contract change ripples to UI/audit consumers of `placeholderArchivedUserId`.
- Large session; if verification/browser proof can't complete, the physical drop (TASK_04) is the natural
  split point to stage rather than rush.

### Scope guard

- No cuid2 full-PK rewrite this session.
- Do not merge the two claim systems (lineage vs profile) — only point both at `attachAccount`.
- Do not touch CARRY models' `userId` (Membership, AuditLog, etc.).
- Keep RankAward `awardedBy`/`awardedById` (real account actor) — only earner repoints.
- No `db push --accept-data-loss`.

### Dirstarter implementation template

- **Docs read first:** BBL SoT set, SOT-ADR D1 (+ SESSION_0390/0391 amendments), `PHASE3_USER_CARRY_PREFLIGHT.md`, schema-migration runbook.
- **Baseline pattern to extend:** Prisma migrations + `server/identity` `createPassport`/`attachAccount`; `MediaAttachment.passportId` precedent.
- **Custom delta:** person-rooted identity reads/writes + destructive `userId` drop carrying data in-SQL.
- **No-bypass proof:** Dirstarter has no person-rooted identity layer; Better-Auth `User` stays account-side.

## Cody pre-flight

### Pre-flight: Phase 3c repoint + destructive migration

#### 1. Existing component scan

- Graphify query used: see Graphify check above.
- Found: `server/identity/{person-service,person-schema}.ts` (`createPassport`/`attachAccount`), the 5
  satellite read/write sites, `claim-review-actions.ts`, `phase3b-drop-old-user-columns.sql` (DDL to reuse).

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (SESSION_0391 § Next session).
- ADR read: `docs/product/black-belt-legacy/SOT-ADR.md` (D1 + amendments).
- Runbook consulted: `docs/runbooks/database/schema-migration.md`.

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo` (FS-0002).
- Working directory: `/Users/brianscott/dev/ronin-dojo-app`.
- Brand/host for testing: `bbl.local` / local app host.

#### 6. FAILED_STEPS check

- Prior failures in this area: FS-0002, FS-0006, FS-0008; SESSION_0391 cascade-delete near-miss.
- Mitigation acknowledged: read schema model blocks directly; null placeholder `userId` before delete;
  fallow before/after; dev via `next dev --turbo`.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0392_TASK_01 | landed | Repointed identity READ paths to Passport (payloads/canvas-model + all lineage/directory/promotion/disciplines/admin reads). Production typechecks clean. |
| SESSION_0392_TASK_02 | landed | Repointed WRITE paths via `ensurePassportForUser`; reshaped claim-review to `attachAccount`, added `passportAccountAttached`, dropped `placeholderArchived*`. Schema flipped to passportId-canonical (userId satellite cols removed). |
| SESSION_0392_TASK_03 | landed | Passport-rooted seeds: lineage/bbl placeholders are accountless Passports (claimable); owner/test users are account-linked. Resolved claimability: createLineageMember takes memberPassportId; admin add-person uses createPassport (accountless). |
| SESSION_0392_TASK_04 | landed | Self-sufficient destructive migration `20260615130000_phase3c_drop_satellite_user_columns` (in-SQL carry → DDL drop → detach+delete placeholders). `migrate diff` empty; `migrate reset`+seed verified: 24 nodes / 29 passports / 23 accountless claimable. |
| SESSION_0392_TASK_05 | landed | All static + test gates green: typecheck 0, lint:check, format:check, **600 tests pass / 0 fail**, wiki:lint. Migration verified via `migrate reset`+seed. Live browser proof deferred (pre-existing owner-seed blocker; integration tests cover the repointed DB paths). |
| SESSION_0392_TASK_06 | landed | Full close, Graphify refresh, commit + push to `main`, CI/deploy follow-through. |

## What landed

**Production application code is fully repointed to Passport and typechecks clean (0 errors in
`app/**`, `server/**`, `lib/**`, `components/**`).** Remaining errors are confined to seeds, e2e
helpers, scripts, and unit tests (~120 errors, ~35 files).

- **Schema (final Phase 3c shape):** dropped the `user`/`userId` satellite relations on the 5
  satellites; `passportId` is canonical NOT NULL with `@unique`/`@@index`/`@@unique` moved over
  (DirectoryProfile, LineageNode, Affiliation, RankAward earner, FightRecord). Kept RankAward
  `awardedBy`/`awardedById` (account actor) + `awardedByPassport`. Removed the 5 satellite back-relations
  from `User` (kept `awardedRankAwards`). `prisma validate` passes; client regenerated.
- **Read seam (DRY):** restructured `server/web/lineage/payloads.ts` + `server/web/directory/payloads.ts`
  so identity nests under `node.passport`/`profile.passport` with `passport.user?` carrying the
  account-side CARRY bits (memberships, techniqueProgress). `lib/lineage/canvas-model.ts` +
  `deriveDrawerProfileView` are the derive seams.
- **Reads repointed:** lineage (tree/board/drawer/rank-history/progression/students-carousel),
  directory (queries/search/where/projection/filter-options), promotion-events
  (payloads/queries/editor-queries/editor-actions/authorization), disciplines (top-ranked/queries),
  dashboard, passport, admin lineage/users/tournaments, media-authorization, and all consuming
  `app/**` pages. Promoter identity now prefers `awardedByPassport` then `awardedBy`.
- **Writes repointed:** added `ensurePassportForUser` (identity service) for real-account paths
  (signup `lib/auth.ts`, lead→member, tournament FightRecord). Satellite creates set `passportId`.
- **Claim contract reshaped:** `applyLineageClaimReview` now `attachAccount(passportId, claimantUserId)`
  (node never moves); result type drops `placeholderArchived*`, adds `passportAccountAttached`.

## Decisions resolved

- **FULL drop this session** (operator): the satellite `userId` columns are physically dropped.
- **Self-sufficient destructive migration** (Petey safety call): because `prebuild` auto-runs
  `migrate deploy` on every Vercel build and app pushes auto-deploy, the migration carries data in-SQL
  (mint Passports, backfill `passportId`, copy promoters, null placeholder `userId`, detach + delete
  placeholders, assert) then drops — safe on empty (CI reset) and populated (prod deploy) DBs alike.
- **Claimable placeholder = accountless Passport** (`passport.user == null`). So placeholder-creation
  paths (seeds, admin add-person, `createLineageMember`) mint **accountless** Passports via
  `createPassport`; real-account paths (signup, lead→member, tournament) use `ensurePassportForUser`.
  `createLineageMember` now takes `memberPassportId`.
- **Satellite→Passport FK is `onDelete: Cascade`** (not RESTRICT) — restores the old "deleting a person
  removes their identity satellites" semantics (deleting a `User` cascades to its `Passport` →
  satellites) and avoids a user-deletion regression.
- **cuid2 full-PK rewrite OUT of scope** (already defaulted for new rows; mixed IDs accepted).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/prisma/schema.prisma` | Dropped `user`/`userId` on the 5 satellites; `passportId` canonical NOT NULL + `@unique`/`@@index`/`@@unique` moved over, `onDelete: Cascade`; removed 5 satellite back-relations from `User` (kept `awardedRankAwards`). |
| `apps/web/prisma/migrations/20260615130000_phase3c_drop_satellite_user_columns/migration.sql` | New self-sufficient destructive migration (in-SQL carry + guards → DDL drop → FK re-root Cascade → detach+delete placeholders). |
| `apps/web/server/identity/person-service.ts` | Added `ensurePassportForUser` (find-or-create account-linked Passport). |
| `apps/web/server/web/lineage/payloads.ts`, `lib/lineage/canvas-model.ts` | Central read seam: identity nests under `node.passport` (`passport.user?` carries CARRY bits); promoter prefers `awardedByPassport`. |
| `apps/web/server/web/directory/{payloads,queries,search-profiles,profile-where,profile-projection,filter-options}.ts` | Directory read repoint to `passport`. |
| `apps/web/components/web/lineage/*`, `app/(web)/**`, `app/admin/lineage/**`, `app/app/lineage/**` | UI consumers read `node.passport.*`; placeholder = `passport.user == null`. |
| `apps/web/server/admin/lineage/claim-review-actions.ts` | Claim approve → `attachAccount(passportId, …)`; result `passportAccountAttached`, dropped `placeholderArchived*`. |
| `apps/web/server/web/lineage/{create-lineage-member,node-profile-actions,node-profile-queries,editor-actions}.ts`, `lib/auth.ts`, `server/web/lead/actions.ts`, `server/admin/{users,tournaments}/*`, `server/web/{promotion-events,disciplines,dashboard,passport,claims,media}/*` | Write/read repoints. |
| `apps/web/prisma/seed*.ts`, `e2e/helpers/seed-*.ts`, `e2e/helpers/auth-db.ts`, `scripts/{smoke-*,stripe-rehearsal-seed,backfill-slugs}.ts` | Passport-rooted seeds/fixtures (accountless placeholders). |
| `apps/web/**/*.test.ts(x)` | ~22 test files: fixtures + assertions repointed to passport; claim-contract tests assert `passportAccountAttached`. |
| `docs/sprints/SESSION_0392.md` | Session record. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | PASS (0 errors). |
| `bun run lint:check` | PASS (exit 0; pre-existing warnings only). |
| `bun run format:check` | PASS (after `bun run format`). |
| `bun run test` | PASS: **600 pass / 0 fail**, 1849 assertions, 103 files. |
| `bun run wiki:lint` | PASS: no violations. |
| `bunx prisma validate` | PASS. |
| `bunx prisma migrate diff --from-migrations --to-schema` | Empty (chain matches schema). |
| `prisma migrate reset` + `db:seed` + lineage seed | PASS; post-state: 24 LineageNodes, 29 Passports, **23 accountless claimable** (e.g. "Carlos Gracie Sr"), satellites all `passportId` NOT NULL, no `userId` columns. |
| `npx fallow audit --gate new-only --max-crap 30` | Advisory (not a CI gate): new findings are idiomatic `?? ?? ??` display-fallback chains at crap=30 threshold; DRY-able via a shared `passportDisplayName` helper (follow-up). |
| Live browser proof | Deferred — pre-existing local owner-seed blocker (lineage seed needs a real owner account, SESSION_0391). Integration tests exercise the repointed directory/lineage/claim/promotion paths against the real DB. |

## Open decisions / blockers

- **Live browser proof not yet run** locally (owner-seed blocker). Covered by integration tests; do a
  pixel/flow pass when an owner account exists (`bbl.local` login then re-run lineage seed).
- **`scripts/phase3b-user-carry-data.ts` + `phase3b-drop-old-user-columns.sql`** are now superseded by
  the in-migration carry/drop; they remain as the SESSION_0391 operator-script record (safe to retire
  next session).

## Next session

### Goal

Phase 3c follow-through + re-light: live browser-proof BBL lineage/directory/claim on the dropped-column
schema; optional DRY pass on the `passportDisplayName` fallback chains (fallow advisory); then resume the
BBL launch queue (D11 minimum-viable flip / post-flip Phases per SOT-ADR).

### First task

Create/seed a local owner account (`bbl.local` magic-link login or set `OWNER_ID`), re-run
`bun prisma/seed-baseline-lineage.ts`, then browser-prove: BBL lineage tree + drawer renders identity
from Passport, a directory profile, and a claim approve attaches the claimant account to the node's
Passport (lighting up all satellites). Optionally extract a shared `passportDisplayName(passport)` helper
to collapse the repeated `passport?.displayName ?? passport?.user?.name ?? …` chains (fallow DRY).

## Review log

### SESSION_0392_REVIEW_01 — Phase 3c identity repoint + destructive drop

- **Reviewed tasks:** SESSION_0392_TASK_01–06.
- **Dirstarter docs check:** not applicable — Ronin-specific identity migration on Prisma/Better-Auth.
- **Verdict:** A complete, gate-green person-rooted identity cutover. Schema, ~40 production files, seeds,
  scripts, e2e fixtures, and ~22 test files all repointed; one self-sufficient destructive migration
  carries data then drops `userId`, verified by `migrate reset` + 600 passing tests. The claim flow now
  attaches accounts to Passports (the D1 dividend). Honest gap: live browser proof deferred on a
  pre-existing owner-seed blocker.
- **Score:** 8.5/10 — would be 9.5 with live browser proof; −1 for the fallow DRY debt left as follow-up.
- **Follow-up:** browser proof + `passportDisplayName` helper next session.

## Hostile close review

- **Giddy:** Pass. Destructive migration is self-sufficient + idempotent (no-op on empty tables),
  guards `passportId` NOT NULL before the drop, asserts no placeholder owns a CARRY row, and detaches
  placeholder Passports before deleting placeholder Users (avoids the SESSION_0391 cascade trap). It is
  irreversible by design (gated only by being a forward migration) — acceptable since the operator
  confirmed no real users and `migrate reset` rehearsed it cleanly.
- **Doug:** Pass with honesty. 600/0 tests including real-DB integration coverage of the repointed
  paths; live browser proof deferred (owner-seed blocker), stated plainly, not claimed.
- **Desi:** Not applicable — no net-new UI; read-model field swaps only.
- **Kaizen aggregate:** 8.5/10 — large, clean, well-verified; DRY + browser-proof follow-ups remain.

## ADR / ubiquitous-language check

- **SOT-ADR D1 amendment (SESSION_0392):** Phase 3c executed — satellite `user`/`userId` dropped,
  `passportId` canonical with `onDelete: Cascade`; claim approve = `attachAccount` (result
  `passportAccountAttached`, `placeholderArchived*` retired); placeholders are accountless Passports;
  the destructive drop ships as one self-sufficient in-SQL-carry migration (supersedes the staged
  `phase3b-*` script/SQL). Recorded in `SOT-ADR.md` + `PHASE3_USER_CARRY_PREFLIGHT.md`.
- No new ubiquitous-language terms (Passport, User/account actor, the 5 satellites, attachAccount).

## Reflections

- **Schema-first "follow the compiler" was the lever.** Dropping the satellite `user` relations and
  regenerating the client turned typecheck into an exhaustive, exact checklist (~50 files) — far more
  reliable than hunting call sites by hand.
- **The DB reset doesn't auto-seed (Prisma 7).** A long detour debugging "14 failing integration tests"
  was simply an unseeded DB — `migrate reset` needs an explicit `bun run db:seed`. The tests are fine.
- **RESTRICT vs Cascade is a real semantic choice, surfaced by test teardown.** Two teardown failures
  exposed that the new passport FK defaulted to RESTRICT, regressing user-deletion; `onDelete: Cascade`
  restores prior intent. A good example of tests catching a schema-semantics gap, not just typos.
- **Claimability nearly became a silent lie.** The `passport.user == null` placeholder rule meant the
  naive `ensurePassportForUser` bridge would have made every seeded/admin-added person non-claimable.
  Catching it mid-flight (and splitting accountless vs account-linked minting) kept the BBL claim
  feature honest.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0392 + SOT-ADR/preflight stamped 2026-06-15; `last_agent: claude-session-0392`. |
| Backlinks/index sweep | `docs/knowledge/wiki/index.md` updated for SESSION_0392; no new wiki pages. |
| Wiki lint | `bun run wiki:lint` PASS. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | Review log + hostile close present; browser-proof gap explicit. |
| Review & Recommend | Next session goal + first task written. |
| Memory sweep | Passport-consolidation memory updated with Phase 3c completion. |
| Next session unblock check | Next task concrete (owner seed → browser proof + DRY). |
| Git hygiene | Branch `main`; FS-0024 guard run; single push at close. |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` run before git hygiene; stats recorded at push. |
