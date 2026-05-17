-- CreateEnum
CREATE TYPE "LineageVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "LineageTreeScopeType" AS ENUM ('BRAND', 'ORGANIZATION', 'DISCIPLINE', 'STYLE', 'PERSON', 'CUSTOM');

-- CreateEnum
CREATE TYPE "LineageTreeAccessRole" AS ENUM ('TREE_ADMIN', 'TREE_EDITOR', 'BRANCH_EDITOR', 'NODE_EDITOR');

-- CreateEnum
CREATE TYPE "LineageClaimStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'NEEDS_INFO', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LineageVisualGroupType" AS ENUM ('PROMOTION_DATE', 'RANK', 'GENERATION', 'TEAM', 'CUSTOM');

-- AlterEnum
ALTER TYPE "LineageRelationType" ADD VALUE 'PROMOTED_BY';

-- DropIndex
DROP INDEX "LineageRelationship_fromNodeId_toNodeId_type_key";

-- AlterTable
ALTER TABLE "LineageNode" ADD COLUMN "archivedAt" TIMESTAMP(3),
ADD COLUMN "verificationStatus" "LineageVerificationStatus" NOT NULL DEFAULT 'PENDING';

UPDATE "LineageNode"
SET "verificationStatus" = 'VERIFIED'
WHERE "isVerified" = true;

-- AlterTable
ALTER TABLE "LineageRelationship" ADD COLUMN "rankAwardId" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3),
ADD COLUMN "verificationStatus" "LineageVerificationStatus" NOT NULL DEFAULT 'PENDING';

UPDATE "LineageRelationship"
SET "updatedAt" = COALESCE("createdAt", CURRENT_TIMESTAMP),
    "verificationStatus" = CASE WHEN "isVerified" = true THEN 'VERIFIED'::"LineageVerificationStatus" ELSE 'PENDING'::"LineageVerificationStatus" END;

ALTER TABLE "LineageRelationship" ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "RankAward" ALTER COLUMN "awardedAt" DROP NOT NULL,
ALTER COLUMN "awardedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "LineageTree" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "scopeType" "LineageTreeScopeType" NOT NULL DEFAULT 'BRAND',
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "LineageVisibility" NOT NULL DEFAULT 'PUBLIC',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "defaultRootMemberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,
    "disciplineId" TEXT,
    "styleId" TEXT,
    "ownerNodeId" TEXT,

    CONSTRAINT "LineageTree_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineageTreeMember" (
    "id" TEXT NOT NULL,
    "visualSortOrder" INTEGER NOT NULL DEFAULT 0,
    "showPromotionDatePublic" BOOLEAN NOT NULL DEFAULT true,
    "showRankPublic" BOOLEAN NOT NULL DEFAULT true,
    "isCollapsedDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "treeId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "rankAwardId" TEXT,
    "primaryVisualParentMemberId" TEXT,
    "visualGroupId" TEXT,

    CONSTRAINT "LineageTreeMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineageVisualGroup" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "groupType" "LineageVisualGroupType" NOT NULL DEFAULT 'PROMOTION_DATE',
    "promotionDate" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "showPublicLabel" BOOLEAN NOT NULL DEFAULT false,
    "isCollapsedDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "treeId" TEXT NOT NULL,
    "parentMemberId" TEXT,

    CONSTRAINT "LineageVisualGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineageTreeAccess" (
    "id" TEXT NOT NULL,
    "role" "LineageTreeAccessRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "treeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grantedById" TEXT,
    "rootMemberId" TEXT,
    "memberId" TEXT,
    "nodeId" TEXT,

    CONSTRAINT "LineageTreeAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineageClaimRequest" (
    "id" TEXT NOT NULL,
    "status" "LineageClaimStatus" NOT NULL DEFAULT 'PENDING',
    "claimantNote" TEXT,
    "reviewerNote" TEXT,
    "bypassReason" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "treeId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "claimantUserId" TEXT NOT NULL,
    "reviewedById" TEXT,

    CONSTRAINT "LineageClaimRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineageClaimEvidence" (
    "id" TEXT NOT NULL,
    "label" TEXT,
    "url" TEXT,
    "text" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimRequestId" TEXT NOT NULL,
    "mediaId" TEXT,

    CONSTRAINT "LineageClaimEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LineageTree_brand_scopeType_idx" ON "LineageTree"("brand", "scopeType");

-- CreateIndex
CREATE INDEX "LineageTree_organizationId_idx" ON "LineageTree"("organizationId");

-- CreateIndex
CREATE INDEX "LineageTree_disciplineId_idx" ON "LineageTree"("disciplineId");

-- CreateIndex
CREATE INDEX "LineageTree_styleId_idx" ON "LineageTree"("styleId");

-- CreateIndex
CREATE INDEX "LineageTree_ownerNodeId_idx" ON "LineageTree"("ownerNodeId");

-- CreateIndex
CREATE UNIQUE INDEX "LineageTree_brand_slug_key" ON "LineageTree"("brand", "slug");

-- CreateIndex
CREATE INDEX "LineageTreeMember_treeId_primaryVisualParentMemberId_idx" ON "LineageTreeMember"("treeId", "primaryVisualParentMemberId");

-- CreateIndex
CREATE INDEX "LineageTreeMember_treeId_visualGroupId_visualSortOrder_idx" ON "LineageTreeMember"("treeId", "visualGroupId", "visualSortOrder");

-- CreateIndex
CREATE INDEX "LineageTreeMember_rankAwardId_idx" ON "LineageTreeMember"("rankAwardId");

-- CreateIndex
CREATE UNIQUE INDEX "LineageTreeMember_treeId_nodeId_key" ON "LineageTreeMember"("treeId", "nodeId");

-- CreateIndex
CREATE INDEX "LineageVisualGroup_treeId_parentMemberId_sortOrder_idx" ON "LineageVisualGroup"("treeId", "parentMemberId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "LineageVisualGroup_treeId_parentMemberId_groupType_promotio_key" ON "LineageVisualGroup"("treeId", "parentMemberId", "groupType", "promotionDate");

-- Custom integrity guard: Prisma cannot express NULLS NOT DISTINCT / expression partial uniqueness.
-- Enforces one unknown-date group per tree + parent + group type, including root-level groups.
CREATE UNIQUE INDEX "LineageVisualGroup_unknown_date_key" ON "LineageVisualGroup"(
  "treeId",
  COALESCE("parentMemberId", ''),
  "groupType"
) WHERE "promotionDate" IS NULL;

-- CreateIndex
CREATE INDEX "LineageTreeAccess_treeId_userId_role_idx" ON "LineageTreeAccess"("treeId", "userId", "role");

-- CreateIndex
CREATE INDEX "LineageTreeAccess_rootMemberId_idx" ON "LineageTreeAccess"("rootMemberId");

-- CreateIndex
CREATE INDEX "LineageTreeAccess_memberId_idx" ON "LineageTreeAccess"("memberId");

-- CreateIndex
CREATE INDEX "LineageTreeAccess_nodeId_idx" ON "LineageTreeAccess"("nodeId");

-- CreateIndex
CREATE INDEX "LineageClaimRequest_treeId_status_idx" ON "LineageClaimRequest"("treeId", "status");

-- CreateIndex
CREATE INDEX "LineageClaimRequest_nodeId_status_idx" ON "LineageClaimRequest"("nodeId", "status");

-- CreateIndex
CREATE INDEX "LineageClaimRequest_claimantUserId_status_idx" ON "LineageClaimRequest"("claimantUserId", "status");

-- CreateIndex
CREATE INDEX "LineageClaimEvidence_claimRequestId_idx" ON "LineageClaimEvidence"("claimRequestId");

-- CreateIndex
CREATE INDEX "LineageClaimEvidence_mediaId_idx" ON "LineageClaimEvidence"("mediaId");

-- CreateIndex
CREATE INDEX "LineageRelationship_fromNodeId_toNodeId_type_idx" ON "LineageRelationship"("fromNodeId", "toNodeId", "type");

-- Custom integrity guard: non-award relationships preserve legacy pair/type uniqueness,
-- while PROMOTED_BY mirrors with a rankAwardId can repeat for multiple promotions.
CREATE UNIQUE INDEX "LineageRelationship_pair_type_without_rank_award_key" ON "LineageRelationship"("fromNodeId", "toNodeId", "type")
WHERE "rankAwardId" IS NULL;

-- CreateIndex
CREATE INDEX "LineageRelationship_type_rankAwardId_idx" ON "LineageRelationship"("type", "rankAwardId");

-- CreateIndex
CREATE INDEX "LineageRelationship_verificationStatus_idx" ON "LineageRelationship"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "LineageRelationship_rankAwardId_key" ON "LineageRelationship"("rankAwardId");

-- CreateIndex
CREATE INDEX "RankAward_awardedById_idx" ON "RankAward"("awardedById");

-- AddForeignKey
ALTER TABLE "LineageRelationship" ADD CONSTRAINT "LineageRelationship_rankAwardId_fkey" FOREIGN KEY ("rankAwardId") REFERENCES "RankAward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageTree" ADD CONSTRAINT "LineageTree_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageTree" ADD CONSTRAINT "LineageTree_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageTree" ADD CONSTRAINT "LineageTree_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageTree" ADD CONSTRAINT "LineageTree_ownerNodeId_fkey" FOREIGN KEY ("ownerNodeId") REFERENCES "LineageNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageTreeMember" ADD CONSTRAINT "LineageTreeMember_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "LineageTree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageTreeMember" ADD CONSTRAINT "LineageTreeMember_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "LineageNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageTreeMember" ADD CONSTRAINT "LineageTreeMember_rankAwardId_fkey" FOREIGN KEY ("rankAwardId") REFERENCES "RankAward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageTreeMember" ADD CONSTRAINT "LineageTreeMember_primaryVisualParentMemberId_fkey" FOREIGN KEY ("primaryVisualParentMemberId") REFERENCES "LineageTreeMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageTreeMember" ADD CONSTRAINT "LineageTreeMember_visualGroupId_fkey" FOREIGN KEY ("visualGroupId") REFERENCES "LineageVisualGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageVisualGroup" ADD CONSTRAINT "LineageVisualGroup_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "LineageTree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageVisualGroup" ADD CONSTRAINT "LineageVisualGroup_parentMemberId_fkey" FOREIGN KEY ("parentMemberId") REFERENCES "LineageTreeMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageTreeAccess" ADD CONSTRAINT "LineageTreeAccess_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "LineageTree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageTreeAccess" ADD CONSTRAINT "LineageTreeAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageTreeAccess" ADD CONSTRAINT "LineageTreeAccess_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageTreeAccess" ADD CONSTRAINT "LineageTreeAccess_rootMemberId_fkey" FOREIGN KEY ("rootMemberId") REFERENCES "LineageTreeMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageTreeAccess" ADD CONSTRAINT "LineageTreeAccess_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "LineageTreeMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageTreeAccess" ADD CONSTRAINT "LineageTreeAccess_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "LineageNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageClaimRequest" ADD CONSTRAINT "LineageClaimRequest_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "LineageTree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageClaimRequest" ADD CONSTRAINT "LineageClaimRequest_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "LineageNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageClaimRequest" ADD CONSTRAINT "LineageClaimRequest_claimantUserId_fkey" FOREIGN KEY ("claimantUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageClaimRequest" ADD CONSTRAINT "LineageClaimRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageClaimEvidence" ADD CONSTRAINT "LineageClaimEvidence_claimRequestId_fkey" FOREIGN KEY ("claimRequestId") REFERENCES "LineageClaimRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageClaimEvidence" ADD CONSTRAINT "LineageClaimEvidence_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
