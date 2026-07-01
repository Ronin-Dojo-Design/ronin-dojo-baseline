"use client"

import { useEffect, useState } from "react"
import { nameInitials, passportDisplayName } from "~/lib/identity/passport-display"
import { pickLineageClaimStatus, resolveLineageTrustStatus } from "~/lib/lineage/trust-status"
import type { LineageNodeProfile } from "~/server/web/lineage/payloads"

/** Desktop (≥768px) renders the drawer as a side panel instead of a modal bottom-sheet. */
export function useDesktopProfilePanel() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return

    const media = window.matchMedia("(min-width: 768px)")
    const update = () => setIsDesktop(media.matches)

    update()
    media.addEventListener("change", update)

    return () => media.removeEventListener("change", update)
  }, [])

  return isDesktop
}

/** Avatar-fallback initials — re-exported from the canonical identity seam. */
export const initials = nameInitials

export function formatDate(date: Date | string | null | undefined): string | null {
  if (!date) return null
  const d = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return null
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(d)
}

export function rankProgressPercent(
  rank:
    | {
        id: string
        sortOrder?: number | null
        rankSystem?: { ranks?: { id: string; sortOrder: number }[] | null } | null
      }
    | null
    | undefined,
): number {
  if (!rank) return 0

  const ranks = [...(rank.rankSystem?.ranks ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)
  if (ranks.length > 0) {
    const index = ranks.findIndex(item => item.id === rank.id)
    if (index >= 0) return Math.round(((index + 1) / ranks.length) * 100)
  }

  if (typeof rank.sortOrder === "number") {
    return Math.max(12, Math.min(100, Math.round(rank.sortOrder * 10)))
  }

  return 0
}

/**
 * Derive every display value the drawer needs from the profile. Pure data shaping —
 * keeps the presentation components free of derivation logic. The panel rank is the
 * member's shown (highest awarded) rank — awarded truth, ADR 0035.
 */
export function deriveDrawerProfileView(profile: LineageNodeProfile) {
  const rankAwards = profile.passport?.rankAwardsEarned ?? []
  const currentAward = rankAwards[0] ?? null
  const currentRank = currentAward?.rank ?? null
  const discipline = currentRank?.rankSystem?.discipline ?? null
  const panelAward = currentAward
  const panelRank = currentRank
  const claimStatus = pickLineageClaimStatus(profile.claimRequests)

  return {
    displayName: passportDisplayName(profile.passport) ?? "Unnamed",
    avatarSrc: profile.passport?.avatarUrl ?? profile.passport?.user?.image ?? null,
    currentAward,
    currentRank,
    discipline,
    latestMembership: profile.passport?.user?.memberships[0] ?? null,
    instructorRelationship: profile.relationshipsTo[0] ?? null,
    panelAward,
    panelRank,
    panelRankColor: panelRank?.colorHex ?? null,
    panelRankProgress: rankProgressPercent(panelRank),
    headerRankName: panelRank?.name ?? null,
    headerDisciplineName: panelRank?.rankSystem?.discipline?.name ?? discipline?.name ?? null,
    claimStatus,
    trustStatus: resolveLineageTrustStatus({
      verificationStatus: profile.verificationStatus,
      isVerified: profile.isVerified,
      isPlaceholder: profile.passport?.user == null,
      claimStatus,
    }),
  }
}

export type DrawerProfileView = ReturnType<typeof deriveDrawerProfileView>
