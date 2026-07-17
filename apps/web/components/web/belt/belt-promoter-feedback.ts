/**
 * @added   SESSION_0542 (2026-07-16)
 * @why     Keep belt-edit promoter feedback aligned with server transition law
 * @wired   components/web/belt/belt-edit-form.tsx, components/web/belt/belt-journey-grid.tsx
 */
export type PromoterFeedbackIntent = "none" | "verify" | "proposal" | "unverified" | "recruit"

/**
 * Fold a mutation card's server-authoritative promoter classification into the
 * client snapshot. A free-typed coach can be minted after the server load, so the
 * original id list alone is not sufficient for a still-mounted belt journey.
 */
export function reconcileRecruitedPromoterPassportIds(
  current: ReadonlySet<string>,
  savedCard: { awardedByPassportId: string | null; promoterIsRecruited: boolean },
): ReadonlySet<string> {
  if (!savedCard.promoterIsRecruited || !savedCard.awardedByPassportId) return current
  return new Set([...current, savedCard.awardedByPassportId])
}

/**
 * Resolve the member-facing explanation for a promoter selection. Active accepted provenance
 * wins over the authority anchor, mirroring D-046: established A→B is a proposal even when B is
 * the anchor; only an initial/unaccepted promoter matching the anchor verifies immediately.
 */
export function resolvePromoterFeedbackIntent({
  selectedPromoterPassportId,
  activePromoterPassportId,
  anchorPromoterPassportId,
  recruitedPromoterPassportIds,
  hasTypedName,
}: {
  selectedPromoterPassportId: string | null
  activePromoterPassportId: string | null
  anchorPromoterPassportId: string | null
  /** Authoritative server classification: accountless Passport ids with no public identity satellite. */
  recruitedPromoterPassportIds: ReadonlySet<string>
  hasTypedName: boolean
}): PromoterFeedbackIntent {
  if (!selectedPromoterPassportId) return hasTypedName ? "recruit" : "none"
  if (selectedPromoterPassportId === activePromoterPassportId) return "none"

  const selectedIsEstablished = !recruitedPromoterPassportIds.has(selectedPromoterPassportId)
  const activeIsEstablished =
    activePromoterPassportId !== null && !recruitedPromoterPassportIds.has(activePromoterPassportId)

  if (activeIsEstablished && selectedIsEstablished) return "proposal"
  if (selectedPromoterPassportId === anchorPromoterPassportId) return "verify"
  if (selectedIsEstablished) return "unverified"
  return "recruit"
}
