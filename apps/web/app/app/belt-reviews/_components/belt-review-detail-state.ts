/**
 * @added   SESSION_0543 (2026-07-16)
 * @why     Keep belt-review detail rendering branches in one pure, exhaustively tested classifier
 * @wired   app/app/belt-reviews/[reviewId]/page.tsx
 */
type PromoterReviewStatus = "PENDING" | "PROPOSAL_PENDING" | "APPROVED" | "DENIED"

export type BeltReviewDetailState = {
  hasCapturedProposal: boolean
  activeMatchesCapture: boolean
  canApprove: boolean
  showStaleWarning: boolean
  surface: "actions" | "legacy" | "terminal"
  statusVariant: "success" | "danger" | "warning"
  statusLabel: PromoterReviewStatus | "PENDING"
}

function detailSurface(
  status: PromoterReviewStatus,
  isReviewable: boolean,
): BeltReviewDetailState["surface"] {
  if (isReviewable) return "actions"
  if (status === "PENDING") return "legacy"
  return "terminal"
}

function detailStatusVariant(status: PromoterReviewStatus): BeltReviewDetailState["statusVariant"] {
  if (status === "APPROVED") return "success"
  if (status === "DENIED") return "danger"
  return "warning"
}

/** Pure state classifier for every detail-page review branch. */
export function beltReviewDetailState({
  status,
  proposalCapturedAt,
  expectedPromoterPassportId,
  expectedPromoterName,
  proposedPromoterPassportId,
  activePromoterPassportId,
  activePromoterName,
}: {
  status: PromoterReviewStatus
  proposalCapturedAt: Date | null
  expectedPromoterPassportId: string | null
  expectedPromoterName: string | null
  proposedPromoterPassportId: string | null
  activePromoterPassportId: string | null
  activePromoterName: string | null
}): BeltReviewDetailState {
  const hasCapturedProposal =
    proposalCapturedAt !== null &&
    expectedPromoterPassportId !== null &&
    proposedPromoterPassportId !== null
  const activeMatchesCapture =
    activePromoterPassportId === expectedPromoterPassportId &&
    activePromoterName === expectedPromoterName
  const isReviewable = status === "PROPOSAL_PENDING" && hasCapturedProposal

  return {
    hasCapturedProposal,
    activeMatchesCapture,
    canApprove: isReviewable && activeMatchesCapture,
    showStaleWarning: isReviewable && !activeMatchesCapture,
    surface: detailSurface(status, isReviewable),
    statusVariant: detailStatusVariant(status),
    statusLabel: status === "PROPOSAL_PENDING" ? "PENDING" : status,
  }
}
