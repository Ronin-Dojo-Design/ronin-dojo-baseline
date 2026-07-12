-- ADR 0046 — Technique ownership: org-nullable (= the author's school) + authored-by Passport + variants.
--
-- HAND-AUTHORED + SHADOW-REPLAYED. Do NOT `prisma migrate dev` this: all worktrees share ONE local DB
-- (ronindojo_prodsnap) and `migrate dev` would reset it. This file was replayed clean-room on a throwaway
-- DB (`migrate deploy`) before touching the dev DB, and auto-applies to Neon prod via the `prebuild` hook.
--
-- Additive / backward-safe: existing techniques keep their org, `authorPassportId` stays NULL, and
-- `isFeatured` defaults false — so every existing row is covered by the canonical partial unique index
-- below with zero data migration.

-- 1. Drop the old composite unique. Prisma's `@@unique` is a unique INDEX (not a table constraint), so
--    this is DROP INDEX. A plain composite over a nullable author column cannot express the
--    canonical-vs-authored split (Postgres treats NULLs as distinct → duplicate canonical rows would slip
--    through), so it is replaced by two PARTIAL unique indexes at the end of this migration.
DROP INDEX "Technique_brand_organizationId_slug_key";

-- 2. `organizationId` becomes nullable — it now means the author's SCHOOL (null = profile-only, ungrouped).
--    The existing FK (Technique_organizationId_fkey, ON DELETE CASCADE) is unchanged.
ALTER TABLE "Technique" ALTER COLUMN "organizationId" DROP NOT NULL;

-- 3. Ownership + promotion columns. `authorPassportId` NULL = canonical / org-seeded (the existing
--    library); non-null = a member-authored technique. `isFeatured` is flipped by a staff "promote to
--    library" action (ADR 0046 D4).
ALTER TABLE "Technique" ADD COLUMN "authorPassportId" TEXT;
ALTER TABLE "Technique" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- 4. FK author → Passport. ON DELETE SET NULL: deleting a person un-authors (never deletes) the row.
ALTER TABLE "Technique"
  ADD CONSTRAINT "Technique_authorPassportId_fkey"
  FOREIGN KEY ("authorPassportId") REFERENCES "Passport"("id")
  ON UPDATE CASCADE ON DELETE SET NULL;

-- 5. Query index for profile-curriculum reads (`where authorPassportId = me`) and the FK.
CREATE INDEX "Technique_authorPassportId_idx" ON "Technique"("authorPassportId");

-- 6. Two PARTIAL unique indexes replacing the dropped composite (Prisma cannot express a partial WHERE
--    in `@@unique`, so these are DB-managed — the model relies on this SQL and intentionally omits them).
--    canonical (author NULL): one row per (brand, organizationId, slug).
CREATE UNIQUE INDEX "Technique_canonical_slug_key"
  ON "Technique"("brand", "organizationId", "slug")
  WHERE "authorPassportId" IS NULL;
--    authored (author NOT NULL): one row per (brand, authorPassportId, slug) — keyed off the AUTHOR, not
--    the org, so two authors CAN share (org, slug) = variants, but one author cannot duplicate their own
--    (brand, slug).
CREATE UNIQUE INDEX "Technique_authored_slug_key"
  ON "Technique"("brand", "authorPassportId", "slug")
  WHERE "authorPassportId" IS NOT NULL;
