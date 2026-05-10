-- CreateEnum
CREATE TYPE "GearRecommendationType" AS ENUM ('REQUIRED', 'RECOMMENDED');

-- CreateTable
CREATE TABLE "GearRecommendation" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "type" "GearRecommendationType" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "pricingPlanId" TEXT NOT NULL,

    CONSTRAINT "GearRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GearRecommendation_brand_disciplineId_idx" ON "GearRecommendation"("brand", "disciplineId");

-- CreateIndex
CREATE INDEX "GearRecommendation_pricingPlanId_idx" ON "GearRecommendation"("pricingPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "GearRecommendation_disciplineId_pricingPlanId_type_key" ON "GearRecommendation"("disciplineId", "pricingPlanId", "type");

-- AddForeignKey
ALTER TABLE "GearRecommendation" ADD CONSTRAINT "GearRecommendation_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GearRecommendation" ADD CONSTRAINT "GearRecommendation_pricingPlanId_fkey" FOREIGN KEY ("pricingPlanId") REFERENCES "PricingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
