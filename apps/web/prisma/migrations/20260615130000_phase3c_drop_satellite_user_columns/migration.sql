-- Phase 3c (SOT-ADR D1): identity satellites become Passport-rooted; the old `userId` satellite
-- columns are dropped. This migration is SELF-SUFFICIENT and idempotent/no-op on empty tables, so it
-- is safe under both `prisma migrate reset` (replays on an empty DB, then a Passport-rooted seed runs)
-- and `prisma migrate deploy` against an existing DB (it carries data before the destructive DDL).
--
-- Order matters (SESSION_0391 cascade trap): backfill passportId, drop the satellite userId FKs FIRST
-- (removes the ON DELETE CASCADE path onto identity rows), DETACH placeholder Passports
-- (Passport.userId is ON DELETE CASCADE), then hard-delete the synthetic placeholder Users.

-- ---------------------------------------------------------------------------
-- 1. Mint a Passport for every satellite-bearing or promoter User lacking one.
-- ---------------------------------------------------------------------------
INSERT INTO "Passport" (id, "userId", "displayName", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, u.id, u.name, now(), now()
FROM "User" u
WHERE u.id IN (
  SELECT "userId" FROM "DirectoryProfile" WHERE "userId" IS NOT NULL
  UNION SELECT "userId" FROM "LineageNode" WHERE "userId" IS NOT NULL
  UNION SELECT "userId" FROM "Affiliation" WHERE "userId" IS NOT NULL
  UNION SELECT "userId" FROM "RankAward" WHERE "userId" IS NOT NULL
  UNION SELECT "userId" FROM "FightRecord" WHERE "userId" IS NOT NULL
  UNION SELECT "awardedById" FROM "RankAward" WHERE "awardedById" IS NOT NULL
)
AND NOT EXISTS (SELECT 1 FROM "Passport" p WHERE p."userId" = u.id);

-- ---------------------------------------------------------------------------
-- 2. Historical placeholder promoters → Passport identity; null the synthetic actor link.
-- ---------------------------------------------------------------------------
UPDATE "RankAward" ra
SET "awardedByPassportId" = p.id
FROM "Passport" p, "User" u
WHERE ra."awardedById" = p."userId"
  AND ra."awardedById" = u.id
  AND u."isPlaceholder" = true
  AND ra."awardedByPassportId" IS NULL;

UPDATE "RankAward" ra
SET "awardedById" = NULL
WHERE EXISTS (SELECT 1 FROM "User" u WHERE u.id = ra."awardedById" AND u."isPlaceholder" = true);

-- ---------------------------------------------------------------------------
-- 3. Backfill satellite passportId from Passport.userId (1:1 today).
-- ---------------------------------------------------------------------------
UPDATE "DirectoryProfile" s SET "passportId" = p.id FROM "Passport" p WHERE s."userId" = p."userId" AND s."passportId" IS NULL;
UPDATE "LineageNode"      s SET "passportId" = p.id FROM "Passport" p WHERE s."userId" = p."userId" AND s."passportId" IS NULL;
UPDATE "Affiliation"      s SET "passportId" = p.id FROM "Passport" p WHERE s."userId" = p."userId" AND s."passportId" IS NULL;
UPDATE "RankAward"        s SET "passportId" = p.id FROM "Passport" p WHERE s."userId" = p."userId" AND s."passportId" IS NULL;
UPDATE "FightRecord"      s SET "passportId" = p.id FROM "Passport" p WHERE s."userId" = p."userId" AND s."passportId" IS NULL;

-- ---------------------------------------------------------------------------
-- 4. Guard: every satellite row must now have a passportId (else stop before destructive DDL).
-- ---------------------------------------------------------------------------
DO $$
DECLARE missing bigint;
BEGIN
  SELECT COUNT(*) INTO missing FROM "DirectoryProfile" WHERE "passportId" IS NULL;
  IF missing > 0 THEN RAISE EXCEPTION 'DirectoryProfile.passportId has % NULL rows', missing; END IF;
  SELECT COUNT(*) INTO missing FROM "LineageNode" WHERE "passportId" IS NULL;
  IF missing > 0 THEN RAISE EXCEPTION 'LineageNode.passportId has % NULL rows', missing; END IF;
  SELECT COUNT(*) INTO missing FROM "Affiliation" WHERE "passportId" IS NULL;
  IF missing > 0 THEN RAISE EXCEPTION 'Affiliation.passportId has % NULL rows', missing; END IF;
  SELECT COUNT(*) INTO missing FROM "RankAward" WHERE "passportId" IS NULL;
  IF missing > 0 THEN RAISE EXCEPTION 'RankAward.passportId has % NULL rows', missing; END IF;
  SELECT COUNT(*) INTO missing FROM "FightRecord" WHERE "passportId" IS NULL;
  IF missing > 0 THEN RAISE EXCEPTION 'FightRecord.passportId has % NULL rows', missing; END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 5. Destructive DDL: drop satellite userId FKs/indexes, flip passportId NOT NULL, move constraints.
--    (Dropping the FK columns first removes the ON DELETE CASCADE path before any User delete.)
-- ---------------------------------------------------------------------------
ALTER TABLE "DirectoryProfile" DROP CONSTRAINT IF EXISTS "DirectoryProfile_userId_fkey";
DROP INDEX IF EXISTS "DirectoryProfile_userId_key";
ALTER TABLE "DirectoryProfile" ALTER COLUMN "passportId" SET NOT NULL;
ALTER TABLE "DirectoryProfile" DROP COLUMN IF EXISTS "userId";

ALTER TABLE "LineageNode" DROP CONSTRAINT IF EXISTS "LineageNode_userId_fkey";
DROP INDEX IF EXISTS "LineageNode_userId_key";
ALTER TABLE "LineageNode" ALTER COLUMN "passportId" SET NOT NULL;
ALTER TABLE "LineageNode" DROP COLUMN IF EXISTS "userId";

ALTER TABLE "Affiliation" DROP CONSTRAINT IF EXISTS "Affiliation_userId_fkey";
DROP INDEX IF EXISTS "Affiliation_userId_isCurrent_idx";
ALTER TABLE "Affiliation" ALTER COLUMN "passportId" SET NOT NULL;
ALTER TABLE "Affiliation" DROP COLUMN IF EXISTS "userId";
CREATE INDEX IF NOT EXISTS "Affiliation_passportId_isCurrent_idx" ON "Affiliation"("passportId", "isCurrent");

ALTER TABLE "RankAward" DROP CONSTRAINT IF EXISTS "RankAward_userId_fkey";
DROP INDEX IF EXISTS "RankAward_userId_rankId_key";
DROP INDEX IF EXISTS "RankAward_userId_awardedAt_idx";
ALTER TABLE "RankAward" ALTER COLUMN "passportId" SET NOT NULL;
ALTER TABLE "RankAward" DROP COLUMN IF EXISTS "userId";
CREATE UNIQUE INDEX IF NOT EXISTS "RankAward_passportId_rankId_key" ON "RankAward"("passportId", "rankId");
CREATE INDEX IF NOT EXISTS "RankAward_passportId_awardedAt_idx" ON "RankAward"("passportId", "awardedAt");

ALTER TABLE "FightRecord" DROP CONSTRAINT IF EXISTS "FightRecord_userId_fkey";
DROP INDEX IF EXISTS "FightRecord_userId_disciplineId_type_key";
DROP INDEX IF EXISTS "FightRecord_userId_idx";
ALTER TABLE "FightRecord" ALTER COLUMN "passportId" SET NOT NULL;
ALTER TABLE "FightRecord" DROP COLUMN IF EXISTS "userId";
CREATE UNIQUE INDEX IF NOT EXISTS "FightRecord_passportId_disciplineId_type_key" ON "FightRecord"("passportId", "disciplineId", "type");
CREATE INDEX IF NOT EXISTS "FightRecord_passportId_idx" ON "FightRecord"("passportId");

-- ---------------------------------------------------------------------------
-- 6. Detach placeholder Passports (Passport.userId is ON DELETE CASCADE), assert no placeholder owns a
--    CARRY row, then hard-delete the synthetic placeholder Users.
-- ---------------------------------------------------------------------------
UPDATE "Passport" SET "userId" = NULL
WHERE "userId" IN (SELECT id FROM "User" WHERE "isPlaceholder" = true);

DO $$
DECLARE leaked bigint;
BEGIN
  SELECT COUNT(*) INTO leaked FROM "User" u
  WHERE u."isPlaceholder" = true
    AND (
      EXISTS (SELECT 1 FROM "Membership" m WHERE m."userId" = u.id)
      OR EXISTS (SELECT 1 FROM "Session" s WHERE s."userId" = u.id)
      OR EXISTS (SELECT 1 FROM "Account" a WHERE a."userId" = u.id)
      OR EXISTS (SELECT 1 FROM "AuditLog" al WHERE al."userId" = u.id)
      OR EXISTS (SELECT 1 FROM "Invoice" i WHERE i."userId" = u.id)
      OR EXISTS (SELECT 1 FROM "UserEntitlement" ue WHERE ue."userId" = u.id)
    );
  IF leaked > 0 THEN
    RAISE EXCEPTION 'Refusing to delete % placeholder Users that own CARRY rows (data defect, reconcile manually)', leaked;
  END IF;
END $$;

DELETE FROM "User" WHERE "isPlaceholder" = true;

-- ---------------------------------------------------------------------------
-- 7. Re-root the passportId FKs as the now-required relation (ON DELETE RESTRICT) so the migration
--    chain matches schema.prisma exactly (the 3a FKs were created while passportId was optional).
-- ---------------------------------------------------------------------------
ALTER TABLE "Affiliation" DROP CONSTRAINT "Affiliation_passportId_fkey";
ALTER TABLE "DirectoryProfile" DROP CONSTRAINT "DirectoryProfile_passportId_fkey";
ALTER TABLE "FightRecord" DROP CONSTRAINT "FightRecord_passportId_fkey";
ALTER TABLE "LineageNode" DROP CONSTRAINT "LineageNode_passportId_fkey";
ALTER TABLE "RankAward" DROP CONSTRAINT "RankAward_passportId_fkey";

ALTER TABLE "DirectoryProfile" ADD CONSTRAINT "DirectoryProfile_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "Passport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Affiliation" ADD CONSTRAINT "Affiliation_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "Passport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RankAward" ADD CONSTRAINT "RankAward_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "Passport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LineageNode" ADD CONSTRAINT "LineageNode_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "Passport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FightRecord" ADD CONSTRAINT "FightRecord_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "Passport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
