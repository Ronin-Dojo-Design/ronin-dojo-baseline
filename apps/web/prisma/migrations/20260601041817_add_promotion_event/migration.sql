-- AlterTable
ALTER TABLE "LineageVisualGroup" ADD COLUMN     "promotionEventId" TEXT;

-- AlterTable
ALTER TABLE "MediaAttachment" ADD COLUMN     "promotionEventId" TEXT;

-- AlterTable
ALTER TABLE "RankAward" ADD COLUMN     "promotionEventId" TEXT;

-- CreateTable
CREATE TABLE "PromotionEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hostOrganizationId" TEXT,

    CONSTRAINT "PromotionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromotionEvent_eventDate_idx" ON "PromotionEvent"("eventDate");

-- CreateIndex
CREATE INDEX "PromotionEvent_hostOrganizationId_idx" ON "PromotionEvent"("hostOrganizationId");

-- CreateIndex
CREATE INDEX "LineageVisualGroup_promotionEventId_idx" ON "LineageVisualGroup"("promotionEventId");

-- CreateIndex
CREATE INDEX "MediaAttachment_promotionEventId_idx" ON "MediaAttachment"("promotionEventId");

-- CreateIndex
CREATE INDEX "RankAward_promotionEventId_idx" ON "RankAward"("promotionEventId");

-- AddForeignKey
ALTER TABLE "RankAward" ADD CONSTRAINT "RankAward_promotionEventId_fkey" FOREIGN KEY ("promotionEventId") REFERENCES "PromotionEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionEvent" ADD CONSTRAINT "PromotionEvent_hostOrganizationId_fkey" FOREIGN KEY ("hostOrganizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageVisualGroup" ADD CONSTRAINT "LineageVisualGroup_promotionEventId_fkey" FOREIGN KEY ("promotionEventId") REFERENCES "PromotionEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAttachment" ADD CONSTRAINT "MediaAttachment_promotionEventId_fkey" FOREIGN KEY ("promotionEventId") REFERENCES "PromotionEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
