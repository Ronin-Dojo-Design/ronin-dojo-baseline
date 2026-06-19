import { BjjPassportCard } from "~/components/web/profile/bjj-passport-card"
import type { DirectoryProfile } from "./directory-profile-data"

/**
 * Sidebar credential — the signature shareable BJJ Passport card (BBL_PARITY_SPEC Slice 1),
 * REUSED (not duplicated) from the public projection. Current belt = highest earned RankAward,
 * read Passport-rooted (`passport.rankAwardsEarned`, exposed as `user.ranks`), so it is
 * claim-invariant. Belt color stays data-driven (`Rank.colorHex` → `BeltSwatch` inside the card).
 *
 * The card carries the `var(--font-bbl-*, var(--font-…))` fallback idiom itself, so it reads in
 * the BBL type tokens under a BBL-font ancestor and degrades to the app font on this brand-neutral
 * surface — which is why `/directory` needs NO `BrandTypography` wrapper (recipe directory gotcha).
 */
export function ProfileSidebar({ profile }: { profile: DirectoryProfile }) {
  const { user } = profile
  const topRank = user.ranks[0]?.rank ?? null
  const passportRank = topRank ? { name: topRank.name, colorHex: topRank.colorHex } : null

  return (
    <BjjPassportCard
      name={user.name ?? "Member"}
      rank={passportRank}
      school={user.organizations[0]?.name ?? null}
      avatarUrl={user.image}
    />
  )
}
