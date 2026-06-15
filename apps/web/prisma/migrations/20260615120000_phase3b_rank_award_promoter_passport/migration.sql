-- Phase 3b support: preserve historical rank promoter identity after placeholder User reap.
--
-- `RankAward.awardedById` remains the nullable account actor/authority FK. Historical imported
-- promoters that are currently synthetic placeholder Users are copied to `awardedByPassportId` by
-- the Phase 3b data script, then `awardedById` is nulled before placeholder Users are hard-deleted.

ALTER TABLE "RankAward" ADD COLUMN "awardedByPassportId" TEXT;

CREATE INDEX "RankAward_awardedByPassportId_idx" ON "RankAward"("awardedByPassportId");

ALTER TABLE "RankAward"
  ADD CONSTRAINT "RankAward_awardedByPassportId_fkey"
  FOREIGN KEY ("awardedByPassportId") REFERENCES "Passport"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
