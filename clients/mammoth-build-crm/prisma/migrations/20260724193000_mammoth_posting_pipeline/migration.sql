-- Mammoth posting pipeline (SESSION_0687): templates -> DRAFT -> APPROVAL, never auto-post.
--
-- Hand-authored (NOT auto-diffed) per this app's convention (see
-- 20260628130000_mammoth_better_auth/migration.sql) — `prisma migrate dev` is banned against the
-- shared local DB, and this migration was authored without a reachable Postgres instance. Purely
-- additive: one new table (PostingDraft) + two new enums; no existing columns touched, no data
-- moved. `migration.sql` mirrors exactly what `prisma migrate diff` would emit for the schema.prisma
-- delta (field/constraint names follow the standard "<Model>_pkey" / "<Model>_<col>_fkey" /
-- "<Model>_<col>_idx" convention already used by this app's other migrations).
--
-- MERGE-OWNER STEP: run `bunx prisma migrate deploy` (or `prisma migrate status` to confirm this
-- file registers) against the real `mammoth_dev` / Neon target before/at merge — this lane had no
-- reachable local Postgres to apply + verify it directly (SESSION_0687.md "## Verification").

-- CreateEnum
CREATE TYPE "PostingPlatform" AS ENUM ('facebook', 'instagram', 'google_business_profile');

-- CreateEnum
CREATE TYPE "PostingStatus" AS ENUM ('draft', 'approved', 'posted');

-- CreateTable
CREATE TABLE "PostingDraft" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "platform" "PostingPlatform" NOT NULL,
    "templateKey" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "PostingStatus" NOT NULL DEFAULT 'draft',
    "scheduledFor" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostingDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PostingDraft_status_idx" ON "PostingDraft"("status");

-- CreateIndex
CREATE INDEX "PostingDraft_projectId_idx" ON "PostingDraft"("projectId");

-- AddForeignKey
ALTER TABLE "PostingDraft" ADD CONSTRAINT "PostingDraft_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostingDraft" ADD CONSTRAINT "PostingDraft_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "TeamMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
