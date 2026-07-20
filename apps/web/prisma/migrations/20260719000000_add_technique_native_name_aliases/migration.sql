-- SESSION_0579 (G-022 Lane C) — grappling curriculum data at scale.
--
-- Additive, non-destructive: adds an optional native-language name (Japanese for Judo's
-- Kodokan throws today; any discipline's native terminology going forward) and an optional
-- alias list (common English translations/spelling variants). Both nullable/default so
-- existing rows are unaffected and prod applies this during `prebuild -> migrate deploy`.
--
-- `aliases` follows the existing `String[]` idiom already used on Technique for
-- `teachingCues`/`commonErrors` (TEXT[] with a NOT NULL DEFAULT '{}', never nullable array).

ALTER TABLE "Technique" ADD COLUMN "nativeName" TEXT;
ALTER TABLE "Technique" ADD COLUMN "aliases" TEXT[] NOT NULL DEFAULT '{}';
