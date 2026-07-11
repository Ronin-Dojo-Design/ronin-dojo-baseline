-- SESSION_0525 — technique freemium (locked-preview gating).
--
-- Additive, non-destructive: every existing Technique defaults to `isPremium = true`
-- (most curriculum content is gated). A follow-up seed flips a free-preview subset to
-- false (3 of Brian's + 3 of Bob's). No existing row is dropped or reset; the column is
-- NOT NULL with a DEFAULT so backfill is implicit and prod applies it during `prebuild`.

ALTER TABLE "Technique" ADD COLUMN "isPremium" BOOLEAN NOT NULL DEFAULT true;
