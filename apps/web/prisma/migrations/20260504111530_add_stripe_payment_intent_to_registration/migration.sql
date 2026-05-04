-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "stripePaymentIntentId" TEXT;

-- CreateIndex
CREATE INDEX "Registration_stripePaymentIntentId_idx" ON "Registration"("stripePaymentIntentId");
