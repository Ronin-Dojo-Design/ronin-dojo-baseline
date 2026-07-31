import type { RankEntryStatus } from "~/.generated/prisma/client"
import type { BeltFamily } from "~/components/common/belt-swatch"
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
  /** @added SESSION_0539 — refined-belt render fields (coral panels + degree marks + family bar). */
  secondaryColorHex: string | null
  degree: number | null
  beltFamily: BeltFamily | null
  awardedAt: Date | null
  disciplineName: string | null
  disciplineSlug: string | null
  /**
   * The raw `RankEntry.status` enum (public MAY expose it per lineage-data-wiring-flow.md §3:
   * VERIFIED | UNVERIFIED | PENDING | DISPUTED). NEVER add reviewer / evidence / reporter
   * fields here — the status enum is the only trust-presentation surface this projection may carry.
   */
  status: RankEntryStatus
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

const toRank = (entry: PublicPassportRow["rankEntries"][number]): PublicPassportRank => {
  const { rank, rankAward } = entry
  const discipline = rank.rankSystem.discipline

  return {
    // `awardId` stays the anchor award id (the join key surfaces rely on) — read off the
    // required `RankEntry.rankAward` relation, not a separate RankAward query (#376).
    awardId: rankAward.id,
    rankId: rank.id,
    name: rank.name,
    shortName: rank.shortName,
    colorHex: rank.colorHex,
    secondaryColorHex: rank.secondaryColorHex,
    degree: rank.degree,
    beltFamily: rank.beltFamily,
    awardedAt: rankAward.awardedAt,
    disciplineName: discipline?.name ?? null,
    disciplineSlug: discipline?.slug ?? null,
    status: entry.status,
  }
}

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
  const ranks = showRanks ? passport.rankEntries.map(toRank) : []
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
