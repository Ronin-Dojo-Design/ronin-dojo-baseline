-- SESSION_0487 (petey-plan-0477 Slice V1 · ADR 0035 Amendment 1 / ADR 0036) — Belt-verification on-ramp.
-- Add a claim-type discriminant so `PassportClaimRequest` carries an existing-member belt promotion
-- (RANK_PROMOTION) alongside the identity claim (IDENTITY — the original ADR 0036 account→Passport flow).
-- Additive + non-breaking: a new enum + a NOT NULL column DEFAULTed to IDENTITY, so every existing row
-- backfills to IDENTITY with no data migration. The finalize branch (Slice V3) reads `type` to run only
-- the rank-mint branch for a promotion; no UNVERIFIED RankAward is ever created (B1, ADR 0035 §5).
-- Prod (Neon) auto-applies this on deploy via the `prebuild → prisma migrate deploy` hook.

-- CreateEnum
CREATE TYPE "PassportClaimType" AS ENUM ('IDENTITY', 'RANK_PROMOTION');

-- AlterTable
ALTER TABLE "PassportClaimRequest" ADD COLUMN     "type" "PassportClaimType" NOT NULL DEFAULT 'IDENTITY';
