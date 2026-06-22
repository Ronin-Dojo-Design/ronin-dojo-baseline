-- SESSION_0432 — surgical Hélio Gracie → Rorion promoter link (prod-safe; NOT via the full seed,
-- which has drifted from the SESSION_0430 corrections). Mirrors the seed's Hélio/Rorion intent at
-- the minimum needed for Rorion's drawer to show "Awarded By: Hélio Gracie".
-- Run prodsnap dry-run (ROLLBACK) → COMMIT prodsnap → COMMIT prod.
-- Idempotent: guarded INSERT; UPDATE is a no-op if already linked.
-- Follow-up: the FULL Hélio node (LineageNode + R10 award + helio→rorion edge + tree membership)
-- lands when seed-baseline-lineage.ts is reconciled with the 0430 corrections and re-run.
BEGIN;

-- 1. Hélio Gracie placeholder Passport (no User — placeholder pattern). Only id + updatedAt are required.
INSERT INTO "Passport" (id, "displayName", bio, "createdAt", "updatedAt")
SELECT 'fix0432heliogracie', 'Hélio Gracie',
       '10th Degree Red Belt · Co-founder of Gracie Jiu-Jitsu (with Carlos Gracie Sr) · Rio de Janeiro, Brazil.',
       now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "Passport" WHERE id = 'fix0432heliogracie');

-- 2. Link Rorion's Red 9th award (created SESSION_0430) to Hélio as the historical promoter.
UPDATE "RankAward"
SET "awardedByPassportId" = 'fix0432heliogracie'
WHERE id = 'fix0430rorionred9th';

-- Verify
\echo '--- Rorion R9 promoter (expect Hélio Gracie) ---'
SELECT p2."displayName" AS rorion, hp."displayName" AS awarded_by
FROM "RankAward" ra
JOIN "Passport" p2 ON p2.id = ra."passportId"
LEFT JOIN "Passport" hp ON hp.id = ra."awardedByPassportId"
WHERE ra.id = 'fix0430rorionred9th';

COMMIT;
