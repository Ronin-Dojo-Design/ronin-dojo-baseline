-- CreateEnum
CREATE TYPE "BookmarkSubjectType" AS ENUM ('TOOL', 'PERSON', 'ORGANIZATION', 'TECHNIQUE', 'POST', 'TREE');

-- AlterTable
ALTER TABLE "Bookmark" ADD COLUMN     "lineageTreeId" TEXT,
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "passportId" TEXT,
ADD COLUMN     "postId" TEXT,
ADD COLUMN     "subjectType" "BookmarkSubjectType" NOT NULL DEFAULT 'TOOL',
ADD COLUMN     "techniqueId" TEXT,
ALTER COLUMN "toolId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Bookmark_userId_subjectType_idx" ON "Bookmark"("userId", "subjectType");

-- CreateIndex
CREATE INDEX "Bookmark_passportId_idx" ON "Bookmark"("passportId");

-- CreateIndex
CREATE INDEX "Bookmark_organizationId_idx" ON "Bookmark"("organizationId");

-- CreateIndex
CREATE INDEX "Bookmark_techniqueId_idx" ON "Bookmark"("techniqueId");

-- CreateIndex
CREATE INDEX "Bookmark_postId_idx" ON "Bookmark"("postId");

-- CreateIndex
CREATE INDEX "Bookmark_lineageTreeId_idx" ON "Bookmark"("lineageTreeId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_passportId_key" ON "Bookmark"("userId", "passportId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_organizationId_key" ON "Bookmark"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_techniqueId_key" ON "Bookmark"("userId", "techniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_postId_key" ON "Bookmark"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_lineageTreeId_key" ON "Bookmark"("userId", "lineageTreeId");

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "Passport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_techniqueId_fkey" FOREIGN KEY ("techniqueId") REFERENCES "Technique"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_lineageTreeId_fkey" FOREIGN KEY ("lineageTreeId") REFERENCES "LineageTree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

