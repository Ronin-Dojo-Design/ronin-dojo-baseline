-- SESSION_0432 FI-006 — Add claimedRankId to LineageClaimRequest.
--
-- Stores the rank a claimant asserts at registration/claim time (PENDING state).
-- Promoted to a RankAward by admin-verify; NOT a display source (ADR 0035 §4).
--
-- DO NOT APPLY in cloud sessions — defer to local review/apply pass.

ALTER TABLE "LineageClaimRequest" ADD COLUMN "claimedRankId" TEXT;

ALTER TABLE "LineageClaimRequest"
  ADD CONSTRAINT "LineageClaimRequest_claimedRankId_fkey"
  FOREIGN KEY ("claimedRankId") REFERENCES "Rank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "LineageClaimRequest_claimedRankId_idx"
  ON "LineageClaimRequest"("claimedRankId");
