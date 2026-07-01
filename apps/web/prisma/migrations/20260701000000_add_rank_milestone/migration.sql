-- SESSION_0479 — Add member-owned Belt Journey enrichment beside RankAward truth.
-- ADR 0016 remains unchanged: RankAward is the canonical promotion fact. RankMilestone is
-- story/media enrichment only and cascades when its owning RankAward is deleted.

-- CreateTable
CREATE TABLE "RankMilestone" (
    "id" TEXT NOT NULL,
    "story" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rankAwardId" TEXT NOT NULL,

    CONSTRAINT "RankMilestone_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "MediaAttachment" ADD COLUMN     "rankMilestoneId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "RankMilestone_rankAwardId_key" ON "RankMilestone"("rankAwardId");

-- CreateIndex
CREATE INDEX "MediaAttachment_rankMilestoneId_idx" ON "MediaAttachment"("rankMilestoneId");

-- AddForeignKey
ALTER TABLE "RankMilestone" ADD CONSTRAINT "RankMilestone_rankAwardId_fkey" FOREIGN KEY ("rankAwardId") REFERENCES "RankAward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAttachment" ADD CONSTRAINT "MediaAttachment_rankMilestoneId_fkey" FOREIGN KEY ("rankMilestoneId") REFERENCES "RankMilestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
