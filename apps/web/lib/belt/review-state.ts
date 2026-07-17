/**
 * @added   SESSION_0543 (2026-07-16)
 * @why     Keep open-review and rendered belt-trust state consistent across every projection
 * @wired   components/web/belt/belt-view-model.ts, server/belt/profile-projection.ts,
 *          server/web/belt/belt-tab-loader.ts, server/admin/rank-reviews/queries.ts
 */
/** Review states that still represent unresolved work in every belt projection. */
export const OPEN_RANK_ENTRY_REVIEW_STATUSES = ["PENDING", "PROPOSAL_PENDING"] as const

/** The trust state rendered for a member-owned belt entry. */
export type BeltTrustState = "verified" | "unverified" | "pending_review"

/**
 * An open review always wins over the persisted entry status: the belt is in flight until the
 * review reaches a terminal state.
 */
export function deriveTrustState({
  verified,
  hasPendingReview,
}: {
  verified: boolean
  hasPendingReview: boolean
}): BeltTrustState {
  if (hasPendingReview) return "pending_review"
  return verified ? "verified" : "unverified"
}
