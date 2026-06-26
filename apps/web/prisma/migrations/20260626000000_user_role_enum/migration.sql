-- SESSION_0449 — Type-harden User.role from free-text String to a typed UserRole enum.
--
-- Prisma's auto-generated diff for a String->enum change DROPS + recreates the column
-- (data loss: every role resets to the default 'user', wiping the platform admins).
-- This migration is hand-authored to convert IN PLACE with a USING cast that preserves
-- every existing value. All stored values ('user', 'admin') are valid enum labels, so the
-- cast is lossless. The enum intentionally EXCLUDES `lineage_tree_admin` (a synthetic UI
-- label derived from the LineageTreeAccess table, never stored on User.role) and `guest`
-- (the deny-by-default fallback returned in code, never stored).

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin', 'tournament_director');

-- AlterTable — convert role String -> UserRole in place, preserving existing values.
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING ("role"::"UserRole");
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'user';
