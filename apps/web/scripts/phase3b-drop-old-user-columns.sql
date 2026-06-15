-- Phase 3b step 6: drop old identity-satellite userId columns and move constraints to passportId.
--
-- Run only after:
--   1. `PHASE3B_ALLOW_DESTRUCTIVE=1 bun run scripts/phase3b-user-carry-data.ts`
--   2. `bun run scripts/phase3-preflight-assert.ts` PASSes
--   3. Phase 3c read/write code is repointed away from the old `user`/`userId` satellite relations
--
-- This is intentionally not a Prisma migration yet. Applying it before Phase 3c would break current
-- app code that still selects `LineageNode.user`, `DirectoryProfile.user`, and `User.rankAwards`.

BEGIN;

DO $$
DECLARE
  missing_count bigint;
BEGIN
  SELECT COUNT(*) INTO missing_count FROM "DirectoryProfile" WHERE "passportId" IS NULL;
  IF missing_count > 0 THEN RAISE EXCEPTION 'DirectoryProfile.passportId has % NULL rows', missing_count; END IF;

  SELECT COUNT(*) INTO missing_count FROM "LineageNode" WHERE "passportId" IS NULL;
  IF missing_count > 0 THEN RAISE EXCEPTION 'LineageNode.passportId has % NULL rows', missing_count; END IF;

  SELECT COUNT(*) INTO missing_count FROM "Affiliation" WHERE "passportId" IS NULL;
  IF missing_count > 0 THEN RAISE EXCEPTION 'Affiliation.passportId has % NULL rows', missing_count; END IF;

  SELECT COUNT(*) INTO missing_count FROM "RankAward" WHERE "passportId" IS NULL;
  IF missing_count > 0 THEN RAISE EXCEPTION 'RankAward.passportId has % NULL rows', missing_count; END IF;

  SELECT COUNT(*) INTO missing_count FROM "FightRecord" WHERE "passportId" IS NULL;
  IF missing_count > 0 THEN RAISE EXCEPTION 'FightRecord.passportId has % NULL rows', missing_count; END IF;
END $$;

-- DirectoryProfile: one profile per Passport.
ALTER TABLE "DirectoryProfile" DROP CONSTRAINT IF EXISTS "DirectoryProfile_userId_fkey";
DROP INDEX IF EXISTS "DirectoryProfile_userId_key";
ALTER TABLE "DirectoryProfile" ALTER COLUMN "passportId" SET NOT NULL;
ALTER TABLE "DirectoryProfile" DROP COLUMN IF EXISTS "userId";

-- LineageNode: one lineage node per Passport.
ALTER TABLE "LineageNode" DROP CONSTRAINT IF EXISTS "LineageNode_userId_fkey";
DROP INDEX IF EXISTS "LineageNode_userId_key";
ALTER TABLE "LineageNode" ALTER COLUMN "passportId" SET NOT NULL;
ALTER TABLE "LineageNode" DROP COLUMN IF EXISTS "userId";

-- Affiliation: person<->school axis.
ALTER TABLE "Affiliation" DROP CONSTRAINT IF EXISTS "Affiliation_userId_fkey";
DROP INDEX IF EXISTS "Affiliation_userId_isCurrent_idx";
ALTER TABLE "Affiliation" ALTER COLUMN "passportId" SET NOT NULL;
ALTER TABLE "Affiliation" DROP COLUMN IF EXISTS "userId";
CREATE INDEX IF NOT EXISTS "Affiliation_passportId_isCurrent_idx" ON "Affiliation"("passportId", "isCurrent");

-- RankAward: earner moves to Passport; awardedById stays nullable User actor; awardedByPassportId is historical promoter identity.
ALTER TABLE "RankAward" DROP CONSTRAINT IF EXISTS "RankAward_userId_fkey";
DROP INDEX IF EXISTS "RankAward_userId_rankId_key";
DROP INDEX IF EXISTS "RankAward_userId_awardedAt_idx";
ALTER TABLE "RankAward" ALTER COLUMN "passportId" SET NOT NULL;
ALTER TABLE "RankAward" DROP COLUMN IF EXISTS "userId";
CREATE UNIQUE INDEX IF NOT EXISTS "RankAward_passportId_rankId_key" ON "RankAward"("passportId", "rankId");
CREATE INDEX IF NOT EXISTS "RankAward_passportId_awardedAt_idx" ON "RankAward"("passportId", "awardedAt");

-- FightRecord: per-person record moves to Passport.
ALTER TABLE "FightRecord" DROP CONSTRAINT IF EXISTS "FightRecord_userId_fkey";
DROP INDEX IF EXISTS "FightRecord_userId_disciplineId_type_key";
DROP INDEX IF EXISTS "FightRecord_userId_idx";
ALTER TABLE "FightRecord" ALTER COLUMN "passportId" SET NOT NULL;
ALTER TABLE "FightRecord" DROP COLUMN IF EXISTS "userId";
CREATE UNIQUE INDEX IF NOT EXISTS "FightRecord_passportId_disciplineId_type_key" ON "FightRecord"("passportId", "disciplineId", "type");
CREATE INDEX IF NOT EXISTS "FightRecord_passportId_idx" ON "FightRecord"("passportId");

COMMIT;
