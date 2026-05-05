/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `DirectoryProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MatchResult" ADD VALUE 'WIN_FORFEIT';
ALTER TYPE "MatchResult" ADD VALUE 'WIN_OTHER';

-- AlterTable
ALTER TABLE "DirectoryProfile" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "DirectoryProfile_slug_key" ON "DirectoryProfile"("slug");
