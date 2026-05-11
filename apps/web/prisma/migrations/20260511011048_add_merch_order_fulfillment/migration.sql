-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('PAID', 'SUBMITTED', 'PRINTING', 'SHIPPED', 'DELIVERED', 'FAILED', 'CANCELED', 'RETURNED', 'REFUNDED');

-- CreateTable
CREATE TABLE "MerchOrder" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "stripeCheckoutSessionId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "printfulOrderId" INTEGER,
    "printfulExternalId" TEXT,
    "fulfillmentStatus" "FulfillmentStatus" NOT NULL DEFAULT 'PAID',
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "amountCents" INTEGER NOT NULL DEFAULT 0,
    "shippingCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "lineItems" JSONB,
    "shippingName" TEXT,
    "shippingAddress1" TEXT,
    "shippingAddress2" TEXT,
    "shippingCity" TEXT,
    "shippingState" TEXT,
    "shippingPostalCode" TEXT,
    "shippingCountryCode" TEXT,
    "trackingNumber" TEXT,
    "trackingUrl" TEXT,
    "carrier" TEXT,
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "pricingPlanId" TEXT,

    CONSTRAINT "MerchOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MerchOrder_stripeCheckoutSessionId_key" ON "MerchOrder"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "MerchOrder_brand_organizationId_idx" ON "MerchOrder"("brand", "organizationId");

-- CreateIndex
CREATE INDEX "MerchOrder_userId_idx" ON "MerchOrder"("userId");

-- CreateIndex
CREATE INDEX "MerchOrder_fulfillmentStatus_idx" ON "MerchOrder"("fulfillmentStatus");

-- CreateIndex
CREATE INDEX "MerchOrder_createdAt_idx" ON "MerchOrder"("createdAt");

-- AddForeignKey
ALTER TABLE "MerchOrder" ADD CONSTRAINT "MerchOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchOrder" ADD CONSTRAINT "MerchOrder_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchOrder" ADD CONSTRAINT "MerchOrder_pricingPlanId_fkey" FOREIGN KEY ("pricingPlanId") REFERENCES "PricingPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
