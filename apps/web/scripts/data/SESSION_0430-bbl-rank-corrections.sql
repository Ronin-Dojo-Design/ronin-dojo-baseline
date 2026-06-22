-- SESSION_0430 — BBL lineage rank/identity data corrections
-- Run on prodsnap first (verify), then re-run on prod Neon as the follow-up.
-- Idempotency: re-running is mostly safe except the two INSERTs (guarded by NOT EXISTS)
-- and the merges (guarded — dup passports already gone => no-op).
-- Wrap in a transaction; dry-run with ROLLBACK, then COMMIT.
BEGIN;

-- Resolve the IBJJF rank system id once.
\set ibjjf '(SELECT id FROM "RankSystem" WHERE name = ''IBJJF Belt System'')'

-- ============================================================
-- A. Fix Rank.sortOrder — base "Black Belt" (no degree) is orphaned at 31,
--    sorting ABOVE Red 10th (30). It belongs at the black-belt entry, just below
--    "Black Belt - 1st Degree". @@unique([rankSystemId, sortOrder]) forces a park-shift.
-- ============================================================
-- Park base "Black Belt" out of the band.
UPDATE "Rank" SET "sortOrder" = 999 WHERE id = 'ix4rytboth1cdpb81nhgu8ff';
-- Shift the black-belt-and-above band up by one, via a temp offset so the per-row
-- unique check never sees a transient collision (21..30 -> 1021..1030 -> 22..31).
UPDATE "Rank" SET "sortOrder" = "sortOrder" + 1000
WHERE "rankSystemId" = :ibjjf AND "sortOrder" BETWEEN 21 AND 30;
UPDATE "Rank" SET "sortOrder" = "sortOrder" - 999
WHERE "rankSystemId" = :ibjjf AND "sortOrder" BETWEEN 1021 AND 1030;
-- Drop base "Black Belt" into the freed entry slot (21).
UPDATE "Rank" SET "sortOrder" = 21 WHERE id = 'ix4rytboth1cdpb81nhgu8ff';

-- ============================================================
-- B. Rank corrections (structured awards)
-- ============================================================
-- B1. Bill Hosken — erroneous Coral 7th award -> Black Belt 5th Degree (keeps date 2020-06-01).
UPDATE "RankAward" SET "rankId" = 'cmp8i1pce001171dsgs09n0e3'
WHERE id = 'cmq60y49e001u3sdsahxb1oxx';
-- B1b. Bill Hosken bio — narrative still says "Coral Belt"; align the lead phrase.
UPDATE "LineageNode" SET bio = replace(bio, 'Coral Belt', 'Black Belt – 5th Degree')
WHERE "passportId" = 'fca579ef-b7a3-4028-8b50-163a99e7930d';

-- B2. Jerry Smith — erroneous Coral 7th award removed (leaves base Black Belt).
--     LineageTreeMember/Relationship.rankAwardId are SetNull, so references auto-clear.
DELETE FROM "RankAward" WHERE id = 'cmq60y4dl001v3sdslesd2qc1';

-- B3. Rikki Rockett — promoted to 4th Degree (2024-01-27, under Renato Magno) per public record.
UPDATE "RankAward"
SET "rankId" = 'cmp8i1p7m001071dsbumcb2ed',
    "awardedAt" = '2024-01-27',
    "awardedByPassportId" = '06aef1ad-27a9-4cc3-adee-e707bb94344e'
WHERE id = 'dqkhjmpuqzwuo0fy63u85xts';

-- B4. Andre Lima — award his Taekwondo rank (USA Taekwondo "8th Dan - Black Belt"), per his bio.
INSERT INTO "RankAward" (id, "passportId", "rankId", source, "verificationStatus", "createdAt", "updatedAt")
SELECT 'fix0430andretkd8dan', 'txq1tq8zoc55diog4zq3fsgy', 'cmp8i261a005d71dsgo631lm4', 'STATED', 'IMPORTED', now(), now()
WHERE NOT EXISTS (
  SELECT 1 FROM "RankAward" WHERE "passportId" = 'txq1tq8zoc55diog4zq3fsgy' AND "rankId" = 'cmp8i261a005d71dsgo631lm4'
);

-- B5. Rorion Gracie — add IBJJF Red Belt 9th Degree (promoted 2005 by Hélio Gracie, per public record).
--     Hélio has no passport yet -> promoter unlinked; year-only date kept in notes (honest "Unknown date").
INSERT INTO "RankAward" (id, "passportId", "rankId", source, "verificationStatus", notes, "createdAt", "updatedAt")
SELECT 'fix0430rorionred9th', '91c496da-4bc3-4e08-9dfe-e26da3219856', 'cmp8i1pt9001571dsuad3hcoy', 'STATED', 'IMPORTED',
       'Promoted to 9th-degree red belt in 2005 by Hélio Gracie (public record). TODO: link Hélio Gracie promoter passport.', now(), now()
WHERE NOT EXISTS (
  SELECT 1 FROM "RankAward" WHERE "passportId" = '91c496da-4bc3-4e08-9dfe-e26da3219856' AND "rankId" = 'cmp8i1pt9001571dsuad3hcoy'
);

-- ============================================================
-- C. Duplicate merges — move keepers, then delete dup passport (cascades node + remnants).
-- ============================================================
-- C1. Brian Scott — keep user-linked node cmq60xxjm…; dup placeholder passport kvhzmyu… (node zckeu9…).
--     Move the dup's bbl-lineage membership onto the real node; clear its stale selected award.
UPDATE "LineageTreeMember" SET "nodeId" = 'cmq60xxjm00003sdseks0y4bl', "rankAwardId" = NULL
WHERE id = 'g0ljc9g3t5i7bwyn8sertoey';
DELETE FROM "Passport" WHERE id = 'kvhzmyurgvseoc48213odj2o';

-- C2. Posnik/Poznik — keep "Christopher Alexander Poznik" node b9k69… (Black 5th, what he self-entered);
--     dup "Chris Posnik" passport 68655ee2… (node cmq60xzgz…, Coral 7th, 2 rigan-machado memberships + 1 student rel).
--     Move the student relationship + ONE membership to the keep node; the 2nd dup membership + Coral award
--     cascade-delete with the dup passport. (Other membership can't move: would violate @@unique[treeId,nodeId].)
UPDATE "LineageRelationship" SET "toNodeId" = 'b9k69aryrl3b8ggu4n1djvlv', "rankAwardId" = NULL
WHERE id = 'cmq60y17i00113sds0p4hmxfy';
UPDATE "LineageTreeMember" SET "nodeId" = 'b9k69aryrl3b8ggu4n1djvlv', "rankAwardId" = NULL
WHERE id = 'cmq60y7hx002p3sdshiqcpw8v';
DELETE FROM "Passport" WHERE id = '68655ee2-de24-46db-b802-724a57a1a898';

-- ============================================================
-- Verification (read-only) — run before COMMIT to confirm.
-- ============================================================
\echo '--- IBJJF ladder around black belt (expect base Black Belt = 21) ---'
SELECT "sortOrder", name FROM "Rank" WHERE "rankSystemId" = :ibjjf AND "sortOrder" BETWEEN 20 AND 32 ORDER BY "sortOrder";
\echo '--- corrected members highest award ---'
SELECT p."displayName", (array_agg(r.name ORDER BY r."sortOrder" DESC))[1] AS highest
FROM "RankAward" ra JOIN "Rank" r ON r.id = ra."rankId" JOIN "Passport" p ON p.id = ra."passportId"
WHERE p."displayName" IN ('Bill Hosken','Jerry Smith','Rikki Rockett','Andre Lima','Rorion Gracie')
GROUP BY p."displayName" ORDER BY p."displayName";
\echo '--- dup passports gone (expect 0 rows) ---'
SELECT "displayName", count(*) FROM "Passport" WHERE id IN ('kvhzmyurgvseoc48213odj2o','68655ee2-de24-46db-b802-724a57a1a898') GROUP BY "displayName";
\echo '--- Brian Scott + Poznik node memberships after merge ---'
SELECT p."displayName", t.slug FROM "LineageTreeMember" m JOIN "LineageNode" ln ON ln.id = m."nodeId" JOIN "Passport" p ON p.id = ln."passportId" JOIN "LineageTree" t ON t.id = m."treeId" WHERE ln.id IN ('cmq60xxjm00003sdseks0y4bl','b9k69aryrl3b8ggu4n1djvlv') ORDER BY p."displayName", t.slug;

COMMIT;  -- Applied to prodsnap SESSION_0430 (dry-run validated first). Re-run on prod Neon as follow-up.
