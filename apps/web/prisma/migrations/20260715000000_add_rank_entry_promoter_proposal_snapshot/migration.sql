-- D-046 expand phase — preserve the active promoter while a proposed change awaits review.
--
-- Vercel runs `migrate deploy` before the new application becomes active, while the
-- previous writer may still create payload-less PROMOTER_CHANGED rows. This first deploy
-- therefore adds only nullable snapshot storage, ordinary indexes, and nullable FKs. It
-- deliberately accepts both the old and new writers during the rolling window.
--
-- A later contract migration (WL-P1-9), deployed only after the new writer is live and
-- legacy pending rows have been inventoried/resolved, owns the preflight, one-pending
-- partial unique index, and complete A/B CHECK constraint. Do not fold those constraints
-- back into this pre-activation expand migration.

BEGIN;

ALTER TABLE "RankEntryReview"
  ADD COLUMN "proposalCapturedAt" TIMESTAMP(3),
  ADD COLUMN "expectedPromoterPassportId" TEXT,
  ADD COLUMN "expectedPromoterName" TEXT,
  ADD COLUMN "proposedPromoterPassportId" TEXT;

CREATE INDEX "RankEntryReview_expectedPromoterPassportId_idx"
  ON "RankEntryReview"("expectedPromoterPassportId");

CREATE INDEX "RankEntryReview_proposedPromoterPassportId_idx"
  ON "RankEntryReview"("proposedPromoterPassportId");

ALTER TABLE "RankEntryReview"
  ADD CONSTRAINT "RankEntryReview_expectedPromoterPassportId_fkey"
  FOREIGN KEY ("expectedPromoterPassportId") REFERENCES "Passport"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RankEntryReview"
  ADD CONSTRAINT "RankEntryReview_proposedPromoterPassportId_fkey"
  FOREIGN KEY ("proposedPromoterPassportId") REFERENCES "Passport"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
