-- SESSION_0539 — Additive `Rank.beltFamily` (BeltFamily enum) — the belt-family design
-- signal that drives the BeltSwatch rank-bar treatment (bar color + outline). Render-layer
-- only, never rank authority. Nullable => additive; non-BJJ / unseeded ranks stay null and
-- the component degrades gracefully. Hand-authored + shadow-replay validated (shared-local-DB
-- discipline: `migrate dev` is BANNED here — it resets the shared local DB; see the migrate-dev
-- reset trap and docs/runbooks/database/schema-migration.md). Applied via `migrate deploy`.
--
-- Backfill: prod auto-applies migrations (prebuild `migrate deploy`) but does NOT run seeds, so
-- the migration itself must populate `beltFamily` + `degree` for existing IBJJF ranks. Scoped to
-- the IBJJF RankSystem BY NAME (seed SoT) + keyed on `shortName`; other rank systems (which reuse
-- shortNames like W/BL/1D) are untouched. Idempotent — re-running sets the same values. `degree`
-- is derived from the trailing digit of `shortName` (W0..W4 => 0..4, BK1..BK6 => 1..6, etc.).

-- CreateEnum
CREATE TYPE "BeltFamily" AS ENUM ('COLORED', 'BLACK', 'CORAL', 'RED');

-- AlterTable
ALTER TABLE "Rank" ADD COLUMN "beltFamily" "BeltFamily";

-- Backfill — COLORED: white/blue/purple/brown base + 1..4 stripes (degree = trailing digit).
UPDATE "Rank" r
SET "beltFamily" = 'COLORED',
    "degree"     = CAST(substring(r."shortName" FROM '[0-9]+$') AS INTEGER)
FROM "RankSystem" rs
WHERE r."rankSystemId" = rs.id
  AND rs.name = 'IBJJF Belt System'
  AND r."shortName" ~ '^(W|BL|P|BR)[0-4]$';

-- Backfill — BLACK: base black belt (BK0, where present) + 1st..6th degree (degree = trailing digit).
UPDATE "Rank" r
SET "beltFamily" = 'BLACK',
    "degree"     = CAST(substring(r."shortName" FROM '[0-9]+$') AS INTEGER)
FROM "RankSystem" rs
WHERE r."rankSystemId" = rs.id
  AND rs.name = 'IBJJF Belt System'
  AND r."shortName" ~ '^BK[0-6]$';

-- Backfill — CORAL: 7th (red/black) + 8th (red/white) degree.
UPDATE "Rank" r
SET "beltFamily" = 'CORAL',
    "degree"     = CAST(substring(r."shortName" FROM '[0-9]+$') AS INTEGER)
FROM "RankSystem" rs
WHERE r."rankSystemId" = rs.id
  AND rs.name = 'IBJJF Belt System'
  AND r."shortName" IN ('CB7', 'CB8');

-- Backfill — RED: 9th + 10th degree.
UPDATE "Rank" r
SET "beltFamily" = 'RED',
    "degree"     = CAST(substring(r."shortName" FROM '[0-9]+$') AS INTEGER)
FROM "RankSystem" rs
WHERE r."rankSystemId" = rs.id
  AND rs.name = 'IBJJF Belt System'
  AND r."shortName" IN ('R9', 'R10');
