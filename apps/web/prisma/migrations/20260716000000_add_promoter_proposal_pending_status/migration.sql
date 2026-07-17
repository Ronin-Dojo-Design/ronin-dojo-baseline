-- Rolling-writer compatibility for active-first promoter proposals.
--
-- The previous release's reviewer accepts any PENDING RankEntryReview by id, verifies the entry,
-- and marks the review APPROVED without applying the new proposal snapshot. A distinct additive
-- enum value makes captured proposals invisible and non-actionable to that old writer while old
-- payload-less PENDING rows remain valid during the expand window.

ALTER TYPE "RankEntryReviewStatus" ADD VALUE 'PROPOSAL_PENDING';
