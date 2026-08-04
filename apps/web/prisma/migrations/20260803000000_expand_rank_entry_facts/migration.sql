-- SESSION_0740 (#380 PR1): additive EXPAND + idempotent BACKFILL — fold RankAward belt facts into
-- RankEntry and add satellite carry-anchors, backfilled through the rankAwardId anchor.
--
-- REVERSIBLE: no DROP, no writer/reader cutover. Writers keep writing RankAward; the #376 sync seam
-- is unchanged; these columns are backfill-only until the PR2 cutover. Hand-authored +
-- shadow-replayed (`migrate dev` is BANNED on the shared DB). Prod (Neon) applies via the prebuild
-- `migrate deploy` hook on merge. Plan: docs/product/black-belt-legacy/380-rankaward-drop-plan.md §4-PR1.
--
-- SESSION_0740 AMENDMENT to plan §4-A3 (operator-ratified): the promoter FKs (awardedById,
-- awardedByPassportId) use ON DELETE SET NULL, NOT NO ACTION — mirroring RankAward's existing
-- behavior so the claim-finalize identity-merge delete (server/admin/lineage/claim-finalize.ts:613)
-- keeps working in the PR1→PR2 window (RankEntry promoter repoint is PR2 work; PR2's B1 re-run
-- re-backfills any window-nulled row). Inverse/rollback SQL is in the PR body.

-- A1 — enum ------------------------------------------------------------------------------------
CREATE TYPE "RankEntrySource" AS ENUM ('STATED', 'EARNED');

-- A2 — fact columns (source defaults STATED; B1 overwrites from the anchor award) --------------
ALTER TABLE "RankEntry"
    ADD COLUMN "awardedAt" TIMESTAMP(3),
    ADD COLUMN "awardedById" TEXT,
    ADD COLUMN "awardedByPassportId" TEXT,
    ADD COLUMN "organizationId" TEXT,
    ADD COLUMN "promotionEventId" TEXT,
    ADD COLUMN "notes" TEXT,
    ADD COLUMN "location" TEXT,
    ADD COLUMN "source" "RankEntrySource" NOT NULL DEFAULT 'STATED';

-- A3 — fact FKs (promoter FKs = SET NULL per the §4-A3 amendment; school/ceremony = SET NULL) ---
ALTER TABLE "RankEntry" ADD CONSTRAINT "RankEntry_awardedById_fkey"
    FOREIGN KEY ("awardedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RankEntry" ADD CONSTRAINT "RankEntry_awardedByPassportId_fkey"
    FOREIGN KEY ("awardedByPassportId") REFERENCES "Passport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RankEntry" ADD CONSTRAINT "RankEntry_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RankEntry" ADD CONSTRAINT "RankEntry_promotionEventId_fkey"
    FOREIGN KEY ("promotionEventId") REFERENCES "PromotionEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- A4 — satellite carry columns -----------------------------------------------------------------
-- RankMilestone: UNIQUE + Cascade (mirrors its rankAward anchor). LineageRelationship: UNIQUE +
-- SetNull + composite [type, rankEntryId]. MediaAttachment: plain index + SetNull. The OLD
-- rankAwardId columns/indexes stay (dual-home) and drop in PR3. GamificationEvent gets NO
-- replacement column (dead FK; drops in PR3 after preflight P5).
ALTER TABLE "RankMilestone" ADD COLUMN "rankEntryId" TEXT;
CREATE UNIQUE INDEX "RankMilestone_rankEntryId_key" ON "RankMilestone"("rankEntryId");
ALTER TABLE "RankMilestone" ADD CONSTRAINT "RankMilestone_rankEntryId_fkey"
    FOREIGN KEY ("rankEntryId") REFERENCES "RankEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LineageRelationship" ADD COLUMN "rankEntryId" TEXT;
CREATE UNIQUE INDEX "LineageRelationship_rankEntryId_key" ON "LineageRelationship"("rankEntryId");
CREATE INDEX "LineageRelationship_type_rankEntryId_idx" ON "LineageRelationship"("type", "rankEntryId");
ALTER TABLE "LineageRelationship" ADD CONSTRAINT "LineageRelationship_rankEntryId_fkey"
    FOREIGN KEY ("rankEntryId") REFERENCES "RankEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MediaAttachment" ADD COLUMN "rankEntryId" TEXT;
CREATE INDEX "MediaAttachment_rankEntryId_idx" ON "MediaAttachment"("rankEntryId");
ALTER TABLE "MediaAttachment" ADD CONSTRAINT "MediaAttachment_rankEntryId_fkey"
    FOREIGN KEY ("rankEntryId") REFERENCES "RankEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- B0 — catch-up entry backfill (idempotent; re-run in PR2) --------------------------------------
-- The `re_` id prefix is LOAD-BEARING: prod's pre-existing backfilled entries use `rank-entry-<id>`,
-- so the PR1 rollback's `DELETE WHERE id LIKE 're\_%'` never touches them. Fail-closed: the residual
-- conflict set (§6 V1b — awards with no entry AND a colliding (passportId, rankId) entry) must be 0.
INSERT INTO "RankEntry" (id, "passportId", "rankId", status, provenance, "rankAwardId", "createdAt", "updatedAt")
SELECT concat('re_', a.id), a."passportId", a."rankId",
       CASE a."verificationStatus"
           WHEN 'VERIFIED' THEN 'VERIFIED'::"RankEntryStatus"
           WHEN 'DISPUTED' THEN 'DISPUTED'::"RankEntryStatus"
           WHEN 'IMPORTED' THEN 'VERIFIED'::"RankEntryStatus" -- IMPORTED presents VERIFIED (ratified)
           ELSE 'UNVERIFIED'::"RankEntryStatus"
       END,
       CASE WHEN a."verificationStatus" = 'IMPORTED'
            THEN 'IMPORTED'::"RankEntryProvenance" ELSE 'EARNED'::"RankEntryProvenance" END,
       a.id, now(), now()
FROM "RankAward" a
WHERE NOT EXISTS (SELECT 1 FROM "RankEntry" e WHERE e."rankAwardId" = a.id)
  AND NOT EXISTS (SELECT 1 FROM "RankEntry" e2
                  WHERE e2."passportId" = a."passportId" AND e2."rankId" = a."rankId");

-- B1 — fact backfill (idempotent) onto every anchored entry (pre-existing + B0-inserted) --------
UPDATE "RankEntry" e SET
    "awardedAt" = a."awardedAt",
    "awardedById" = a."awardedById",
    "awardedByPassportId" = a."awardedByPassportId",
    "organizationId" = a."organizationId",
    "promotionEventId" = a."promotionEventId",
    "notes" = a.notes,
    "location" = a.location,
    "source" = a.source::text::"RankEntrySource"
FROM "RankAward" a WHERE a.id = e."rankAwardId";

-- B2 — satellite backfill (idempotent) via the anchor ------------------------------------------
UPDATE "RankMilestone" s SET "rankEntryId" = e.id
    FROM "RankEntry" e WHERE e."rankAwardId" = s."rankAwardId" AND s."rankEntryId" IS NULL;
UPDATE "LineageRelationship" s SET "rankEntryId" = e.id
    FROM "RankEntry" e WHERE e."rankAwardId" = s."rankAwardId" AND s."rankEntryId" IS NULL;
UPDATE "MediaAttachment" s SET "rankEntryId" = e.id
    FROM "RankEntry" e WHERE e."rankAwardId" = s."rankAwardId" AND s."rankEntryId" IS NULL;

-- A5 — indexes (after backfill; plain CREATE INDEX — CONCURRENTLY unavailable in a migration txn,
-- O(100) rows per preflight P1) ----------------------------------------------------------------
CREATE INDEX "RankEntry_passportId_awardedAt_idx" ON "RankEntry"("passportId", "awardedAt");
CREATE INDEX "RankEntry_awardedById_idx" ON "RankEntry"("awardedById");
CREATE INDEX "RankEntry_awardedByPassportId_idx" ON "RankEntry"("awardedByPassportId");
CREATE INDEX "RankEntry_organizationId_idx" ON "RankEntry"("organizationId");
CREATE INDEX "RankEntry_promotionEventId_idx" ON "RankEntry"("promotionEventId");
