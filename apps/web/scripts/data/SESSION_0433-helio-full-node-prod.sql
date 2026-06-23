-- SESSION_0433 — push Hélio Gracie's FULL node to prod (graph-as-moat: visible R10 root grandmaster).
-- Additive ONLY: node + R10 award + Hélio→Rorion edge, all hanging off the EXISTING Hélio passport
-- (fix0432heliogracie, created SESSION_0432; Rorion's R9 already points to it). No new passport.
-- Rows + IDs are the exact ones the verified FI-008 seed (PR #161) created on prodsnap — a faithful port.
-- Idempotent: every INSERT is NOT EXISTS-guarded, so a re-run cannot duplicate.
-- Fresh prod backup taken before apply: /tmp/PROD-backup-helio-*.dump
-- Run: prod dry-run (ROLLBACK) → COMMIT prod.
BEGIN;

-- 1. Hélio's LineageNode (PUBLIC, verified) on the existing passport.
INSERT INTO "LineageNode" (id, visibility, "isVerified", slug, bio, "verificationStatus", "passportId", "createdAt", "updatedAt")
SELECT 'nmc5spxwr00fwdrzrr6bdrjb', 'PUBLIC', true, 'helio-gracie',
       '10th Degree Red Belt · Co-founder of Gracie Jiu-Jitsu (with Carlos Gracie Sr) · Rio de Janeiro, Brazil.',
       'VERIFIED', 'fix0432heliogracie', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "LineageNode" WHERE id = 'nmc5spxwr00fwdrzrr6bdrjb');

-- 2. Hélio's R10 (Red Belt 10th Degree — Grand Master) award.
INSERT INTO "RankAward" (id, "passportId", "rankId", "awardedAt", source, "verificationStatus", notes, "createdAt", "updatedAt")
SELECT 'ekrhkeu9f9d4b74fympir48w', 'fix0432heliogracie', 'cmp8i1pwb001671dsj3i8xa3k', '1960-01-01',
       'STATED', 'UNVERIFIED', '10th Degree Red Belt — co-founder of Gracie Jiu-Jitsu. Approximate date.', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "RankAward" WHERE id = 'ekrhkeu9f9d4b74fympir48w');

-- 3. Hélio → Rorion (father→son) INSTRUCTOR_STUDENT edge — makes Hélio Rorion's ancestor in the tree.
INSERT INTO "LineageRelationship" (id, "fromNodeId", "toNodeId", type, description, "isVerified", "createdAt", "updatedAt")
SELECT 'eqg0g6lt8mjhw70esdy1zn6n', 'nmc5spxwr00fwdrzrr6bdrjb', 'cmq60xyw700093sds152u6n0z',
       'INSTRUCTOR_STUDENT', 'Rorion Gracie is the son of Hélio Gracie; trained in Gracie Jiu-Jitsu under Hélio.',
       true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM "LineageRelationship" WHERE id = 'eqg0g6lt8mjhw70esdy1zn6n');

-- Verify
\echo '--- Hélio node + R10 + edge to Rorion (expect all present) ---'
SELECT 'node' AS kind, slug FROM "LineageNode" WHERE id='nmc5spxwr00fwdrzrr6bdrjb'
UNION ALL SELECT 'award', r.name FROM "RankAward" ra JOIN "Rank" r ON r.id=ra."rankId" WHERE ra.id='ekrhkeu9f9d4b74fympir48w'
UNION ALL SELECT 'edge→', n.slug FROM "LineageRelationship" lr JOIN "LineageNode" n ON n.id=lr."toNodeId" WHERE lr.id='eqg0g6lt8mjhw70esdy1zn6n';

COMMIT;
