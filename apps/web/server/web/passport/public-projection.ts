import { resolveDisplayAvatar } from "~/lib/media"
import type { PublicPassportRow } from "~/server/web/passport/public-payloads"

/**
 * Canonical PUBLIC Passport projection (issue #134). The single place the public identity
 * view-model + redaction live, so every public surface produces the same shape and the
 * `showRanks` gate has one audit point (ADR 0025).
 */

export type PublicPassportRank = {
  awardId: string
  rankId: string
  name: string
  shortName: string | null
  /** Belt color — never hardcoded; always Rank.colorHex. */
  colorHex: string | null
  awardedAt: Date | null
  disciplineName: string | null
  disciplineSlug: string | null
}

export type PublicPassportDTO = {
  id: string
  displayName: string
  /** Passport avatar → linked account image → optional brand default. */
  avatarUrl: string | null
  bio: string | null
  socialLinks: PublicPassportRow["socialLinks"]
  /** Public directory slug, when the Passport has a directory profile. */
  slug: string | null
  /** Highest-belt-first (rank `sortOrder` desc, then `awardedAt` desc); empty when the member hides ranks (`showRanks === false`). */
  ranks: PublicPassportRank[]
  /** Convenience: highest/most-recent rank, or null when hidden/none. */
  currentRank: PublicPassportRank | null
  /** "Black Belt · Brazilian Jiu-Jitsu" style label for the current rank, or null. */
  rankLabel: string | null
}

const toRank = (award: PublicPassportRow["rankAwardsEarned"][number]): PublicPassportRank => ({
  awardId: award.id,
  rankId: award.rank?.id ?? "",
  name: award.rank?.name ?? "",
  shortName: award.rank?.shortName ?? null,
  colorHex: award.rank?.colorHex ?? null,
  awardedAt: award.awardedAt,
  disciplineName: award.rank?.rankSystem?.discipline?.name ?? null,
  disciplineSlug: award.rank?.rankSystem?.discipline?.slug ?? null,
})

const rankLabelOf = (rank: PublicPassportRank | null): string | null => {
  if (!rank?.name) return null
  return rank.disciplineName ? `${rank.name} · ${rank.disciplineName}` : rank.name
}

/**
 * Project a Passport (selected with `publicPassportPayload`) into the public DTO.
 *
 * @param passport - row selected via `publicPassportPayload`
 * @param options.brand - optional brand for the default-avatar fallback
 * @param options.showRanks - override the gate (defaults to the member's
 *   `directoryProfile.showRanks`; pass `true` for owner/admin contexts that bypass it)
 */
export const projectPublicPassport = (
  passport: PublicPassportRow,
  options: { brand?: string | null; showRanks?: boolean } = {},
): PublicPassportDTO => {
  const showRanks = options.showRanks ?? passport.directoryProfile?.showRanks !== false
  const ranks = showRanks ? passport.rankAwardsEarned.map(toRank) : []
  const currentRank = ranks[0] ?? null

  return {
    id: passport.id,
    displayName: passport.displayName ?? passport.user?.name ?? "Unknown lineage holder",
    avatarUrl: resolveDisplayAvatar(passport.avatarUrl ?? passport.user?.image, options.brand),
    bio: passport.bio,
    socialLinks: passport.socialLinks,
    slug: passport.directoryProfile?.slug ?? null,
    ranks,
    currentRank,
    rankLabel: rankLabelOf(currentRank),
  }
}
