-- SESSION_0475 — Remove the display-dead `LineageTreeMember.selectedRankAward` override.
-- ADR 0035: the shown belt is awarded truth (the passport's highest RankAward), so the
-- per-member editorial rank pointer has no readers. The promotion-edge → award link lives
-- on `LineageRelationship.rankAwardId` (a separate column) and is untouched.

-- DropForeignKey
ALTER TABLE "LineageTreeMember" DROP CONSTRAINT "LineageTreeMember_rankAwardId_fkey";

-- DropIndex
DROP INDEX "LineageTreeMember_rankAwardId_idx";

-- AlterTable
ALTER TABLE "LineageTreeMember" DROP COLUMN "rankAwardId";
