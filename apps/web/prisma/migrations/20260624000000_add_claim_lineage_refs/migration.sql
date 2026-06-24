-- SESSION_0441 — Claim-time lineage selections on PassportClaimRequest.
--
-- The Join-the-Legacy wizard's creatable comboboxes let a claimant pick a REGISTERED
-- school / instructor / tree (or type a custom value). A registered pick is stored as a
-- typed FK ref here — the same pattern as `claimedRankId` (ADR 0035) — so the steward sees
-- a resolved link on the claim review surface and the ref is actionable on approve. A
-- custom entry leaves the column null; only the text label (in claimantNote) survives.
--
-- Additive + nullable + ON DELETE SET NULL: safe to apply online.

-- AlterTable
ALTER TABLE "PassportClaimRequest" ADD COLUMN "claimedSchoolId" TEXT;
ALTER TABLE "PassportClaimRequest" ADD COLUMN "trainedUnderNodeId" TEXT;
ALTER TABLE "PassportClaimRequest" ADD COLUMN "representTreeId" TEXT;

-- AddForeignKey
ALTER TABLE "PassportClaimRequest"
  ADD CONSTRAINT "PassportClaimRequest_claimedSchoolId_fkey"
  FOREIGN KEY ("claimedSchoolId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PassportClaimRequest"
  ADD CONSTRAINT "PassportClaimRequest_trainedUnderNodeId_fkey"
  FOREIGN KEY ("trainedUnderNodeId") REFERENCES "LineageNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PassportClaimRequest"
  ADD CONSTRAINT "PassportClaimRequest_representTreeId_fkey"
  FOREIGN KEY ("representTreeId") REFERENCES "LineageTree"("id") ON DELETE SET NULL ON UPDATE CASCADE;
