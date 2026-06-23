-- CreateTable
CREATE TABLE "PassportClaimRequest" (
    "id" TEXT NOT NULL,
    "status" "LineageClaimStatus" NOT NULL DEFAULT 'PENDING',
    "relationship" "ProfileClaimRelationship",
    "brand" "Brand" NOT NULL,
    "claimantNote" TEXT,
    "reviewerNote" TEXT,
    "bypassReason" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "passportId" TEXT NOT NULL,
    "nodeId" TEXT,
    "treeId" TEXT,
    "directoryProfileId" TEXT,
    "claimantUserId" TEXT NOT NULL,
    "reviewedById" TEXT,
    "claimedRankId" TEXT,

    CONSTRAINT "PassportClaimRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PassportClaimEvidence" (
    "id" TEXT NOT NULL,
    "label" TEXT,
    "url" TEXT,
    "text" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimRequestId" TEXT NOT NULL,
    "mediaId" TEXT,

    CONSTRAINT "PassportClaimEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PassportClaimRequest_brand_status_idx" ON "PassportClaimRequest"("brand", "status");

-- CreateIndex
CREATE INDEX "PassportClaimRequest_passportId_status_idx" ON "PassportClaimRequest"("passportId", "status");

-- CreateIndex
CREATE INDEX "PassportClaimRequest_nodeId_status_idx" ON "PassportClaimRequest"("nodeId", "status");

-- CreateIndex
CREATE INDEX "PassportClaimRequest_directoryProfileId_status_idx" ON "PassportClaimRequest"("directoryProfileId", "status");

-- CreateIndex
CREATE INDEX "PassportClaimRequest_claimantUserId_status_idx" ON "PassportClaimRequest"("claimantUserId", "status");

-- CreateIndex
CREATE INDEX "PassportClaimEvidence_claimRequestId_idx" ON "PassportClaimEvidence"("claimRequestId");

-- CreateIndex
CREATE INDEX "PassportClaimEvidence_mediaId_idx" ON "PassportClaimEvidence"("mediaId");

-- AddForeignKey
ALTER TABLE "PassportClaimRequest" ADD CONSTRAINT "PassportClaimRequest_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "Passport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassportClaimRequest" ADD CONSTRAINT "PassportClaimRequest_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "LineageNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassportClaimRequest" ADD CONSTRAINT "PassportClaimRequest_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "LineageTree"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassportClaimRequest" ADD CONSTRAINT "PassportClaimRequest_directoryProfileId_fkey" FOREIGN KEY ("directoryProfileId") REFERENCES "DirectoryProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassportClaimRequest" ADD CONSTRAINT "PassportClaimRequest_claimantUserId_fkey" FOREIGN KEY ("claimantUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassportClaimRequest" ADD CONSTRAINT "PassportClaimRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassportClaimRequest" ADD CONSTRAINT "PassportClaimRequest_claimedRankId_fkey" FOREIGN KEY ("claimedRankId") REFERENCES "Rank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassportClaimEvidence" ADD CONSTRAINT "PassportClaimEvidence_claimRequestId_fkey" FOREIGN KEY ("claimRequestId") REFERENCES "PassportClaimRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassportClaimEvidence" ADD CONSTRAINT "PassportClaimEvidence_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

