-- AlterTable
ALTER TABLE "PromotionEvent" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PromotionEvent_slug_key" ON "PromotionEvent"("slug");
