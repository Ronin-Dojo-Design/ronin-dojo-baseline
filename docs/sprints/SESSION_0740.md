---
title: "SESSION 0740 — #380 PR1: RankAward-drop expand+backfill (attended execution lane)"
slug: session-0740
type: session--open
status: closed
created: 2026-08-03
updated: 2026-08-03
last_agent: claude-opus-session-0740
sprint: S13
lane: bbl
lane_seq:
recipe: seq-lane-build
vault_session:
goal_ids: [G-011]
tickets: ["380"]
next_session:
pairs_with:

  - docs/sprints/SESSION_0739.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0740 — #380 PR1: RankAward-drop expand+backfill (attended execution lane)

**Date:** TBD · **Operator:** Brian + <agent>-session-0740

## Goal

Execute STAGE 1 of the ratified #380 plan
([`380-rankaward-drop-plan.md`](../product/black-belt-legacy/380-rankaward-drop-plan.md) §4-PR1):
the additive expand + idempotent backfill migration — reversible, no destructive step, no writer
cutover. Done = PR1 merged, V1–V6 green against live prod, numbers recorded here.

## Goal verdict

**YES — goal met.** PR1 (`20260803000000_expand_rank_entry_facts`) merged (#418, `1cb8c254`) and
applied to prod Neon; post-merge V1=0 / V6=0 / B1 fact-mismatch=0 vs live prod; numbers recorded.
Additive + reversible; no writer/reader cutover (that's PR2). One operator-ratified plan amendment
(§4-A3 promoter FKs NO ACTION → SET NULL). #380 (G-011) advances to PR2 — the epic is NOT complete.

## Status

Frontmatter `status:` is the single source of truth (`in-progress` → `closed`, SESSION_0342). Do not restate it here.

## Bow-in

<!-- ADR 0049 staged stub — the adopting session flips status to in-progress and fills from here.
The full kickoff prompt lives in SESSION_0739 ## Next session (PROMPT_TEMPLATE-filled). -->

- Previous session: `docs/sprints/SESSION_0739.md` (closed, **EXTENDED**) — ratified the #380 plan
  (`380-rankaward-drop-plan.md`, status: ratified) + landed the no-sync writer sync-wire sweep
  (PR #411) + spun out next-session-automation research. Goal met; this session executes PR1.
- FS-0024 guard: `pwd`=`/Users/brianscott/dev/black-belt-legacy`, `origin`=`Ronin-Dojo-Design/black-belt-legacy`,
  tree clean, `main` level with `origin/main` (0/0). Canonical claim **free** (SessionStart hook) —
  working on canonical, no worktree; PR1 lands via a feature branch → PR-only main (ADR 0056).
- Branch: `session-0740-380-pr1-expand` (created at TASK_03) · HEAD @ `ec2eb62e`
- Parallel-lane assessment (opening.md 1d): a **disjoint** BBL session runs the
  next-session-automation `/ppp` + wayfinder research lane (research docs + automation tickets) —
  no file overlap with this schema/migration lane. No active merge owner (0641 closed); this lane
  never merges — HOLD migration + every push for the operator's word.
- FS-0048 read-before-build sweep (cited): SESSION_0740 stub (this file) ·
  `380-rankaward-drop-plan.md` (§0 preconditions/stale-prodsnap caveat, §1 end-state columns,
  §4 PR1 A1–A5/B0–B2 migration sequence + rollback, §6 V1–V6 + P1/P3/P4/P5 preflight queries,
  §8 gate table) · ADR 0035/0058 display law (inherited, not re-opened).

## Petey plan

### Tasks

#### SESSION_0740_TASK_01 — prodsnap refresh + shadow-replay

- **Agent:** Petey + Doug · **Depends on:** PR #411 merged
- **What / steps:** refresh `ronindojo_prodsnap`; shadow-replay the hand-authored PR1 migration on
  the refreshed snapshot + `ronindojo_shadow`. Override BOTH `DATABASE_URL` and `DIRECT_URL` for
  any non-default target (SESSION_0739 near-miss). **Giddy F2 (pre-merge abort):** run **V1 + V1b**
  at THIS shadow-replay step (not post-merge) — a non-zero B0 residual-conflict set (§6 V1b) aborts
  the lane BEFORE any prod merge. Then re-run the 36 affected tests against the migrated snapshot →
  expect green (proves the test failures were unapplied-migration drift).
- **Done means:** replay clean on both; V1=0, V1b=0; B0 row count recorded; affected tests green.

#### SESSION_0740_TASK_02 — prod preflight P1/P3/P4/P5 (read-only)

- **Agent:** Petey (operator readout) · **Depends on:** TASK_01
- **What / steps:** `SELECT current_database()` first; run P1/P3/P4/P5 from plan §6 against live
  prod, read-only.
- **Done means:** numbers in this file; P4/P5 = 0 or operator-ratified.

#### SESSION_0740_TASK_03 — author + land PR1

- **Agent:** Cody (inline) → Giddy (SQL vs plan §4-PR1) → Doug (post-merge V1–V6) · **Depends on:** TASK_02
- **What / steps:** hand-author `expand_rank_entry_facts` (A1–A5, B0–B2) + schema.prisma additive
  block + PR1 JETTY annotations; inverse SQL in the PR body; gates; HOLD for the word; post-merge
  V1–V6 vs prod.
- **Done means:** PR1 merged on the operator's word; V1–V6 at expected values, recorded.

### Parallelism

Sequential single lane — a migration lane never fans out.

### Open decisions / risks

- P4 (`mediaUrls` populated rows) and P5 (GamificationEvent FK rows) non-zero → operator call.
- Prodsnap staleness caveat (plan §0) — all binding numbers come from live prod.

### Scope guard

PR1 ONLY: no writer/reader code changes (PR2), no destructive step (PR3), no fork re-opens.
Frozen: all app code; findings route to the plan's PR2/PR3 sections or ledger rows.

## Cody pre-flight

Arch-gate against plan §4-PR1: additive-only, reversible, no writer/reader cutover. Reuse-first —
extends the existing RankEntry aggregate + its compatibility anchor (no new model). Migration is
hand-authored + shadow-replayed (`migrate dev` banned, CLAUDE.md + plan §4). Scope guard held:
diff = `schema.prisma` + one migration dir + this session doc only (no app code).

## Delivered

| ID | Status | What landed |
| --- | --- | --- |
| SESSION_0740_TASK_01 | ✅ done | prodsnap refreshed from prod Neon (direct endpoint; 836K dump; insurance backup `/tmp/prodsnap-backup-1785809170.dump`). Migration applied to the refreshed snapshot via `migrate deploy` — **executed clean on representative prod data**. Drift check (applied DB vs schema): **my objects show ZERO drift**; only 2 PRE-EXISTING unrelated drifts surfaced (`playing_with_neon` Neon artifact + `Passport.memberPreferences` untracked prod column). |
| SESSION_0740_TASK_02 | ✅ done | Read-only preflight on fresh prod: P1 counts (RankAward 112 · RankEntry 112 · RankMilestone 3 · LineageRelationship 104/0-with-award · MediaAttachment 53/0-with-award · GamificationEvent 0). **V1=0 · V1b=0 · P4=0 · P5=0.** P3: all 112 STATED (10 UNVERIFIED/30 VERIFIED/72 IMPORTED). |
| SESSION_0740_TASK_03 | ✅ **MERGED** | **[PR #418](https://github.com/Ronin-Dojo-Design/black-belt-legacy/pull/418)** squash-merged to `main` (`1cb8c254`) on operator's explicit "go ahead and merge" (override of the baton's "never merge" — operator is the authority). Branch deleted. Prod auto-deploy fired; prebuild `migrate deploy` **applied to prod Neon (t=20s)**; post-merge V1=0/V6=0/B1-fact-mismatch=0 vs live `neondb`. ✅ complete. |

**Decisions resolved:**

- **Plan §4-A3 amendment (operator-ratified, SESSION_0740):** `RankEntry.awardedById` +
  `awardedByPassportId` FKs = **`ON DELETE SET NULL`**, not `NO ACTION`. Rationale: mirrors
  RankAward's existing behavior so the claim-finalize identity-merge delete
  (`server/admin/lineage/claim-finalize.ts:613`, repoints RankAward only) keeps working in the
  PR1→PR2 window; PR2's B1 re-run re-backfills any window-nulled row. Zero behavioral divergence
  from today. → routes to a drift/plan-amendment finding at bow-out (finding router).

## Verification

| Command / smoke | Result |
| --- | --- |
| `prisma validate` | ✅ schema valid |
| `prisma format` | ✅ normalized |
| `prisma generate` (client 7.8.0) | ✅ |
| `bunx tsc --noEmit` | ✅ clean (additive schema breaks no existing code) |
| `bun run lint` | ✅ only pre-existing warnings (no changed-file hits) |
| `bun run test --parallel=1` (pre-migration) | ⚠️ 1818 pass / 36 fail — ALL unapplied-migration drift (34× P2022 on the 3 new cols; 2× P2002 downstream fixture teardown). Re-verified post-migration ↓ |
| `migrate deploy` on refreshed prodsnap | ✅ applied clean (SQL executes on representative prod data) |
| Drift check (`migrate diff` applied-DB vs schema) | ✅ zero drift for #380 objects (2 pre-existing unrelated drifts noted, routed) |
| V1 (award→entry) / V6 (dup passportId,rankId) | ✅ 0 / 0 |
| B0 inserted (`re_` entries) | 0 (awards already 1:1 — expected) |
| B1 fact-parity mismatch (entry vs anchor, 8 cols) | ✅ 0 (all 112 exact) |
| B2 satellite backfill | ✅ RankMilestone 3 · Lineage 0 · Media 0 |
| V5 status×provenance fold | ✅ only ratified combos (10 UNVERIFIED/EARNED · 72 VERIFIED/IMPORTED · 30 VERIFIED/EARNED) |
| `bun run test` (post-migration) | ✅ **1972 pass / 0 fail** — all 36 cleared; classification confirmed (100% unapplied-migration drift) |
| **Post-merge V1–V6 vs LIVE PROD** (`neondb`) | ✅ migration applied (t=20s) · 112 awards↔112 entries · **V1=0 · V6=0 · B1 fact-mismatch=0** · B0 re_=0 · B2 milestone=3 — exact match to prodsnap dry-run |
| `next build` (operator-side gate) | ✅ compiled in 64s · 156/156 static pages · no errors |
| PR #418 CI | ✅ **ALL GREEN** — `CI complete` · `Playwright complete` (chromium/firefox/webkit) · typecheck/scripts · Oxc · unit tests · RankAward read-guard · Vercel. webkit failed first run (infra cancel/timeout, ~39-min runner stall — NOT code); **passed clean on re-run (24m)**. PR `mergeable=MERGEABLE`, state `CLEAN`. |

## Artifacts

| Artifact | Purpose | Status |
| --- | --- | --- |
| Giddy hostile review (PR1 diff) | drift/minimality/backfill/rollback audit | ✅ verdict: minimal, correct, drift-free; 2 folds + 1 scope nit (all folded) |

### Giddy review outcome (folded)

- **Drift check: CLEAN** — schema.prisma ↔ migration.sql are exact mirrors (every column type,
  FK onDelete/onUpdate, index/unique name). `migrate diff` will report zero drift.
- **F1 (rollback ordering) — FOLDED:** the PR1 rollback MUST drop the satellite `rankEntryId`
  FKs/columns BEFORE deleting B0 (`re_`) entries, else `RankMilestone.rankEntryId` (Cascade)
  cascade-deletes real milestone rows. Cascade rider extended to name RankMilestone. Corrected
  inverse SQL staged below for the PR body.
- **F2 (V1/V1b pre-merge) — FOLDED** into TASK_01 (abort at shadow-replay, not post-merge).
- **F3 (scope nit) — FOLDED:** reverted incidental `prisma format` whitespace on 2 unrelated
  models (`CspViolationReport`, `SocialQueueItem`); diff now scoped to RankEntry + satellites only.
- **Confirms (no action):** keep all 5 RankEntry indexes in PR1 (atomic end-state set); B1 source
  cast NULL-safe; B0 cannot double-insert (RankAward is itself `@@unique([passportId,rankId])`);
  A3→B1 ordering safe; `re_` prefix disjoint from prod's `rank-entry-<id>`; SET-NULL amendment
  introduces no new problem.

### PR1 rollback (staged for the PR body — forward-inverse PR, order is load-bearing)

```sql
-- 1. Satellite carry FKs/indexes/columns FIRST (un-links milestones before the re_ delete)
ALTER TABLE "MediaAttachment" DROP CONSTRAINT "MediaAttachment_rankEntryId_fkey";
DROP INDEX "MediaAttachment_rankEntryId_idx";
ALTER TABLE "MediaAttachment" DROP COLUMN "rankEntryId";
ALTER TABLE "LineageRelationship" DROP CONSTRAINT "LineageRelationship_rankEntryId_fkey";
DROP INDEX "LineageRelationship_type_rankEntryId_idx";
DROP INDEX "LineageRelationship_rankEntryId_key";
ALTER TABLE "LineageRelationship" DROP COLUMN "rankEntryId";
ALTER TABLE "RankMilestone" DROP CONSTRAINT "RankMilestone_rankEntryId_fkey";
DROP INDEX "RankMilestone_rankEntryId_key";
ALTER TABLE "RankMilestone" DROP COLUMN "rankEntryId";
-- 2. RankEntry fact FKs + indexes
ALTER TABLE "RankEntry" DROP CONSTRAINT "RankEntry_awardedById_fkey";
ALTER TABLE "RankEntry" DROP CONSTRAINT "RankEntry_awardedByPassportId_fkey";
ALTER TABLE "RankEntry" DROP CONSTRAINT "RankEntry_organizationId_fkey";
ALTER TABLE "RankEntry" DROP CONSTRAINT "RankEntry_promotionEventId_fkey";
DROP INDEX "RankEntry_passportId_awardedAt_idx";
DROP INDEX "RankEntry_awardedById_idx";
DROP INDEX "RankEntry_awardedByPassportId_idx";
DROP INDEX "RankEntry_organizationId_idx";
DROP INDEX "RankEntry_promotionEventId_idx";
-- 3. Delete ONLY B0-inserted entries. RIDER: also cascades RankEntryReview (Cascade) on re_% —
--    count `SELECT count(*) FROM "RankEntryReview" WHERE "rankEntryId" LIKE 're\_%'` first; non-zero = operator call.
DELETE FROM "RankEntry" WHERE id LIKE 're\_%';
-- 4. Fact columns + enum
ALTER TABLE "RankEntry"
  DROP COLUMN "awardedAt", DROP COLUMN "awardedById", DROP COLUMN "awardedByPassportId",
  DROP COLUMN "organizationId", DROP COLUMN "promotionEventId", DROP COLUMN "notes",
  DROP COLUMN "location", DROP COLUMN "source";
DROP TYPE "RankEntrySource";
```

## Open decisions / blockers

- **CLOSED** — PR1 merged + prod-verified. Nothing held.
- **Operator step (post-merge, #398 parity):** reset the `preview` Neon branch from production (needs
  `PREVIEW_DIRECT_URL`, which the agent doesn't hold). Low urgency — no preview needs the new columns
  until PR2.
- **Finding ROUTED → drift-register [D-064]:** `Passport.memberPreferences` untracked prod↔schema
  drift (+ stray `playing_with_neon`). Close before #380 PR3 (destructive). Was NOT PR1 scope.

## Next session

**Numbering (FS-0050, verified on disk 2026-08-03):** SESSION_0741 = closed · SESSION_0742 = staged
(parallel automation lane — "Automation epic B1", self-contained kickoff embedded, Opus 5 fast pinned;
do NOT touch). Next free number = **0743**.

- **Goal:** Operator-elected — **SESSION_0743 = a PM_Planning_Session recipe-card session** to enable
  autonomous sessions (Codex or Claude; e.g. a Claude-orchestrated Codex-CLI-handoff fanout recipe
  card runs *after* the planning). This lane's own continuation — **#380 PR2** (writer/reader cutover
  + provenance immutability trigger §3 + anchor relax: `RankEntry.rankAwardId` DROP NOT NULL +
  Cascade→SetNull) — is **DEFERRED, not dropped**; resume it from `380-rankaward-drop-plan.md` §4-PR2
  when the operator re-elects it.
- **First task:** stage the 0743 PM_Planning stub (recipe card), or run the already-staged automation
  slice directly — see kickoff.
- **Kickoff prompt:** For the immediate runnable automation slice, **paste the self-contained kickoff
  embedded in `docs/sprints/SESSION_0742.md` § "Kickoff prompt (D4)"** — automation slice B1,
  **Opus 5 (fast) pinned; override to Fable at paste** if desired. For the PM_Planning framing (0743),
  Petey-plan the autonomous-fanout enablement first, then hand to the Codex/Claude fanout recipe card.

## Close evidence

**/ggr composite:** **9.4 / 10 — CLEARS (≥9.0)** · **Caps applied:** none. (QAR close review = the
in-session Giddy hostile review, which /ggr wraps — "one review not two". Not re-run as a second
multi-agent pass because the lane is merged + prod-verified. Basis: minimal additive diff, correct +
idempotent backfill, drift-free vs prod, full gate green incl. prod V1–V6.)
**Systemic health:** CI = GREEN (webkit infra-flake re-run passed) · findings routed (drift-register,
plan amendment, memory) · FS patterns exercised: FS-0024 guard held · FS-0048 read-before-build cited ·
**PL-010 recurred** (`| tail` masked the test/build exit code — caught by re-running with full capture).
**Reviewer verdicts:** Giddy = **PASS** (minimal · correct · drift-free; 3 findings folded) · Doug =
inline+prod (V1–V6 green vs live prod) · Desi = n/a (no UI surface).
**Findings ≥ medium:** (1) `Passport.memberPreferences` untracked prod↔schema drift → drift-register
+ candidate D-ticket. (2) Plan §4-A3 promoter-FK amendment (NO ACTION → SET NULL) → ratified, recorded.
**ADR / ubiquitous-language check:** ADR 0035/0058 display law preserved (status mutable / provenance
immutable; never scope by rank.brand). New ubiquitous term: `RankEntrySource {STATED,EARNED}` (Fork A
"source kept"). No ADR change in PR1; ADR 0058 "landed" amendment happens at PR3.

| Step | Proof |
| --- | --- |
| JETTY/frontmatter + backlinks sweep | PASS — `/// @added (#380 PR1)` on every new column; frontmatter `status: closed` |
| Wiki lint | 0 err / 115 warn (pre-existing) — gate runner |
| Reflections routing receipt | findings → drift-register + memory ([[prisma-db-migrations]], [[vercel-neon-topology-and-db-separation]]) |
| Code-quality gate (Class-A) | /ggr 9.4 — Class A |
| Runtime verification (Doug) + artifact URL | prod V1=0/V6=0/B1=0 vs `neondb`; no artifact (no State-of-Dojo publish elected) |
| Deferral guard (§6.8) | #380 PR2 deferred + fully recorded in `## Next session` (resume path cited) |
| Memory sweep · next-session unblock | memory updated (below); 0743 baton filled |
| Git hygiene · Graphify update | #418 merged+branch deleted; graphify nodes=15359 edges=33652 (gate runner) |

## Reflections

- **Migration test-gate ordering:** regenerating the Prisma client from the new schema WITHOUT applying
  the migration to the test DB produces P2022 `column does not exist` failures that masquerade as
  regressions. All 36 were drift; classification (grep the exact missing columns) proved it, and the
  post-migration re-run went 1972/0. Lesson: for a migration PR, the local test gate is only meaningful
  AFTER the migration is applied to the test DB — sequence apply-then-test, and never report "36 fail"
  without classifying against the schema delta first.
- **Hostile-reviewing a ratified plan pays off:** plan §4-A3's `NO ACTION` promoter FKs would have
  blocked the claim-finalize identity-merge delete during the PR1→PR2 window (B1 backfills the column
  the app doesn't yet know to clear). Attended lanes SURFACE such gaps for the operator rather than
  implementing verbatim — SET NULL mirrored existing behavior and self-heals at PR2. A ratified plan is
  a strong prior, not an infallible one.
- **#398 preview isolation is manual by design:** the `prebuild-migrate` guard SKIPs migrations on every
  Preview build; the `preview` Neon branch is applied by hand and reset-from-production after merge. So
  "runs through preview first" is a deliberate step, not automatic — and a schema-only PR whose code
  doesn't yet read the new columns (PR1) doesn't need it. Corrected the operator's reasonable assumption
  with the actual mechanism instead of hand-waving.
- **PL-010 recurred twice** (`| tail` masked the test AND build exit codes). The habit of piping to tail
  for a quick look silently swallows non-zero. Re-ran with full capture both times. Worth a permanent
  reflex: for gate commands, capture full output to a file, then inspect — never trust a tail'd exit.
- **Giddy's rollback-ordering catch (F1)** was the highest-value review finding: the forward migration
  was flawless, but a naive rollback would `DELETE` B0 `re_` entries before dropping the satellite FKs,
  cascade-killing real RankMilestone rows. Rollback correctness is a distinct axis from forward
  correctness — review both.
