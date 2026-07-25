-- CreateEnum
CREATE TYPE "ReviewRequestStatus" AS ENUM ('draft', 'approved', 'sent');

-- CreateEnum
CREATE TYPE "ReviewChannel" AS ENUM ('email', 'sms');

-- CreateEnum
CREATE TYPE "ReviewSequenceStep" AS ENUM ('first_touch', 'follow_up');

-- CreateEnum
CREATE TYPE "ReviewRequestRoute" AS ENUM ('google_request', 'private_recovery');

-- CreateEnum
CREATE TYPE "ReviewConsentBasis" AS ENUM ('email_business_relationship', 'sms_prior_express_written_consent');

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "smsConsent" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ReviewRequest" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "route" "ReviewRequestRoute" NOT NULL,
    "sequenceStep" "ReviewSequenceStep" NOT NULL,
    "channel" "ReviewChannel" NOT NULL,
    "status" "ReviewRequestStatus" NOT NULL DEFAULT 'draft',
    "consentBasis" "ReviewConsentBasis" NOT NULL,
    "smsConsent" BOOLEAN NOT NULL DEFAULT false,
    "optOut" BOOLEAN NOT NULL DEFAULT false,
    "optOutAt" TIMESTAMP(3),
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "optOutNotice" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReviewRequest_projectId_idx" ON "ReviewRequest"("projectId");

-- CreateIndex
CREATE INDEX "ReviewRequest_status_idx" ON "ReviewRequest"("status");

-- AddForeignKey
ALTER TABLE "ReviewRequest" ADD CONSTRAINT "ReviewRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewRequest" ADD CONSTRAINT "ReviewRequest_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewRequest" ADD CONSTRAINT "ReviewRequest_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

