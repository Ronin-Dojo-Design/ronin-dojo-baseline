-- Fork F2 (PL-027, SESSION_0705): affirmative publicity opt-in for social celebration posts.
-- Additive column, DEFAULT OFF — existing rows stay non-consenting; only an explicit
-- PassportEditor opt-in flips it.

-- AlterTable
ALTER TABLE "Passport" ADD COLUMN     "allowSocialCelebration" BOOLEAN NOT NULL DEFAULT false;
