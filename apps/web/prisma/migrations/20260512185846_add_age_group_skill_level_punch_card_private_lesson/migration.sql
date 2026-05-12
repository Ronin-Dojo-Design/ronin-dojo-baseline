-- AlterEnum
ALTER TYPE "MembershipStatus" ADD VALUE 'CANCELLED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PricingModel" ADD VALUE 'PUNCH_CARD';
ALTER TYPE "PricingModel" ADD VALUE 'PRIVATE_LESSON';

-- AlterTable
ALTER TABLE "PricingPlan" ADD COLUMN     "bonusSessions" INTEGER,
ADD COLUMN     "isPrivateLesson" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "punchCardSize" INTEGER;

-- CreateTable
CREATE TABLE "AgeGroup" (
    "id" TEXT NOT NULL,
    "brand" "Brand",
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "ageMin" INTEGER NOT NULL,
    "ageMax" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgeGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillLevel" (
    "id" TEXT NOT NULL,
    "brand" "Brand",
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramAgeGroup" (
    "programId" TEXT NOT NULL,
    "ageGroupId" TEXT NOT NULL,

    CONSTRAINT "ProgramAgeGroup_pkey" PRIMARY KEY ("programId","ageGroupId")
);

-- CreateTable
CREATE TABLE "ProgramSkillLevel" (
    "programId" TEXT NOT NULL,
    "skillLevelId" TEXT NOT NULL,

    CONSTRAINT "ProgramSkillLevel_pkey" PRIMARY KEY ("programId","skillLevelId")
);

-- CreateIndex
CREATE INDEX "AgeGroup_brand_idx" ON "AgeGroup"("brand");

-- CreateIndex
CREATE UNIQUE INDEX "AgeGroup_code_brand_key" ON "AgeGroup"("code", "brand");

-- CreateIndex
CREATE INDEX "SkillLevel_brand_idx" ON "SkillLevel"("brand");

-- CreateIndex
CREATE UNIQUE INDEX "SkillLevel_code_brand_key" ON "SkillLevel"("code", "brand");

-- AddForeignKey
ALTER TABLE "ProgramAgeGroup" ADD CONSTRAINT "ProgramAgeGroup_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramAgeGroup" ADD CONSTRAINT "ProgramAgeGroup_ageGroupId_fkey" FOREIGN KEY ("ageGroupId") REFERENCES "AgeGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramSkillLevel" ADD CONSTRAINT "ProgramSkillLevel_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramSkillLevel" ADD CONSTRAINT "ProgramSkillLevel_skillLevelId_fkey" FOREIGN KEY ("skillLevelId") REFERENCES "SkillLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
