/*
  Warnings:

  - You are about to drop the column `schoolId` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `styleId` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `eventType` on the `GamificationEvent` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Style` table. All the data in the column will be lost.
  - You are about to drop the column `endsAt` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `startsAt` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the `Belt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Progress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `School` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SchoolStyle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TournamentRegistration` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[brand,organizationId,slug]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,organizationId,disciplineId]` on the table `Membership` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[disciplineId,code]` on the table `Style` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organizationId` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventTypeId` to the `GamificationEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disciplineId` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Style` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disciplineId` to the `Style` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Tournament` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('DOJO', 'LEAGUE', 'SCHOOL', 'CLUB');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('INVITED', 'PENDING', 'ACTIVE', 'SUSPENDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RankSystemKind" AS ENUM ('BELT', 'PRAJIOUD', 'GRADE', 'KYU_DAN', 'OTHER');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('STARTED', 'SUBMITTED', 'APPROVED', 'WAITLISTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'REFUNDED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "DivisionFormat" AS ENUM ('SINGLE_ELIM', 'ROUND_ROBIN', 'POOL_TO_BRACKET', 'KATA', 'SPARRING', 'FORMS');

-- CreateEnum
CREATE TYPE "DivisionGender" AS ENUM ('ANY', 'FEMALE', 'MALE');

-- CreateEnum
CREATE TYPE "DirectoryVisibility" AS ENUM ('HIDDEN', 'MEMBERS_ONLY', 'PUBLIC');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('FEMALE', 'MALE', 'NONBINARY', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "EntryStatus" AS ENUM ('ACTIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StyleStatus" AS ENUM ('APPROVED', 'PENDING', 'REJECTED');

-- CreateEnum
CREATE TYPE "WaiverType" AS ENUM ('LIABILITY', 'TOURNAMENT', 'MINOR_CONSENT', 'MEDIA_RELEASE', 'MEDICAL');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PAST_DUE');

-- CreateEnum
CREATE TYPE "LineageVisibility" AS ENUM ('PUBLIC', 'UNLISTED', 'RESTRICTED', 'PRIVATE');

-- CreateEnum
CREATE TYPE "LineageRelationType" AS ENUM ('TOURNAMENT_PARTNER', 'AFFILIATION', 'TRAINING_PARTNER', 'SEMINAR', 'COMPETITION_TEAM');

-- CreateEnum
CREATE TYPE "CertificationStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ContentAtomStatus" AS ENUM ('INBOX', 'DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContentChannel" AS ENUM ('BLOG', 'INSTAGRAM', 'FACEBOOK', 'YOUTUBE_SHORT', 'YOUTUBE_LONG', 'REDDIT', 'TIKTOK', 'EMAIL', 'CURRICULUM');

-- CreateEnum
CREATE TYPE "ContentVariantStatus" AS ENUM ('DRAFT', 'READY', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContentTaskType" AS ENUM ('WRITING', 'MEDIA', 'REVIEW', 'PUBLISH', 'QA');

-- CreateEnum
CREATE TYPE "ContentTaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Belt" DROP CONSTRAINT "Belt_styleId_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_styleId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Progress" DROP CONSTRAINT "Progress_awardedById_fkey";

-- DropForeignKey
ALTER TABLE "Progress" DROP CONSTRAINT "Progress_beltId_fkey";

-- DropForeignKey
ALTER TABLE "Progress" DROP CONSTRAINT "Progress_userId_fkey";

-- DropForeignKey
ALTER TABLE "School" DROP CONSTRAINT "School_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "SchoolStyle" DROP CONSTRAINT "SchoolStyle_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "SchoolStyle" DROP CONSTRAINT "SchoolStyle_styleId_fkey";

-- DropForeignKey
ALTER TABLE "Tournament" DROP CONSTRAINT "Tournament_hostId_fkey";

-- DropForeignKey
ALTER TABLE "TournamentRegistration" DROP CONSTRAINT "TournamentRegistration_competitorId_fkey";

-- DropForeignKey
ALTER TABLE "TournamentRegistration" DROP CONSTRAINT "TournamentRegistration_tournamentId_fkey";

-- DropIndex
DROP INDEX "Course_brand_schoolId_idx";

-- DropIndex
DROP INDEX "Course_brand_schoolId_slug_key";

-- DropIndex
DROP INDEX "Course_styleId_idx";

-- DropIndex
DROP INDEX "GamificationEvent_brand_eventType_idx";

-- DropIndex
DROP INDEX "Membership_brand_schoolId_idx";

-- DropIndex
DROP INDEX "Membership_userId_schoolId_role_key";

-- DropIndex
DROP INDEX "Style_name_key";

-- DropIndex
DROP INDEX "Style_slug_key";

-- DropIndex
DROP INDEX "Tournament_brand_startsAt_idx";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "schoolId",
DROP COLUMN "styleId",
ADD COLUMN     "disciplineId" TEXT,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "rankId" TEXT;

-- AlterTable
ALTER TABLE "GamificationEvent" DROP COLUMN "eventType",
ADD COLUMN     "courseId" TEXT,
ADD COLUMN     "disciplineId" TEXT,
ADD COLUMN     "eventTypeId" TEXT NOT NULL,
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "rankAwardId" TEXT;

-- AlterTable
ALTER TABLE "Membership" DROP COLUMN "role",
DROP COLUMN "schoolId",
ADD COLUMN     "disciplineId" TEXT NOT NULL,
ADD COLUMN     "leftAt" DATE,
ADD COLUMN     "memberNumber" TEXT,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "rankId" TEXT,
ADD COLUMN     "status" "MembershipStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "styleId" TEXT,
ALTER COLUMN "joinedAt" DROP NOT NULL,
ALTER COLUMN "joinedAt" DROP DEFAULT,
ALTER COLUMN "joinedAt" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "Style" DROP COLUMN "slug",
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedByUserId" TEXT,
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "createdByUserId" TEXT,
ADD COLUMN     "disciplineId" TEXT NOT NULL,
ADD COLUMN     "parentStyleId" TEXT,
ADD COLUMN     "status" "StyleStatus" NOT NULL DEFAULT 'APPROVED';

-- AlterTable
ALTER TABLE "Tournament" DROP COLUMN "endsAt",
DROP COLUMN "startsAt",
ADD COLUMN     "endDate" DATE NOT NULL,
ADD COLUMN     "startDate" DATE NOT NULL,
ADD COLUMN     "status" "TournamentStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "timezone" TEXT,
ADD COLUMN     "venueCity" TEXT,
ADD COLUMN     "venueCountry" CHAR(2),
ADD COLUMN     "venueName" TEXT,
ADD COLUMN     "venueRegion" TEXT;

-- DropTable
DROP TABLE "Belt";

-- DropTable
DROP TABLE "Profile";

-- DropTable
DROP TABLE "Progress";

-- DropTable
DROP TABLE "School";

-- DropTable
DROP TABLE "SchoolStyle";

-- DropTable
DROP TABLE "TournamentRegistration";

-- DropEnum
DROP TYPE "MembershipRole";

-- CreateTable
CREATE TABLE "Passport" (
    "id" TEXT NOT NULL,
    "displayName" TEXT,
    "legalFirstName" TEXT,
    "legalLastName" TEXT,
    "dob" DATE,
    "gender" "Gender",
    "phoneE164" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhoneE164" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "socialLinks" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Passport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectoryProfile" (
    "id" TEXT NOT NULL,
    "visibility" "DirectoryVisibility" NOT NULL DEFAULT 'MEMBERS_ONLY',
    "locationCity" TEXT,
    "locationRegion" TEXT,
    "locationCountry" CHAR(2),
    "showEmail" BOOLEAN NOT NULL DEFAULT false,
    "showPhone" BOOLEAN NOT NULL DEFAULT false,
    "showOrgs" BOOLEAN NOT NULL DEFAULT true,
    "showRanks" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DirectoryProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL DEFAULT 'DOJO',
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT DEFAULT 'US',
    "websiteUrl" TEXT,
    "inviteCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discipline" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "brand" "Brand",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discipline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationDiscipline" (
    "organizationId" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,

    CONSTRAINT "OrganizationDiscipline_pkey" PRIMARY KEY ("organizationId","disciplineId")
);

-- CreateTable
CREATE TABLE "RankSystem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "RankSystemKind" NOT NULL DEFAULT 'BELT',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "brand" "Brand",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disciplineId" TEXT NOT NULL,

    CONSTRAINT "RankSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rank" (
    "id" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "colorHex" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "brand" "Brand",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rankSystemId" TEXT NOT NULL,

    CONSTRAINT "Rank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipRoleAssignment" (
    "id" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "membershipId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "MembershipRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "brand" "Brand",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankAward" (
    "id" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "location" TEXT,
    "mediaUrls" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "rankId" TEXT NOT NULL,
    "awardedById" TEXT,

    CONSTRAINT "RankAward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseEnrollment" (
    "id" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurriculumItemCompletion" (
    "id" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enrollmentId" TEXT NOT NULL,
    "curriculumItemId" TEXT NOT NULL,
    "verifiedById" TEXT,

    CONSTRAINT "CurriculumItemCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentDiscipline" (
    "id" TEXT NOT NULL,
    "rulesetName" TEXT,
    "tournamentId" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,

    CONSTRAINT "TournamentDiscipline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Division" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "format" "DivisionFormat" NOT NULL,
    "gender" "DivisionGender" NOT NULL DEFAULT 'ANY',
    "ageMin" INTEGER,
    "ageMax" INTEGER,
    "weightMinKg" DECIMAL(5,2),
    "weightMaxKg" DECIMAL(5,2),
    "feeCents" INTEGER NOT NULL DEFAULT 0,
    "capacity" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tournamentDisciplineId" TEXT NOT NULL,
    "roleRequiredId" TEXT NOT NULL,
    "rankMinId" TEXT,
    "rankMaxId" TEXT,

    CONSTRAINT "Division_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'STARTED',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "totalFeeCents" INTEGER NOT NULL DEFAULT 0,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistrationEntry" (
    "id" TEXT NOT NULL,
    "snapshotRankName" TEXT,
    "snapshotOrgName" TEXT,
    "status" "EntryStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registrationId" TEXT NOT NULL,
    "divisionId" TEXT NOT NULL,
    "tournamentRoleId" TEXT NOT NULL,
    "representingMembershipId" TEXT,

    CONSTRAINT "RegistrationEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentRole" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "brand" "Brand",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentStaffAssignment" (
    "id" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tournamentRoleId" TEXT NOT NULL,
    "divisionId" TEXT,

    CONSTRAINT "TournamentStaffAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamificationEventType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "defaultPoints" INTEGER NOT NULL DEFAULT 0,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "brand" "Brand",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GamificationEventType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionTier" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "level" INTEGER NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "brand" "Brand",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBrandSubscription" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,

    CONSTRAINT "UserBrandSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineageNode" (
    "id" TEXT NOT NULL,
    "visibility" "LineageVisibility" NOT NULL DEFAULT 'PUBLIC',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "LineageNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineageRelationship" (
    "id" TEXT NOT NULL,
    "type" "LineageRelationType" NOT NULL,
    "description" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fromNodeId" TEXT NOT NULL,
    "toNodeId" TEXT NOT NULL,

    CONSTRAINT "LineageRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waiver" (
    "id" TEXT NOT NULL,
    "type" "WaiverType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "brand" "Brand",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT,
    "tournamentId" TEXT,

    CONSTRAINT "Waiver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaiverSignature" (
    "id" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "waiverId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "signedOnBehalfOfId" TEXT,

    CONSTRAINT "WaiverSignature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "type" "CertificationType" NOT NULL,
    "status" "CertificationStatus" NOT NULL DEFAULT 'ACTIVE',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "certificateNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "courseId" TEXT,
    "issuedById" TEXT,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentAtom" (
    "id" TEXT NOT NULL,
    "canonicalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "ContentAtomStatus" NOT NULL DEFAULT 'INBOX',
    "hook" TEXT,
    "promise" TEXT,
    "proof" TEXT,
    "cta" TEXT,
    "oneSentenceValue" TEXT,
    "teachingTruth" TEXT,
    "longFormCopy" TEXT,
    "curriculumExtract" JSONB,
    "videoExtract" JSONB,
    "siteTargets" "Brand"[],
    "channelTargets" "ContentChannel"[],
    "qualityScore" INTEGER,
    "sourceAssets" TEXT[],
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "disciplineId" TEXT,
    "styleId" TEXT,
    "organizationId" TEXT,

    CONSTRAINT "ContentAtom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentVariant" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "channel" "ContentChannel" NOT NULL,
    "status" "ContentVariantStatus" NOT NULL DEFAULT 'DRAFT',
    "publicTitle" TEXT,
    "publicSlug" TEXT,
    "renderedCopy" TEXT,
    "excerpt" TEXT,
    "cta" TEXT,
    "thumbnailUrl" TEXT,
    "videoUrl" TEXT,
    "voiceNotes" TEXT,
    "meta" JSONB,
    "publishDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "atomId" TEXT NOT NULL,

    CONSTRAINT "ContentVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentTask" (
    "id" TEXT NOT NULL,
    "type" "ContentTaskType" NOT NULL,
    "title" TEXT NOT NULL,
    "status" "ContentTaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "atomId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "dependsOnId" TEXT,

    CONSTRAINT "ContentTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentPublication" (
    "id" TEXT NOT NULL,
    "brand" "Brand" NOT NULL,
    "channel" "ContentChannel" NOT NULL,
    "platformPostId" TEXT,
    "publicUrl" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checksum" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atomId" TEXT NOT NULL,
    "variantId" TEXT,

    CONSTRAINT "ContentPublication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Passport_userId_key" ON "Passport"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DirectoryProfile_userId_key" ON "DirectoryProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_inviteCode_key" ON "Organization"("inviteCode");

-- CreateIndex
CREATE INDEX "Organization_brand_idx" ON "Organization"("brand");

-- CreateIndex
CREATE INDEX "Organization_ownerId_idx" ON "Organization"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_brand_slug_key" ON "Organization"("brand", "slug");

-- CreateIndex
CREATE INDEX "Discipline_brand_idx" ON "Discipline"("brand");

-- CreateIndex
CREATE UNIQUE INDEX "Discipline_code_brand_key" ON "Discipline"("code", "brand");

-- CreateIndex
CREATE UNIQUE INDEX "Discipline_name_brand_key" ON "Discipline"("name", "brand");

-- CreateIndex
CREATE INDEX "RankSystem_disciplineId_idx" ON "RankSystem"("disciplineId");

-- CreateIndex
CREATE INDEX "RankSystem_brand_idx" ON "RankSystem"("brand");

-- CreateIndex
CREATE UNIQUE INDEX "RankSystem_disciplineId_name_brand_key" ON "RankSystem"("disciplineId", "name", "brand");

-- CreateIndex
CREATE INDEX "Rank_rankSystemId_idx" ON "Rank"("rankSystemId");

-- CreateIndex
CREATE INDEX "Rank_brand_idx" ON "Rank"("brand");

-- CreateIndex
CREATE UNIQUE INDEX "Rank_rankSystemId_sortOrder_key" ON "Rank"("rankSystemId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Rank_rankSystemId_name_key" ON "Rank"("rankSystemId", "name");

-- CreateIndex
CREATE INDEX "MembershipRoleAssignment_membershipId_idx" ON "MembershipRoleAssignment"("membershipId");

-- CreateIndex
CREATE INDEX "MembershipRoleAssignment_roleId_idx" ON "MembershipRoleAssignment"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "MembershipRoleAssignment_membershipId_roleId_key" ON "MembershipRoleAssignment"("membershipId", "roleId");

-- CreateIndex
CREATE INDEX "Role_brand_idx" ON "Role"("brand");

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_brand_key" ON "Role"("code", "brand");

-- CreateIndex
CREATE INDEX "RankAward_userId_awardedAt_idx" ON "RankAward"("userId", "awardedAt");

-- CreateIndex
CREATE INDEX "RankAward_rankId_idx" ON "RankAward"("rankId");

-- CreateIndex
CREATE UNIQUE INDEX "RankAward_userId_rankId_key" ON "RankAward"("userId", "rankId");

-- CreateIndex
CREATE INDEX "CourseEnrollment_courseId_idx" ON "CourseEnrollment"("courseId");

-- CreateIndex
CREATE INDEX "CourseEnrollment_userId_idx" ON "CourseEnrollment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseEnrollment_userId_courseId_key" ON "CourseEnrollment"("userId", "courseId");

-- CreateIndex
CREATE INDEX "CurriculumItemCompletion_curriculumItemId_idx" ON "CurriculumItemCompletion"("curriculumItemId");

-- CreateIndex
CREATE UNIQUE INDEX "CurriculumItemCompletion_enrollmentId_curriculumItemId_key" ON "CurriculumItemCompletion"("enrollmentId", "curriculumItemId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentDiscipline_tournamentId_disciplineId_key" ON "TournamentDiscipline"("tournamentId", "disciplineId");

-- CreateIndex
CREATE INDEX "Division_tournamentDisciplineId_sortOrder_idx" ON "Division"("tournamentDisciplineId", "sortOrder");

-- CreateIndex
CREATE INDEX "Division_roleRequiredId_idx" ON "Division"("roleRequiredId");

-- CreateIndex
CREATE INDEX "Registration_tournamentId_status_idx" ON "Registration"("tournamentId", "status");

-- CreateIndex
CREATE INDEX "Registration_userId_idx" ON "Registration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_tournamentId_userId_key" ON "Registration"("tournamentId", "userId");

-- CreateIndex
CREATE INDEX "RegistrationEntry_tournamentRoleId_idx" ON "RegistrationEntry"("tournamentRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationEntry_registrationId_divisionId_tournamentRoleI_key" ON "RegistrationEntry"("registrationId", "divisionId", "tournamentRoleId");

-- CreateIndex
CREATE INDEX "TournamentRole_brand_idx" ON "TournamentRole"("brand");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentRole_code_brand_key" ON "TournamentRole"("code", "brand");

-- CreateIndex
CREATE INDEX "TournamentStaffAssignment_tournamentId_idx" ON "TournamentStaffAssignment"("tournamentId");

-- CreateIndex
CREATE INDEX "TournamentStaffAssignment_userId_idx" ON "TournamentStaffAssignment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentStaffAssignment_tournamentId_userId_tournamentRol_key" ON "TournamentStaffAssignment"("tournamentId", "userId", "tournamentRoleId", "divisionId");

-- CreateIndex
CREATE INDEX "GamificationEventType_brand_idx" ON "GamificationEventType"("brand");

-- CreateIndex
CREATE UNIQUE INDEX "GamificationEventType_code_brand_key" ON "GamificationEventType"("code", "brand");

-- CreateIndex
CREATE INDEX "SubscriptionTier_brand_level_idx" ON "SubscriptionTier"("brand", "level");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionTier_code_brand_key" ON "SubscriptionTier"("code", "brand");

-- CreateIndex
CREATE INDEX "UserBrandSubscription_brand_status_idx" ON "UserBrandSubscription"("brand", "status");

-- CreateIndex
CREATE INDEX "UserBrandSubscription_userId_idx" ON "UserBrandSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBrandSubscription_userId_brand_key" ON "UserBrandSubscription"("userId", "brand");

-- CreateIndex
CREATE UNIQUE INDEX "LineageNode_slug_key" ON "LineageNode"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LineageNode_userId_key" ON "LineageNode"("userId");

-- CreateIndex
CREATE INDEX "LineageRelationship_fromNodeId_idx" ON "LineageRelationship"("fromNodeId");

-- CreateIndex
CREATE INDEX "LineageRelationship_toNodeId_idx" ON "LineageRelationship"("toNodeId");

-- CreateIndex
CREATE UNIQUE INDEX "LineageRelationship_fromNodeId_toNodeId_type_key" ON "LineageRelationship"("fromNodeId", "toNodeId", "type");

-- CreateIndex
CREATE INDEX "Waiver_brand_type_isActive_idx" ON "Waiver"("brand", "type", "isActive");

-- CreateIndex
CREATE INDEX "Waiver_organizationId_idx" ON "Waiver"("organizationId");

-- CreateIndex
CREATE INDEX "Waiver_tournamentId_idx" ON "Waiver"("tournamentId");

-- CreateIndex
CREATE INDEX "WaiverSignature_userId_idx" ON "WaiverSignature"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WaiverSignature_waiverId_userId_key" ON "WaiverSignature"("waiverId", "userId");

-- CreateIndex
CREATE INDEX "Certification_userId_type_status_idx" ON "Certification"("userId", "type", "status");

-- CreateIndex
CREATE INDEX "Certification_organizationId_idx" ON "Certification"("organizationId");

-- CreateIndex
CREATE INDEX "Certification_courseId_idx" ON "Certification"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentAtom_canonicalId_key" ON "ContentAtom"("canonicalId");

-- CreateIndex
CREATE INDEX "ContentAtom_status_idx" ON "ContentAtom"("status");

-- CreateIndex
CREATE INDEX "ContentAtom_createdById_idx" ON "ContentAtom"("createdById");

-- CreateIndex
CREATE INDEX "ContentAtom_disciplineId_idx" ON "ContentAtom"("disciplineId");

-- CreateIndex
CREATE INDEX "ContentAtom_organizationId_idx" ON "ContentAtom"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentAtom_slug_key" ON "ContentAtom"("slug");

-- CreateIndex
CREATE INDEX "ContentVariant_brand_channel_status_idx" ON "ContentVariant"("brand", "channel", "status");

-- CreateIndex
CREATE INDEX "ContentVariant_atomId_idx" ON "ContentVariant"("atomId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentVariant_atomId_brand_channel_key" ON "ContentVariant"("atomId", "brand", "channel");

-- CreateIndex
CREATE INDEX "ContentTask_atomId_status_idx" ON "ContentTask"("atomId", "status");

-- CreateIndex
CREATE INDEX "ContentTask_assigneeId_status_idx" ON "ContentTask"("assigneeId", "status");

-- CreateIndex
CREATE INDEX "ContentTask_dueAt_idx" ON "ContentTask"("dueAt");

-- CreateIndex
CREATE INDEX "ContentPublication_brand_channel_idx" ON "ContentPublication"("brand", "channel");

-- CreateIndex
CREATE INDEX "ContentPublication_atomId_idx" ON "ContentPublication"("atomId");

-- CreateIndex
CREATE INDEX "ContentPublication_publishedAt_idx" ON "ContentPublication"("publishedAt");

-- CreateIndex
CREATE INDEX "Course_brand_organizationId_idx" ON "Course"("brand", "organizationId");

-- CreateIndex
CREATE INDEX "Course_disciplineId_idx" ON "Course"("disciplineId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_brand_organizationId_slug_key" ON "Course"("brand", "organizationId", "slug");

-- CreateIndex
CREATE INDEX "GamificationEvent_brand_eventTypeId_idx" ON "GamificationEvent"("brand", "eventTypeId");

-- CreateIndex
CREATE INDEX "GamificationEvent_rankAwardId_idx" ON "GamificationEvent"("rankAwardId");

-- CreateIndex
CREATE INDEX "GamificationEvent_courseId_idx" ON "GamificationEvent"("courseId");

-- CreateIndex
CREATE INDEX "Membership_brand_organizationId_idx" ON "Membership"("brand", "organizationId");

-- CreateIndex
CREATE INDEX "Membership_organizationId_status_idx" ON "Membership"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Membership_styleId_idx" ON "Membership"("styleId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_organizationId_disciplineId_key" ON "Membership"("userId", "organizationId", "disciplineId");

-- CreateIndex
CREATE INDEX "Style_disciplineId_status_idx" ON "Style"("disciplineId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Style_disciplineId_code_key" ON "Style"("disciplineId", "code");

-- CreateIndex
CREATE INDEX "Tournament_brand_startDate_idx" ON "Tournament"("brand", "startDate");

-- AddForeignKey
ALTER TABLE "Passport" ADD CONSTRAINT "Passport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryProfile" ADD CONSTRAINT "DirectoryProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationDiscipline" ADD CONSTRAINT "OrganizationDiscipline_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationDiscipline" ADD CONSTRAINT "OrganizationDiscipline_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankSystem" ADD CONSTRAINT "RankSystem_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rank" ADD CONSTRAINT "Rank_rankSystemId_fkey" FOREIGN KEY ("rankSystemId") REFERENCES "RankSystem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "Rank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipRoleAssignment" ADD CONSTRAINT "MembershipRoleAssignment_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipRoleAssignment" ADD CONSTRAINT "MembershipRoleAssignment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankAward" ADD CONSTRAINT "RankAward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankAward" ADD CONSTRAINT "RankAward_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "Rank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankAward" ADD CONSTRAINT "RankAward_awardedById_fkey" FOREIGN KEY ("awardedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "Rank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumItemCompletion" ADD CONSTRAINT "CurriculumItemCompletion_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "CourseEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumItemCompletion" ADD CONSTRAINT "CurriculumItemCompletion_curriculumItemId_fkey" FOREIGN KEY ("curriculumItemId") REFERENCES "CurriculumItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumItemCompletion" ADD CONSTRAINT "CurriculumItemCompletion_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentDiscipline" ADD CONSTRAINT "TournamentDiscipline_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentDiscipline" ADD CONSTRAINT "TournamentDiscipline_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Division" ADD CONSTRAINT "Division_tournamentDisciplineId_fkey" FOREIGN KEY ("tournamentDisciplineId") REFERENCES "TournamentDiscipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Division" ADD CONSTRAINT "Division_roleRequiredId_fkey" FOREIGN KEY ("roleRequiredId") REFERENCES "TournamentRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Division" ADD CONSTRAINT "Division_rankMinId_fkey" FOREIGN KEY ("rankMinId") REFERENCES "Rank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Division" ADD CONSTRAINT "Division_rankMaxId_fkey" FOREIGN KEY ("rankMaxId") REFERENCES "Rank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationEntry" ADD CONSTRAINT "RegistrationEntry_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationEntry" ADD CONSTRAINT "RegistrationEntry_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationEntry" ADD CONSTRAINT "RegistrationEntry_tournamentRoleId_fkey" FOREIGN KEY ("tournamentRoleId") REFERENCES "TournamentRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationEntry" ADD CONSTRAINT "RegistrationEntry_representingMembershipId_fkey" FOREIGN KEY ("representingMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentStaffAssignment" ADD CONSTRAINT "TournamentStaffAssignment_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentStaffAssignment" ADD CONSTRAINT "TournamentStaffAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentStaffAssignment" ADD CONSTRAINT "TournamentStaffAssignment_tournamentRoleId_fkey" FOREIGN KEY ("tournamentRoleId") REFERENCES "TournamentRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentStaffAssignment" ADD CONSTRAINT "TournamentStaffAssignment_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamificationEvent" ADD CONSTRAINT "GamificationEvent_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "GamificationEventType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamificationEvent" ADD CONSTRAINT "GamificationEvent_rankAwardId_fkey" FOREIGN KEY ("rankAwardId") REFERENCES "RankAward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamificationEvent" ADD CONSTRAINT "GamificationEvent_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamificationEvent" ADD CONSTRAINT "GamificationEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamificationEvent" ADD CONSTRAINT "GamificationEvent_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Style" ADD CONSTRAINT "Style_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Style" ADD CONSTRAINT "Style_parentStyleId_fkey" FOREIGN KEY ("parentStyleId") REFERENCES "Style"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Style" ADD CONSTRAINT "Style_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Style" ADD CONSTRAINT "Style_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBrandSubscription" ADD CONSTRAINT "UserBrandSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBrandSubscription" ADD CONSTRAINT "UserBrandSubscription_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "SubscriptionTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageNode" ADD CONSTRAINT "LineageNode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageRelationship" ADD CONSTRAINT "LineageRelationship_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "LineageNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineageRelationship" ADD CONSTRAINT "LineageRelationship_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "LineageNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waiver" ADD CONSTRAINT "Waiver_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waiver" ADD CONSTRAINT "Waiver_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaiverSignature" ADD CONSTRAINT "WaiverSignature_waiverId_fkey" FOREIGN KEY ("waiverId") REFERENCES "Waiver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaiverSignature" ADD CONSTRAINT "WaiverSignature_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaiverSignature" ADD CONSTRAINT "WaiverSignature_signedOnBehalfOfId_fkey" FOREIGN KEY ("signedOnBehalfOfId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentAtom" ADD CONSTRAINT "ContentAtom_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentAtom" ADD CONSTRAINT "ContentAtom_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentAtom" ADD CONSTRAINT "ContentAtom_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentAtom" ADD CONSTRAINT "ContentAtom_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentVariant" ADD CONSTRAINT "ContentVariant_atomId_fkey" FOREIGN KEY ("atomId") REFERENCES "ContentAtom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentTask" ADD CONSTRAINT "ContentTask_atomId_fkey" FOREIGN KEY ("atomId") REFERENCES "ContentAtom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentTask" ADD CONSTRAINT "ContentTask_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentTask" ADD CONSTRAINT "ContentTask_dependsOnId_fkey" FOREIGN KEY ("dependsOnId") REFERENCES "ContentTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPublication" ADD CONSTRAINT "ContentPublication_atomId_fkey" FOREIGN KEY ("atomId") REFERENCES "ContentAtom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPublication" ADD CONSTRAINT "ContentPublication_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ContentVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
