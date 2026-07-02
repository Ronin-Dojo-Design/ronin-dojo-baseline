export const CLAIM_REVIEW_ERROR = {
  NOT_FOUND: "Claim not found or does not belong to this brand.",
  NOT_REVIEWABLE: "Claim is not in a reviewable status.",
  NODE_NOT_IN_TREE: "Claim node is not a member of this tree.",
  NODE_ALREADY_APPROVED: "Another claimant is already approved for this lineage node.",
  CLAIMANT_HAS_NODE: "Claimant already owns a different lineage node.",
  // A member may never review their OWN belt-promotion claim — that would let a
  // claimed member self-approve an above-ceiling belt into a VERIFIED award
  // (SESSION_0492 FIX 1, defense-in-depth apply-layer guard).
  SELF_REVIEW: "You cannot review your own belt-promotion request.",
} as const
