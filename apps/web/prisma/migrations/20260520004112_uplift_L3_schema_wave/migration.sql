-- L3 upstream schema wave: tool tiers, archived statuses, report enum, bookmarks.

-- CreateEnum
CREATE TYPE "ToolTier" AS ENUM ('Free', 'Standard', 'Premium');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('BrokenLink', 'WrongCategory', 'Outdated', 'Other', 'Feedback');

-- AlterEnum
ALTER TYPE "ToolStatus" ADD VALUE IF NOT EXISTS 'Rejected' AFTER 'Pending';
ALTER TYPE "ToolStatus" ADD VALUE IF NOT EXISTS 'Deleted' AFTER 'Published';

-- AlterTable: keep legacy isFeatured for this lane while adding upstream tier data.
ALTER TABLE "Tool" ADD COLUMN "tier" "ToolTier" NOT NULL DEFAULT 'Free';
UPDATE "Tool" SET "tier" = 'Premium' WHERE "isFeatured" = true;
ALTER TABLE "Tool" ADD COLUMN "tierPriority" INTEGER
GENERATED ALWAYS AS (CASE WHEN "tier" = 'Premium' THEN 0 ELSE 1 END) STORED;
ALTER TABLE "Tool" ALTER COLUMN "tierPriority" SET NOT NULL;

-- AlterTable: restore the upstream report enum, preserving Ronin feedback rows.
ALTER TABLE "Report" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Report"
  ALTER COLUMN "type" TYPE "ReportType"
  USING (
    CASE "type"
      WHEN 'Broken Link' THEN 'BrokenLink'::"ReportType"
      WHEN 'BrokenLink' THEN 'BrokenLink'::"ReportType"
      WHEN 'Wrong Category' THEN 'WrongCategory'::"ReportType"
      WHEN 'WrongCategory' THEN 'WrongCategory'::"ReportType"
      WHEN 'Outdated' THEN 'Outdated'::"ReportType"
      WHEN 'Feedback' THEN 'Feedback'::"ReportType"
      ELSE 'Other'::"ReportType"
    END
  );
ALTER TABLE "Report" ALTER COLUMN "type" SET DEFAULT 'Other';

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Tool_tierPriority_publishedAt_idx" ON "Tool"("tierPriority", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_toolId_key" ON "Bookmark"("userId", "toolId");

-- CreateIndex
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");

-- CreateIndex
CREATE INDEX "Bookmark_toolId_idx" ON "Bookmark"("toolId");

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
