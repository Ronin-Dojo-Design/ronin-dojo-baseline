-- CreateTable
CREATE TABLE "BblEmailCapture" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "brand" "Brand" NOT NULL DEFAULT 'BBL',
    "source" TEXT NOT NULL DEFAULT 'teaser',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BblEmailCapture_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BblEmailCapture_email_key" ON "BblEmailCapture"("email");

-- CreateIndex
CREATE INDEX "BblEmailCapture_brand_createdAt_idx" ON "BblEmailCapture"("brand", "createdAt");
