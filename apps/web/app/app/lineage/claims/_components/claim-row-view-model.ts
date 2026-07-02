import type { PendingClaim } from "~/server/admin/lineage/claim-queries"

/**
 * Pure view-model for one pending-claim queue row (SESSION_0492 cleanup).
 *
 * Extracted from the fat `.map(claim => …)` arrow in `page.tsx` (CRAP 132) so the
 * display derivation is side-effect-free and unit-testable, and the row component
 * stays presentation-only. No DB, no JSX — just the derived strings/flags the row
 * renders.
 */

export type ClaimRowViewModel = {
  id: string
  href: string
  isPromotion: boolean
  /** The row's primary line: subject name (promotion) or "claimant → subject". */
  title: string
  /** RANK_PROMOTION belt context (null for a person claim). */
  belt: { colorHex: string | null; label: string } | null
  /** Person-claim tree/directory context (null for a promotion). */
  treeLabel: string | null
  status: PendingClaim["status"]
  createdLabel: string
}

export function claimRowViewModel(claim: PendingClaim): ClaimRowViewModel {
  const subjectName = claim.passport.displayName ?? "Unnamed profile"
  const isPromotion = claim.type === "RANK_PROMOTION"

  return {
    id: claim.id,
    href: `/app/lineage/claims/${claim.id}`,
    isPromotion,
    // A promotion is filed by the member on their OWN Passport — no claimant → subject arrow.
    title: isPromotion
      ? subjectName
      : `${claim.claimant.name ?? claim.claimant.email} → ${subjectName}`,
    belt: isPromotion
      ? {
          colorHex: claim.claimedRank?.colorHex ?? null,
          label: `Belt promotion → ${claim.claimedRank?.name ?? "Unknown belt"}`,
        }
      : null,
    treeLabel: isPromotion
      ? null
      : claim.tree
        ? `Tree: ${claim.tree.name}`
        : "Directory profile (no tree)",
    status: claim.status,
    createdLabel: claim.createdAt.toLocaleDateString(),
  }
}
