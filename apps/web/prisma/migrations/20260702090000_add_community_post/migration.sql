-- SESSION_0493 — Member community feed (/posts): CommunityPost, a SIBLING of the editorial
-- `Post` (/blog) per ADR 0042 Amendment 1 (no kind-union onto Post). Post-moderation model:
-- rows are PUBLISHED on create, admin can flip to HIDDEN. `createdAt` is the feed sort key
-- (no publishedAt / drafts). Also extends the polymorphic Bookmark contract with the
-- COMMUNITY_POST subject (FK + per-subject unique + lookup index), mirroring the POST wiring
-- from 20260616150339_add_polymorphic_bookmark_subject. The new enum value is not referenced
-- elsewhere in this migration, so ALTER TYPE ... ADD VALUE is transaction-safe.
-- Hand-authored + verified via `migrate diff` shadow-replay (shared-local-DB discipline;
-- see docs/runbooks/database/schema-migration.md and the SESSION_0487 migrate-dev reset trap).

-- CreateEnum
CREATE TYPE "CommunityPostType" AS ENUM ('TECHNIQUE', 'TIP', 'SEMINAR', 'QA');

-- CreateEnum
CREATE TYPE "CommunityPostStatus" AS ENUM ('PUBLISHED', 'HIDDEN');

-- AlterEnum
ALTER TYPE "BookmarkSubjectType" ADD VALUE 'COMMUNITY_POST';

-- AlterTable
ALTER TABLE "Bookmark" ADD COLUMN     "communityPostId" TEXT;

-- CreateTable
CREATE TABLE "CommunityPost" (
    "id" TEXT NOT NULL,
    "type" "CommunityPostType" NOT NULL,
    "title" CITEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "videoUrl" TEXT,
    "imageUrl" TEXT,
    "status" "CommunityPostStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "brand" "Brand" NOT NULL,
    "authorId" TEXT NOT NULL,
    "styleId" TEXT,

    CONSTRAINT "CommunityPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommunityPost_slug_key" ON "CommunityPost"("slug");

-- CreateIndex
CREATE INDEX "CommunityPost_brand_status_createdAt_idx" ON "CommunityPost"("brand", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "CommunityPost_brand_status_type_createdAt_idx" ON "CommunityPost"("brand", "status", "type", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "CommunityPost_authorId_idx" ON "CommunityPost"("authorId");

-- CreateIndex
CREATE INDEX "CommunityPost_styleId_idx" ON "CommunityPost"("styleId");

-- CreateIndex
CREATE INDEX "Bookmark_communityPostId_idx" ON "Bookmark"("communityPostId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_communityPostId_key" ON "Bookmark"("userId", "communityPostId");

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_communityPostId_fkey" FOREIGN KEY ("communityPostId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE SET NULL ON UPDATE CASCADE;
