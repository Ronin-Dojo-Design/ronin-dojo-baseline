-- SESSION_0493 — Additive nullable `Rank.degree` (grill outcome §5): degree stripes for
-- black-belt ranks (e.g. 8 = 8th degree), data-driven rendering for BeltSwatch / the lineage
-- ancestry timeline. Null = rank has no degree. No backfill; seed/admin data populates it.
-- Hand-authored + verified via `migrate diff` shadow-replay (shared-local-DB discipline;
-- see docs/runbooks/database/schema-migration.md and the SESSION_0487 migrate-dev reset trap).

-- AlterTable
ALTER TABLE "Rank" ADD COLUMN     "degree" INTEGER;
