-- SESSION_0592 (L3, G-024) — admins-only feature-widget → planning-ledger DB inbox.
--
-- Additive, non-destructive: two new enums + one new table (`PlanningIntake`) + its indexes and
-- the nullable `createdById -> User` FK. No existing table is touched, so prod applies this cleanly
-- during `prebuild -> migrate deploy`.
--
-- Hand-authored (never `migrate dev` — worktrees share ONE local DB). Generated via
-- `prisma migrate diff --script` then trimmed: the raw diff also emitted a `DROP TABLE
-- "playing_with_neon"` from pre-existing local-DB drift (a stray Neon demo table absent from the
-- schema) — that drop is deliberately EXCLUDED here; it is unrelated to this lane and must not run
-- against prod.

-- CreateEnum
CREATE TYPE "PlanningIntakeCategory" AS ENUM ('FEATURE', 'BUG', 'DESIGN', 'NOTE');

-- CreateEnum
CREATE TYPE "PlanningIntakeStatus" AS ENUM ('NEW', 'TRIAGED', 'PROMOTED', 'DISMISSED');

-- CreateTable
CREATE TABLE "PlanningIntake" (
    "id" TEXT NOT NULL,
    "category" "PlanningIntakeCategory" NOT NULL,
    "body" TEXT NOT NULL,
    "imageUrls" TEXT[],
    "status" "PlanningIntakeStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,

    CONSTRAINT "PlanningIntake_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlanningIntake_status_idx" ON "PlanningIntake"("status");

-- CreateIndex
CREATE INDEX "PlanningIntake_category_idx" ON "PlanningIntake"("category");

-- CreateIndex
CREATE INDEX "PlanningIntake_createdById_idx" ON "PlanningIntake"("createdById");

-- AddForeignKey
ALTER TABLE "PlanningIntake" ADD CONSTRAINT "PlanningIntake_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
