---
title: "#380 ratified migration plan — retire the physical RankAward table"
slug: 380-rankaward-drop-plan
type: plan
status: ratified
created: 2026-08-03
updated: 2026-08-03
last_agent: claude-fable-session-0739
pairs_with:

  - docs/adr/0058-rankentry-is-rank-truth.md
  - docs/sprints/SESSION_0739.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# #380 ratified migration plan — retire the physical RankAward table

**Issue:** [#380 G-011 table-drop sequencing](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/380) ·
**Session:** SESSION_0739 (plan-only) · **Execution:** separate attended lane(s), operator-gated at
every irreversible step.

**Pinned forks (operator, 2026-08-03):** Fork A `source` = **Evidence** (resolved below: keep) ·
Fork B immutability = **Trigger** · Fork C = **Direct cutover** (no dual-write window) ·
Fork D = **3-PR staging**.

**RATIFIED by the operator 2026-08-03 (SESSION_0739),** after the Giddy PASS-WITH-FIXES review
(all 12 findings folded in). Execution: attended lanes per §8; every merge and the PR3 drop wait
for the operator's explicit word.

**Laws preserved (ADR 0035/0058):** display = highest AWARDED entry by `sortOrder`
(`memberTopRank`), `awardedAt DESC NULLS LAST` tiebreak; never scope by `rank.brand`; `status` =
mutable presentation trust; `provenance` = immutable origin, private, never an edit lock; IMPORTED
lock stays LIFTED (imported facts remain member-editable; promoter-transition awards keep IMPORTED
on the fact axis while presentation status is VERIFIED).

## 0. Preconditions, evidence base + the stale-prodsnap caveat

**Both issue blockers are resolved:** #398 (preview-DB isolation) CLOSED 2026-08-03; #377 (CI
guard failing new RankAward reads — the very read-guard §4 hardens) CLOSED earlier. #380 is
executable.

Local `ronindojo_prodsnap` (read-only queries, SESSION_0739): 36 RankAward / 14 RankEntry rows;
22 awards (created 2026-07-30 → 07-31, pre-#397-merge) have no RankEntry; RankMilestone = 4 rows,
all anchored to entry-less awards; LineageRelationship / MediaAttachment / GamificationEvent have
0 rows with `rankAwardId`; 0 duplicate `(passportId, rankId)` groups in either table; 34/36 awards
have NULL `awardedAt`.

**The snapshot is stale/partial:** the `20260730000000_add_rank_entry_provenance` migration header
records prod's backfill target as **111 RankEntries (72 IMPORTED / 39 EARNED) on 2026-07-30** —
an order of magnitude above the snapshot. Therefore:

- Every count in this plan is **directional**; the binding numbers are produced by the §6
  validation queries **against live prod at each PR's foreground preflight**.
- **Pre-execution action:** refresh `ronindojo_prodsnap`, then shadow-replay every hand-authored
  migration below against the refreshed snapshot before any prod merge.
- The catch-up backfill (§4 PR1-B0) is mandatory and idempotent precisely because awards without
  entries demonstrably occur — the inventory explains the mechanism: every RUNTIME writer syncs
  through `syncRankEntryFromAward`, but the five seed/import script writers (§7b) do not; the
  snapshot's 22 entry-less awards carry 7/30–31 import-run timestamps.

## 1. Final RankEntry columns (end-state)

| Column | Type | From | Notes |
| --- | --- | --- | --- |
| `id` | String cuid(2) PK | existing | |
| `passportId` | String, FK Passport, **Cascade** | existing | earner identity root (SOT-ADR D1) |
| `rankId` | String, FK Rank, **Restrict** | existing | |
| `status` | `RankEntryStatus` | existing | mutable presentation trust |
| `provenance` | `RankEntryProvenance` | existing | immutable origin — DB trigger §3 |
| `awardedAt` | DateTime? | RankAward.awardedAt | fact; NULLS LAST in display tiebreak |
| `awardedById` | String?, FK User "AwardedBy" | RankAward | promoter acting account |
| `awardedByPassportId` | String?, FK Passport "PromotedByPassport" | RankAward | historical promoter identity |
| `organizationId` | String?, FK Organization, **SetNull** | RankAward | awarding school |
| `promotionEventId` | String?, FK PromotionEvent, **SetNull** | RankAward | ceremony grouping |
| `notes` | String? | RankAward | |
| `location` | String? | RankAward | free-text fallback school |
| `source` | `RankEntrySource` | RankAward.source | **Fork A — kept; see §2** |
| `createdAt` / `updatedAt` | DateTime | existing | |

**Dropped, not carried:**

- `rankAwardId` anchor (PR3) — its 1:1 purpose ends with the table. **PR2 first relaxes it**
  (today it is NOT NULL + Cascade, schema.prisma:2313–2314): `DROP NOT NULL` + FK
  Cascade→**SetNull**, schema `RankAward?`/`String?`. Without this, every post-cutover
  first-time belt fails INSERT at the DB, and deleting a frozen award could cascade-kill a
  live entry.
- `verificationStatus` — folded (ratified): VERIFIED/UNVERIFIED/DISPUTED live in `status`;
  IMPORTED lives in `provenance`. §6 V5 asserts zero information loss before the drop.
- `mediaUrls` (deprecated Json) — snapshot shows 0 populated rows; **preflight query P4 must
  confirm 0 on live prod**; any populated row routes to RankMilestone/MediaAttachment enrichment
  before PR3, or the loss is explicitly operator-ratified.

**Uniques/indexes (end-state):** keep `@@unique([passportId, rankId])`, `@@index([passportId, status])`,
`@@index([rankId])`; add `@@index([passportId, awardedAt])`, `@@index([awardedById])`,
`@@index([awardedByPassportId])`, `@@index([organizationId])`, `@@index([promotionEventId])`.

## 2. Fork A resolution — `source` survives as `RankEntrySource` (RESOLVED: keep)

- **Code axis (decisive):** `isFactEditable` at `server/belt/belt-gate.ts:88` gates member fact
  editing on `award.source === "STATED" || award.verificationStatus === "UNVERIFIED"` — a real
  production reader that `provenance` cannot replace (post-import self-reports are
  source STATED + provenance EARNED). `gateAwardSelect` (`server/belt/queries.ts:26`) carries
  `source` into every belt card via `memberFactEditability`. Seven mint sites write it.
- **Data axis (snapshot, directional):** joined rows show `STATED + EARNED` (14) — the
  non-derivable combination dominates. Award-level: STATED 31 / EARNED 5. P3 records the live
  numbers for the ledger, but the code reader alone settles the fork.
- **Mechanics:** new enum `RankEntrySource` (STATED | EARNED), text-cast backfill (§4 B1);
  `RankAwardSource` + `RankAwardVerificationStatus` drop in PR3 cleanup.

## 3. Provenance immutability — trigger DDL (Fork B)

Ships as the **first migration of PR2** (after PR1's backfill is verified; before writer cutover):

```sql
CREATE OR REPLACE FUNCTION rank_entry_provenance_immutable() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."provenance" IS DISTINCT FROM OLD."provenance" THEN
    RAISE EXCEPTION 'RankEntry.provenance is immutable (entry %, % -> %)',
      OLD.id, OLD."provenance", NEW."provenance";
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS rank_entry_provenance_guard ON "RankEntry";
CREATE TRIGGER rank_entry_provenance_guard
  BEFORE UPDATE ON "RankEntry"
  FOR EACH ROW EXECUTE FUNCTION rank_entry_provenance_immutable();
```

Rationale: REVOKE is toothless (the app role owns the table on Neon); app-only guards fail the
issue's DB-level requirement. Rollback: `DROP TRIGGER` + `DROP FUNCTION` (provided in PR2's
down-script). The one-time PR1 backfill runs **before** the trigger exists, so no exception is
ever needed.

## 4. Migration sequence — 3 PRs (Fork D), direct cutover (Fork C)

Every migration is **hand-authored + shadow-replayed** (`ronindojo_shadow`); `migrate dev` stays
banned. Prod applies via the prebuild `migrate deploy` hook on merge (auto-deploy fires on code
merges — each PR merge IS its deploy; the operator attends each one).

### PR1 — additive expand + backfill (reversible)

Migration `expand_rank_entry_facts`, in order:

1. **A1 — enum:** `CREATE TYPE "RankEntrySource" AS ENUM ('STATED','EARNED');`
2. **A2 — columns:** `ALTER TABLE "RankEntry" ADD COLUMN "awardedAt" timestamp(3), ADD COLUMN
   "awardedById" text, ADD COLUMN "awardedByPassportId" text, ADD COLUMN "organizationId" text,
   ADD COLUMN "promotionEventId" text, ADD COLUMN "notes" text, ADD COLUMN "location" text,
   ADD COLUMN "source" "RankEntrySource" NOT NULL DEFAULT 'STATED';`
3. **A3 — FKs (plain `ADD CONSTRAINT`; NOT VALID→VALIDATE inside one Prisma migration is a
   single transaction anyway, and P1's O(100) row counts make lock ceremony pointless):**
   User("AwardedBy") no-action, Passport("PromotedByPassport") no-action, Organization
   **SET NULL**, PromotionEvent **SET NULL**.
4. **A4 — satellite columns (3, not 4):** `ALTER TABLE "RankMilestone" ADD COLUMN "rankEntryId" text;`
   (+ UNIQUE index, FK Cascade) · `LineageRelationship` (UNIQUE, FK **SetNull**, plus the
   composite `@@index([type, rankEntryId])` replacing today's `[type, rankAwardId]`) ·
   `MediaAttachment` (plain index, FK **SetNull** — matching today's optional-relation
   contract). **`GamificationEvent` gets NO replacement column** — the inventory
   found zero app-code reads or writes of its `rankAwardId`/relation (schema-only, dead FK); its
   column drops outright in PR3 after preflight P5 confirms live rows are 0 (non-zero →
   operator-ratified loss; the PR3 archive covers it either way).
5. **B0 — catch-up entry backfill (idempotent, re-run in PR2):**

   ```sql
   INSERT INTO "RankEntry" (id, "passportId", "rankId", status, provenance, "rankAwardId", "createdAt", "updatedAt")
   SELECT concat('re_', a.id), a."passportId", a."rankId",
          CASE a."verificationStatus"
            WHEN 'VERIFIED'  THEN 'VERIFIED'::"RankEntryStatus"
            WHEN 'DISPUTED'  THEN 'DISPUTED'::"RankEntryStatus"
            WHEN 'IMPORTED'  THEN 'VERIFIED'::"RankEntryStatus"   -- IMPORTED presents VERIFIED (ratified)
            ELSE 'UNVERIFIED'::"RankEntryStatus"
          END,
          CASE WHEN a."verificationStatus" = 'IMPORTED'
               THEN 'IMPORTED'::"RankEntryProvenance" ELSE 'EARNED'::"RankEntryProvenance" END,
          a.id, now(), now()
   FROM "RankAward" a
   WHERE NOT EXISTS (SELECT 1 FROM "RankEntry" e WHERE e."rankAwardId" = a.id)
     AND NOT EXISTS (SELECT 1 FROM "RankEntry" e2
                     WHERE e2."passportId" = a."passportId" AND e2."rankId" = a."rankId");
   ```

   **Fail-closed conflict rule (never silently orphan):** the residual set — awards with no entry
   AND a colliding `(passportId, rankId)` entry anchored to a *different* award — must be **0**
   (§6 V1b). Non-zero aborts the lane; rows are listed and resolved by hand with the operator.

   **The `re_` id prefix is deliberate and load-bearing:** prod's 111 pre-existing backfilled
   entries use `'rank-entry-' || id` (migration `20260709000000_add_rank_entry_compatibility_anchor:36`).
   B0's distinct prefix is exactly what makes the PR1 rollback's
   `DELETE WHERE id LIKE 're\_%'` safe against them — do NOT "fix" the prefix for consistency.
6. **B1 — fact backfill (idempotent):**

   ```sql
   UPDATE "RankEntry" e SET
     "awardedAt" = a."awardedAt", "awardedById" = a."awardedById",
     "awardedByPassportId" = a."awardedByPassportId", "organizationId" = a."organizationId",
     "promotionEventId" = a."promotionEventId", "notes" = a.notes, "location" = a.location,
     "source" = a.source::text::"RankEntrySource"
   FROM "RankAward" a WHERE a.id = e."rankAwardId";
   ```
7. **B2 — satellite backfill (idempotent), via the anchor:** for each of the three carried
   tables, `UPDATE s SET "rankEntryId" = e.id FROM "RankEntry" e WHERE e."rankAwardId" =
   s."rankAwardId" AND s."rankEntryId" IS NULL` (RankMilestone/LineageRelationship/MediaAttachment).
8. **A5 — indexes** (per §1 end-state list; `CREATE INDEX CONCURRENTLY` not available inside a
   Prisma migration transaction — plain CREATE INDEX is acceptable at this table's row count;
   confirm at preflight P1 that live counts are still O(100)).

Code changes in PR1: **schema.prisma only** (new columns/relations marked
`/// @deprecated-transitional` where needed) — **no writer or reader changes**. Writers keep
writing RankAward; the existing #376 seam keeps behaving exactly as today.

**Rollback PR1:** inverse SQL provided in the PR body — drop the added FKs, indexes,
columns, and enum; delete only the B0-inserted entries (`WHERE id LIKE 're\_%'`). Two riders:
(a) under prebuild `migrate deploy` + PR-only main, a rollback cannot auto-run — it is itself a
**forward-inverse migration merged through a new PR** on the same gate ladder (true for every
stage of this plan); (b) deleting B0 entries cascades any `RankEntryReview` rows created against
them in the window (Cascade FK) — count reviews on `re_%` entries first; non-zero is an operator
call, never silent. No existing data path is touched; reversible at any time before PR2.

### PR2 — writer cutover + guards (reversible with reverse-sync)

1. **Migration `cutover_rank_entry`:** in order — (i) **relax the anchor** (the §1 blocker
   fix): `ALTER TABLE "RankEntry" ALTER COLUMN "rankAwardId" DROP NOT NULL` + recreate the FK
   as **SetNull** (schema: `rankAward RankAward?` / `rankAwardId String?` — without this every
   post-cutover first-time belt fails INSERT); (ii) re-run B0/B1/B2 verbatim (closes the
   PR1→PR2 window for awards minted in between); (iii) install the §3 trigger.
   **Post-swap catch-up (major-3 fix):** `migrate deploy` runs at prebuild while the OLD
   deployment keeps serving through the build — and the old sync writes status/provenance only,
   no fact columns. So immediately after the deployment swap (before user traffic edits
   entries), run one idempotent B0+B1 re-run as a foreground script, then assert V2. This is a
   scripted, attended step in the §8 gate table, not optional.
2. **Code cutover (the whole point of #380):** every writer from the §7 inventory moves to
   RankEntry-native create/update. The structural gift: **all 7 runtime flows already funnel
   their canonical write through ONE seam** — `syncRankEntryFromAward`
   (`server/belt/rank-entry-compatibility.ts:37`) — so the cutover inverts that seam (RankEntry
   becomes the direct write target; the award leg is deleted) rather than rewriting 7 flows
   ad-hoc. Flow-by-flow targets in §7a. Rules preserved: one row per `(passportId, rankId)` —
   a re-award **updates** facts on the existing row (upsert semantics); `provenance` is set only
   on INSERT; presentation of IMPORTED stays VERIFIED; instructor-stamped (`awardedById`)
   fill-once rules unchanged (`updateMany` re-asserting per-fact emptiness carries over).
   `deleteRankAward` semantics flip: today it deletes the award and Cascade takes the entry;
   post-cutover it deletes the RankEntry directly (satellites: milestone Cascade,
   relationship SetNull — same net contract) **and, in the same transaction, deletes the
   anchored frozen award when `rankAwardId` is set** (major-2 fix; write-guard-exempted with a
   named allow). Otherwise every post-cutover belt deletion strands an orphan award, V1 blocks
   PR3 spuriously, and an emergency reverse-sync would resurrect deleted belts.
3. **The five no-sync writers get ported or retired** (§7b — the highest-risk cutover gaps:
   they write RankAward with NO entry today): `prisma/seed.ts`, `prisma/seed-baseline-owner.ts`,
   `prisma/seed-baseline-lineage.ts` → ported to RankEntry-native;
   `scripts/import-bbl-members-full.ts`, `scripts/enrich-bbl-members-pods.ts` → ported (re-runs
   must stay possible); one-shot `session-05xx` scripts → **retired/annotated as historical**,
   never ported (the inlined sync copy in `session-0522-belt-backfill.ts` drifts otherwise).
   `savePromotionEvent` (`editor-actions.ts:272,281`) — today it skips the sync (harmless:
   `promotionEventId` has no entry home yet); post-cutover it writes `RankEntry.promotionEventId`
   directly.
4. **Fact reads** move to the new RankEntry columns — incl. the shared display law
   (`rank-entry-display-order.ts:12` orders by `rankAward.awardedAt` today → orders by the
   entry's own `awardedAt`; one file, every surface inherits) and the ~19 production
   `prisma.rankAward.find*` sites + every `entry.rankAward.*` relation hop (§7c). DTO/type
   renames per §7d; naming trap: `server/belt/schemas.ts:109` exposes a DTO field *named*
   `verificationStatus` that already carries `RankEntry.status` — rename deliberately, not
   mechanically. The read-guard is **hardened to reject ALL RankAward access** (reads AND
   writes) — it becomes the PR3-readiness tripwire.
5. **No RankAward writes remain.** RankAward becomes frozen dead storage awaiting PR3.

**Rollback PR2 (emergency only, before PR3; lands as a forward-inverse PR per the PR1 rider):**
revert the code merge (writers return to RankAward), drop the trigger, and run the provided
**reverse-sync** with three clauses: (1) fact deltas — entries touched after cutover copy back
onto their anchored awards (`UPDATE "RankAward" a SET ... FROM "RankEntry" e WHERE
e."rankAwardId" = a.id AND e."updatedAt" > '<cutover-ts>'`); (2) new first-time belts (no anchor
award) — reverse-sync mints compat awards (`INSERT ... SELECT` provided in the PR body);
(3) **deletions** — belts deleted post-cutover (entry + anchored award both gone, per the
delete-flip above) are replayed from the cutover-window deletion log the PR2 code writes to
`AuditLog` — never resurrected implicitly.

### PR3 — destructive contract (POINT OF NO RETURN)

Merges only after the **PR3 gate set** passes against live prod **and** the operator says the
word — never same-day-reflexively after PR2. The PR3 gate is **V4 + V6 + V8 + V9 + P5 re-run +
the deletion-log reconciliation** (V1 checked against the deletion log, not raw 0). V2/V7 are
**PR2-swap-window assertions only** — after cutover, legitimate entry edits and new belts
diverge from the frozen awards *by design*, so re-asserting raw fact/display parity at PR3 time
is unsatisfiable and proves nothing.

0. **Archive first:** `pg_dump --table='"RankAward"'` + CSV of the four satellites'
   `(id, "rankAwardId")` pairs → dated file, stored per the runbook's backup location, named in
   the SESSION file. This is the only rollback after this PR.
1. `ALTER TABLE "RankMilestone" ALTER COLUMN "rankEntryId" SET NOT NULL;` (V4 proved 0 nulls).
2. Drop the four satellite `rankAwardId` FKs + columns + their old indexes
   (`@@index([type, rankAwardId])` → already replaced by `[type, rankEntryId]` in PR1).
3. `ALTER TABLE "RankEntry" DROP COLUMN "rankAwardId";` (drops the 1:1 anchor + its unique).
4. `DROP TABLE "RankAward";`
5. `DROP TYPE "RankAwardVerificationStatus"; DROP TYPE "RankAwardSource";`
6. schema.prisma: RankAward model deleted; RankEntry JETTY annotation documents the fold
   (`@changed SESSION_NNNN (#380) — RankAward folded in and dropped; facts live here; see ADR 0058`);
   ADR 0058 gets a one-line "landed" amendment.

**JETTY annotation ladder (issue requirement, all three stages):** PR1 — each new RankEntry fact
column gets `/// @added (#380 PR1) — fact folded from RankAward; transitional dual-home until
PR2 cutover`, and the three satellite `rankEntryId` columns get the mirror note. PR2 — the
RankAward model header gains `// @changed (#380 PR2) — FROZEN dead storage; all writes and fact
reads are RankEntry-native; dropped in PR3`. PR3 — the RankEntry note above.

**Rollback PR3:** restore from the step-0 archive only. That is the definition of the
point-of-no-return; it is why PR3 is its own attended merge.

## 5. LineageRelationship semantics after `rankAwardId → rankEntryId`

- **Repeated promotion:** RankEntry is one-row-per-`(passportId, rankId)`; a re-award updates the
  row in place, so a relationship pinned to an entry survives re-awards without re-pointing —
  strictly better than the award-churn behavior. No uniqueness change: `@@unique([rankEntryId])`
  mirrors today's `@@unique([rankAwardId])` (one relationship per promotion fact).
- **SetNull preserved:** deleting a RankEntry nulls the pointer and never cascades the
  relationship row away — identical to today's contract. Entry deletion is rarer than award
  deletion (entries persist across re-awards), shrinking the orphan-pointer surface.

## 6. Validation queries (run at PR-boundaries against live prod; all must return the stated value)

| ID | Assertion | Query sketch | Expect |
| --- | --- | --- | --- |
| V1 | every award has an entry | `SELECT count(*) FROM "RankAward" a LEFT JOIN "RankEntry" e ON e."rankAwardId"=a.id WHERE e.id IS NULL` | 0 |
| V1b | fail-closed conflict set | B0 residual set (awards blocked by a colliding entry) | 0 |
| V2 | fact parity per column — **PR2 swap window only** | `SELECT count(*) FROM "RankEntry" e JOIN "RankAward" a ON a.id=e."rankAwardId" WHERE (e."awardedAt" IS DISTINCT FROM a."awardedAt") OR … each fact column` | 0 |
| V3 | satellite parity ×3 (Milestone/Relationship/Media) | per table: `count(*) WHERE "rankAwardId" IS NOT NULL AND ("rankEntryId" IS NULL OR mismatch via anchor)` | 0 |
| V4 | RankMilestone NOT NULL readiness | `count(*) WHERE "rankEntryId" IS NULL` | 0 |
| V5 | status/provenance fold lossless | cross-tab `a."verificationStatus" × e.status × e.provenance` — only ratified combos (VERIFIED→VERIFIED/EARNED · UNVERIFIED→UNVERIFIED/EARNED · DISPUTED→DISPUTED/EARNED · IMPORTED→VERIFIED/IMPORTED) | 0 off-diagonal |
| V6 | cardinality | dup `(passportId,rankId)` groups in RankEntry | 0 |
| V7 | display-law parity — **PR2 swap window only** | per-passport `memberTopRank` computed awards-path vs entries-path (sortOrder DESC, awardedAt DESC NULLS LAST) | 0 diffs |
| V8 | writer smoke (PR2 post-deploy) | belt-verification flow on a test account: RankEntry row mutated, **zero** RankAward writes (audit query on `updatedAt`/count deltas) | pass |
| V9 | no RankAward code refs (PR3 gate) | hardened read-guard green + `grep -r rankAward apps/web` **on PR3's branch tree** with the expected-hits allowlist (`prisma/schema.prisma` until PR3's own change, `.generated/`, `prisma/migrations/`, historical `scripts/session-05xx`) | 0 hits outside allowlist |

Preflight-only queries: **P1** live row counts (sizes the index strategy) · **P3** live
`source × provenance` combos (Fork A record) · **P4** `mediaUrls` populated rows (must be 0 or
routed) · **P5** `GamificationEvent."rankAwardId" IS NOT NULL` count (0 expected; non-zero =
operator-ratified loss, archive covers it) · DB-identity `SELECT current_database()` before
every statement batch (#398 recipe).

## 7. Writer-cutover inventory (TASK_01, SESSION_0739 Explore sweep)

No `// rank-read-guard: allow` escapes exist anywhere in `apps/web` (verified by sweep).

### 7a. The 7 runtime write flows (all funnel through `syncRankEntryFromAward` — `rank-entry-compatibility.ts:37`)

| Flow | Entry point(s) | Award writes today |
| --- | --- | --- |
| Belt router — self-backfill mint + fact edits + delete | `upsertBeltMilestone` `server/belt/router.ts:137→161` · `updateRankAwardFact` `:379` (SELF_BACKFILL `:466`, fill-once `updateMany` `:485`) · `updateRankAwardFactAsAdmin` `:518→569` · `overrideRankAwardPromoterAsAdmin` `:599` · `deleteRankAward` `:702→729` | upsert STATED/UNVERIFIED; fact updates; delete (Cascade takes entry+milestone) |
| Promoter-proposal spine | `applyMemberPromoterTransition` `promoter-proposal-core.ts:348→454` · `approveCapturedPromoterReview` `:517→540` · `overrideCapturedPromoterReview` `:620→676` · sibling facts `:333` | promoter/notes/verificationStatus writes; defensive heal-sync `:374` |
| Verify seam | `verifyRankEntry` → `verifyRankEntryInTransaction` `verify-rank-entry-core.ts:28→47` | promotes non-IMPORTED award to VERIFIED |
| Claims finalize (passport + rank-promotion) | `finalizePassportClaim` / `finalizeRankPromotion` → `mintAssertedRankAward` `admin/lineage/claim-finalize.ts:222/242/251` (+ milestone evidence `:193/:730`) | mint STATED/VERIFIED + `awardedById`; upgrade-not-double-mint |
| Place-lead (unauth-reachable via Join-the-Legacy auto-place) | `placeLeadIntoLineage` → `ensureDeclaredRankAward` `place-lead-core.ts:73→95` | mint STATED/UNVERIFIED, BJJ-gated |
| Add-person (admin) | `createPerson` `orpc/routers/users.ts:181→205` | mint STATED/UNVERIFIED on accountless Passport |
| Non-minting mutators | `applyLineageNodeProfileUpdate` `node-profile-actions.ts:154` (awardedAt) · `savePromotionEvent` `promotion-events/editor-actions.ts:272,281` (**no sync today**) · identity merge repoint/restore `repoint-promoter-identity.ts:285/356` | targeted fact updates |

### 7b. No-sync writers (write RankAward with NO RankEntry — the silent-zero-rows risk post-cutover)

`prisma/seed.ts:1625,1729` · `prisma/seed-baseline-owner.ts:264,285` (probe at `:260` still
filters the long-dropped `userId` column — latent bug) · `prisma/seed-baseline-lineage.ts`
(8 write sites) · `scripts/import-bbl-members-full.ts:543` · `scripts/enrich-bbl-members-pods.ts:658,665`.
One-shots `scripts/session-0522/0523/0524-*.ts` are historical (0522 carries an inlined,
drift-prone copy of the sync) — retire/annotate, never port.

### 7c. Read-side cutover surface

- **The display law lives in ONE file:** `server/belt/rank-entry-display-order.ts:12` —
  `orderBy: rank.sortOrder desc, rankAward.awardedAt desc NULLS LAST` → becomes the entry's own
  `awardedAt`. Directory, disciplines, lineage, belt-tab, claims all import it.
- ~19 production `prisma.rankAward.find*` sites: `server/belt/queries.ts:163` (`getMemberAwards`
  ceiling source) · `router.ts:78,385,429,523,553,603` · `promoter-proposal-core.ts:69,641` ·
  `rank-entry-compatibility.ts:24` · `verify-rank-entry-core.ts:38` ·
  `repoint-promoter-identity.ts:129` · promotion-events `editor-queries.ts:293` / `queries.ts:168`
  / `editor-actions.ts:176` · `lineage/editor-actions.ts:437` · mint idempotency probes
  `claim-finalize.ts:230`, `place-lead-core.ts:89` · marquee `bbl-promotion-marquee-data.ts:110`.
- Relation hops `entry.rankAward.*` (fact joins that collapse to entry columns): belt-tab loader
  `:128`, lineage payloads `:163/:331`, node-profile queries `:133`, public passport `:64`,
  celebration cards `:173`, admin lineage queries `:171/:174`, rank-review queries `:93/:128`,
  media authorization `:178/:191`, promotion-event brand filters (`rankAwards: some/none`),
  client components (rank-history tab, drawer info/header, promoter-change modal, tree board
  model `currentRankAwardId`, galaxy timeline, rank-progression, to-lineage-visual).

### 7d. Type/DTO rename surface (PR2)

`gateAwardSelect` + `MemberAward` (`server/belt/queries.ts:24/72` — the master fact select) ·
`GateAward` / `FactEditabilityAward` / `MemberFactEditabilityAward` (`belt-gate.ts`) · belt zod
schemas (`schemas.ts:48-163`: `updateRankAwardFactInput`, `beltCardOutput.rankAwardId`, …) ·
`factEditSelect` / `FactUpdate*` / `factSnapshot` (`router.ts:195-226`) ·
`deriveRankEntryTrustAxesFromAwardStatus` / `rankEntryStatusForAward`
(`rank-entry-trust-axes.ts` — collapses to a status-only fold once verificationStatus dies) ·
`RankEntryCompatibilityDb` / `VerifyRankEntryTx` picks · `member-ranks.ts:37-76` `rankAwardId`
exposure · lineage/passport/promotion-event payload types · promoter-edge zod
(`editor-schemas.ts:25`) + `CreateLineageMemberInput.rankAwardId` + client mirrors
(`promoter-change-modal.tsx:39`, `lineage-tree-board-model.ts:106`, event editor form `:45`) ·
admin media `attachableEntityType` `"rankAward"` literal (`admin/media/actions.ts:20,177-180` —
the dynamic `${entityType}Id` FK path) · **naming trap:** `schemas.ts:109` field named
`verificationStatus` already carries `RankEntry.status`.

### 7e. Satellite verdicts

| Satellite | Code usage | Plan |
| --- | --- | --- |
| RankMilestone (`rankAwardId` @unique, Cascade) | live writes `router.ts:179`, `claim-finalize.ts:193`; reads in media gate + belt cards | carry → `rankEntryId` NOT NULL at PR3 |
| LineageRelationship (`rankAwardId?` @unique, SetNull) | live writes `create-lineage-member.ts:193`, `editor-actions.ts:500`; picker in promoter-change modal | carry → `rankEntryId`, §5 semantics |
| MediaAttachment (`rankAwardId?`) | only the admin `attachMedia` dynamic-FK path (`admin/media/actions.ts:177-180`); web pipeline already on `rankMilestoneId` | carry the column; retire `"rankAward"` from `attachableEntityType` at PR2 |
| GamificationEvent (`rankAwardId?`) | **zero** app-code usage (schema-only) | no replacement column; drop at PR3 (P5 guard) |

Test/fixture writers (E2E seed helpers, integration fixtures, `fixture-ownership.ts` teardown
order) are enumerated in the SESSION_0739 Explore transcript and get ported mechanically inside
PR2 — they follow the production seam, never lead it.

## 8. Execution lanes + operator gates

| Stage | Lane type | Operator gate |
| --- | --- | --- |
| prodsnap refresh + shadow-replay all 3 migrations | attended prep | word to refresh |
| PR1 expand+backfill | attended; foreground preflight (P1/P3/P4) + post-merge V1–V6 | word to merge |
| PR2 cutover+trigger | attended; **post-swap B0+B1 catch-up script**, then V1–V8; reverse-sync script staged | word to merge |
| PR3 destructive | attended; archive dump taken; **PR3 gate set** (V4+V6+V8+V9+P5+deletion-log reconciliation) same-hour | **explicit word, separate day acceptable** |

No stage merges on the same word as the previous one. Prod auto-deploys on each merge (known:
deploy fires seconds after merge) — the attended window covers merge → deploy → proof.
