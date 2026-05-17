-- Mark existing lineage display-only users created by seed-baseline-lineage.ts.
UPDATE "User"
SET "isPlaceholder" = true
WHERE "email" LIKE '%@placeholder.lineage';
