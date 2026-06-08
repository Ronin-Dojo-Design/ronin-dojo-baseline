-- CreateEnum
CREATE TYPE "AffiliationRole" AS ENUM ('TRAINS_AT', 'TEACHES_AT', 'HEAD_INSTRUCTOR', 'OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "RankAwardSource" AS ENUM ('STATED', 'EARNED');

-- CreateEnum
CREATE TYPE "RankAwardVerificationStatus" AS ENUM ('UNVERIFIED', 'VERIFIED', 'DISPUTED', 'IMPORTED');

-- AlterEnum
ALTER TYPE "OrganizationType" ADD VALUE 'AFFILIATION';

-- AlterTable
ALTER TABLE "Passport" ADD COLUMN     "coverPhotoUrl" TEXT,
ADD COLUMN     "placeOfBirth" TEXT,
ADD COLUMN     "startedTrainingAt" DATE,
ADD COLUMN     "videoIntroUrl" TEXT;

-- AlterTable
ALTER TABLE "RankAward" ADD COLUMN     "source" "RankAwardSource" NOT NULL DEFAULT 'STATED',
ADD COLUMN     "verificationStatus" "RankAwardVerificationStatus" NOT NULL DEFAULT 'UNVERIFIED';

-- CreateTable
CREATE TABLE "Affiliation" (
    "id" TEXT NOT NULL,
    "role" "AffiliationRole" NOT NULL DEFAULT 'TRAINS_AT',
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "schoolName" TEXT,
    "startedAt" DATE,
    "endedAt" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,

    CONSTRAINT "Affiliation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Affiliation_userId_isCurrent_idx" ON "Affiliation"("userId", "isCurrent");

-- CreateIndex
CREATE INDEX "Affiliation_organizationId_idx" ON "Affiliation"("organizationId");

-- AddForeignKey
ALTER TABLE "Affiliation" ADD CONSTRAINT "Affiliation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affiliation" ADD CONSTRAINT "Affiliation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
