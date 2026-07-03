-- Add Rank.secondaryColorHex (SESSION_0493, Desi review — coral belt truthfulness)
-- Additive nullable column: second belt color for alternating-panel belts
-- (BJJ coral red/black 7th = #000000, red/white 8th = #FFFFFF; Kodokan red-white Dans).
-- Render-layer only, like Rank.degree — never rank authority. Backfill via
-- scripts/seed-rank-secondary-colors.ts (banked for prod at the push gate).
ALTER TABLE "Rank" ADD COLUMN "secondaryColorHex" TEXT;
