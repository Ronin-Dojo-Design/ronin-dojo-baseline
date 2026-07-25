-- CreateEnum
CREATE TYPE "SocialQueueSource" AS ENUM ('CLAIM_VERIFIED', 'RANK_PROMOTION', 'TECHNIQUE_FEATURED', 'GRAPH_MILESTONE', 'BLOG_POST');

-- CreateEnum
CREATE TYPE "SocialQueueStatus" AS ENUM ('DRAFT', 'APPROVED', 'REJECTED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "SocialConsentBasis" AS ENUM ('MEMBER_OPT_IN', 'AGGREGATE_ONLY', 'OWNED_CONTENT');

-- CreateTable
CREATE TABLE "SocialQueueItem" (
    "id" TEXT NOT NULL,
    "source" "SocialQueueSource" NOT NULL,
    "subjectKey" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "caption" TEXT,
    "consentBasis" "SocialConsentBasis" NOT NULL,
    "status" "SocialQueueStatus" NOT NULL DEFAULT 'DRAFT',
    "rejectedReason" TEXT,
    "brand" "Brand" NOT NULL DEFAULT 'BBL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "passportId" TEXT,

    CONSTRAINT "SocialQueueItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialQueueItem_status_createdAt_idx" ON "SocialQueueItem"("status", "createdAt");

-- CreateIndex
CREATE INDEX "SocialQueueItem_passportId_idx" ON "SocialQueueItem"("passportId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialQueueItem_source_subjectKey_key" ON "SocialQueueItem"("source", "subjectKey");

-- AddForeignKey
ALTER TABLE "SocialQueueItem" ADD CONSTRAINT "SocialQueueItem_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialQueueItem" ADD CONSTRAINT "SocialQueueItem_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "Passport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

