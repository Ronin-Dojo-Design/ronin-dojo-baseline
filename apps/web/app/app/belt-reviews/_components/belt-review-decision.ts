export type BeltReviewDecision = "approve" | "deny"

type BeltReviewDecisionContext = {
  memberName: string
  rankName: string
  proposedPromoterName: string
}

/** Locked, operator-facing confirmation language for the two irreversible review decisions. */
export function getBeltReviewDecisionCopy(
  decision: BeltReviewDecision,
  { memberName, rankName, proposedPromoterName }: BeltReviewDecisionContext,
) {
  const beltLabel = rankName.toLowerCase().includes("belt") ? rankName : `${rankName} belt`
  if (decision === "deny") {
    return {
      title: "Deny promoter change?",
      description: `Deny ${proposedPromoterName} as the proposed promoter for ${memberName}’s ${beltLabel}? The current promoter stays unchanged. This cannot be undone from this review.`,
      confirmLabel: "Deny proposal",
      confirmVariant: "destructive" as const,
    }
  }

  return {
    title: "Approve promoter change?",
    description: `Apply ${proposedPromoterName} as the promoter for ${memberName}’s ${beltLabel} and mark the belt VERIFIED? This cannot be undone from this review.`,
    confirmLabel: "Approve and verify",
    confirmVariant: "primary" as const,
  }
}
