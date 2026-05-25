export const CLAIM_REVIEW_ERROR = {
  NOT_FOUND: "Claim not found or does not belong to this brand.",
  NOT_REVIEWABLE: "Claim is not in a reviewable status.",
  NODE_NOT_IN_TREE: "Claim node is not a member of this tree.",
  NODE_ALREADY_APPROVED: "Another claimant is already approved for this lineage node.",
  CLAIMANT_HAS_NODE: "Claimant already owns a different lineage node.",
} as const
