-- AlterTable
ALTER TABLE "Discipline" ADD COLUMN     "foundedBy" TEXT,
ADD COLUMN     "history" TEXT,
ADD COLUMN     "yearEstablished" INTEGER;

-- AlterTable
ALTER TABLE "MerchOrder" ADD COLUMN     "statusHistory" JSONB;

-- CreateIndex
CREATE INDEX "MerchOrder_brand_customerEmail_idx" ON "MerchOrder"("brand", "customerEmail");

-- CreateIndex
CREATE INDEX "MerchOrder_brand_fulfillmentStatus_idx" ON "MerchOrder"("brand", "fulfillmentStatus");
