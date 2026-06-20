-- CreateTable
CREATE TABLE "LineagePendingClaim" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "consumedAt" TIMESTAMP(3),
    "nodeId" TEXT NOT NULL,
    "consumedByUserId" TEXT,

    CONSTRAINT "LineagePendingClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LineagePendingClaim_email_consumedAt_idx" ON "LineagePendingClaim"("email", "consumedAt");

-- CreateIndex
CREATE INDEX "LineagePendingClaim_nodeId_idx" ON "LineagePendingClaim"("nodeId");

-- CreateIndex
CREATE UNIQUE INDEX "LineagePendingClaim_email_nodeId_key" ON "LineagePendingClaim"("email", "nodeId");

-- AddForeignKey
ALTER TABLE "LineagePendingClaim" ADD CONSTRAINT "LineagePendingClaim_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "LineageNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineagePendingClaim" ADD CONSTRAINT "LineagePendingClaim_consumedByUserId_fkey" FOREIGN KEY ("consumedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
