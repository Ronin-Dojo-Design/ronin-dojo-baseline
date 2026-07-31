-- SESSION_0729 (#375 ratified shape → #376 seam): immutable origin axis on RankEntry.
-- Additive + backfill; hand-authored, shadow-replayed. `migrate dev` is BANNED on the shared DB.
-- Prod (Neon) applies this on the eventual PR merge via the `prebuild` → `migrate deploy` hook.
--
-- Mapping (from the anchor award's verificationStatus): IMPORTED → IMPORTED; everything else
-- (VERIFIED | UNVERIFIED | DISPUTED) → EARNED. `awardedById` is NOT consulted — an
-- instructor-stamped VERIFIED belt is still origin EARNED. Prod backfill target: 72 IMPORTED / 39
-- EARNED of 111 (2026-07-30).

-- CreateEnum
CREATE TYPE "RankEntryProvenance" AS ENUM ('IMPORTED', 'EARNED');

-- AlterTable: default EARNED = the common in-app case; the sync/write path sets it explicitly.
ALTER TABLE "RankEntry" ADD COLUMN "provenance" "RankEntryProvenance" NOT NULL DEFAULT 'EARNED';

-- Backfill existing entries from their compatibility-anchor award.
UPDATE "RankEntry" re
  SET "provenance" = 'IMPORTED'
  FROM "RankAward" ra
  WHERE re."rankAwardId" = ra.id AND ra."verificationStatus" = 'IMPORTED';
