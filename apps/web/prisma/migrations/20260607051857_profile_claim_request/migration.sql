-- CreateEnum
CREATE TYPE "ProfileClaimSubjectType" AS ENUM ('PERSON', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "ProfileClaimRelationship" AS ENUM ('SELF', 'STAFF', 'OWNER', 'REPRESENTATIVE', 'FAMILY', 'OTHER');

-- CreateTable
CREATE TABLE "ProfileClaimRequest" (
    "id" TEXT NOT NULL,
    "status" "LineageClaimStatus" NOT NULL DEFAULT 'PENDING',
    "subjectType" "ProfileClaimSubjectType" NOT NULL,
    "relationship" "ProfileClaimRelationship" NOT NULL,
    "brand" "Brand" NOT NULL,
    "claimantNote" TEXT,
    "reviewerNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "directoryProfileId" TEXT,
    "organizationId" TEXT,
    "claimantUserId" TEXT NOT NULL,
    "reviewedById" TEXT,

    CONSTRAINT "ProfileClaimRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfileClaimRequest_brand_status_idx" ON "ProfileClaimRequest"("brand", "status");

-- CreateIndex
CREATE INDEX "ProfileClaimRequest_directoryProfileId_status_idx" ON "ProfileClaimRequest"("directoryProfileId", "status");

-- CreateIndex
CREATE INDEX "ProfileClaimRequest_organizationId_status_idx" ON "ProfileClaimRequest"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ProfileClaimRequest_claimantUserId_status_idx" ON "ProfileClaimRequest"("claimantUserId", "status");

-- AddForeignKey
ALTER TABLE "ProfileClaimRequest" ADD CONSTRAINT "ProfileClaimRequest_directoryProfileId_fkey" FOREIGN KEY ("directoryProfileId") REFERENCES "DirectoryProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileClaimRequest" ADD CONSTRAINT "ProfileClaimRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileClaimRequest" ADD CONSTRAINT "ProfileClaimRequest_claimantUserId_fkey" FOREIGN KEY ("claimantUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileClaimRequest" ADD CONSTRAINT "ProfileClaimRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
