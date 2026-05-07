-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN "stripeInvoiceId" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "stripeCheckoutSessionId" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "stripeSubscriptionId" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "stripeCheckoutSessionId" TEXT;

-- CreateTable
CREATE TABLE "StripeCustomer" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "accountScope" TEXT NOT NULL DEFAULT 'platform',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "StripeCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeWebhookEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "objectId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PROCESSING',
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "lastError" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StripeCustomer_stripeCustomerId_key" ON "StripeCustomer"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeCustomer_userId_brand_accountScope_key" ON "StripeCustomer"("userId", "brand", "accountScope");

-- CreateIndex
CREATE INDEX "StripeCustomer_brand_stripeCustomerId_idx" ON "StripeCustomer"("brand", "stripeCustomerId");

-- CreateIndex
CREATE INDEX "StripeCustomer_userId_idx" ON "StripeCustomer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_stripeInvoiceId_key" ON "Invoice"("stripeInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_stripeCheckoutSessionId_key" ON "Invoice"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripeCheckoutSessionId_key" ON "Payment"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "StripeWebhookEvent_type_objectId_idx" ON "StripeWebhookEvent"("type", "objectId");

-- CreateIndex
CREATE INDEX "StripeWebhookEvent_status_idx" ON "StripeWebhookEvent"("status");

-- CreateIndex
CREATE INDEX "Invoice_stripeSubscriptionId_idx" ON "Invoice"("stripeSubscriptionId");

-- AddForeignKey
ALTER TABLE "StripeCustomer" ADD CONSTRAINT "StripeCustomer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
