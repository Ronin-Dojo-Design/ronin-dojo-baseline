-- A3: Registration recipient delta
-- - Make Registration.userId nullable (admin walk-ins may target a guest)
-- - Add Registration.guestEmail / guestName / recipientKey
-- - Replace @@unique([tournamentId, userId]) with @@unique([tournamentId, recipientKey])
-- - Backfill recipientKey from userId for existing rows BEFORE the new unique
--   constraint applies, so the constraint never sees a NULL.
--
-- See: docs/sprints/SESSION_0261.md, docs/architecture/decisions/0020-registration-recipient-userid-or-guest.md

-- 1. Allow userId to be NULL (FK constraint remains; Postgres allows NULL FKs).
ALTER TABLE "Registration" ALTER COLUMN "userId" DROP NOT NULL;

-- 2. Add new columns. recipientKey is added nullable first so we can backfill.
ALTER TABLE "Registration"
  ADD COLUMN "guestEmail" TEXT,
  ADD COLUMN "guestName" TEXT,
  ADD COLUMN "recipientKey" TEXT;

-- 3. Backfill recipientKey for existing rows. All existing Registrations have a
--    non-null userId (pre-A3 schema), so recipientKey = userId is exhaustive.
UPDATE "Registration" SET "recipientKey" = "userId" WHERE "recipientKey" IS NULL;

-- 4. Now that every row has a recipientKey, enforce NOT NULL.
ALTER TABLE "Registration" ALTER COLUMN "recipientKey" SET NOT NULL;

-- 5. Swap the unique constraint.
DROP INDEX "Registration_tournamentId_userId_key";
CREATE UNIQUE INDEX "Registration_tournamentId_recipientKey_key" ON "Registration"("tournamentId", "recipientKey");
