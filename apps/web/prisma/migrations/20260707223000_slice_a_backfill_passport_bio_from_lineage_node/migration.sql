-- Bio Slice A: fold LineageNode.bio -> Passport.bio (SESSION_0510 TASK_04).
--
-- Data-only backfill (no DDL): both `Passport.bio` and `LineageNode.bio` already
-- exist. Passport.bio is the single source of truth going forward; this migration
-- seeds it from the parallel lineage-only column for the rows that predate the fold.
--
-- Precedence (operator-decided): Passport.bio WINS. Fill NULL/empty passport bios
-- ONLY — never overwrite an existing Passport.bio. `LineageNode.passportId` is
-- @unique NOT NULL, so every node folds cleanly into exactly one Passport.
--
-- Idempotent: re-running is a no-op (the WHERE excludes rows already populated).
-- The `LineageNode.bio` column is intentionally LEFT IN PLACE — its drop is a
-- deferred later slice, not this migration.
UPDATE "Passport" p
SET "bio" = ln."bio"
FROM "LineageNode" ln
WHERE ln."passportId" = p."id"
  AND ln."bio" IS NOT NULL
  AND ln."bio" <> ''
  AND (p."bio" IS NULL OR p."bio" = '');
