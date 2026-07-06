import { BjjPassportCard } from "~/components/web/profile/bjj-passport-card"
import type { LineageAncestryEntry } from "~/server/web/lineage/ancestry"
import type { DirectoryProfile } from "./directory-profile-data"

/**
 * The signature shareable BJJ Passport card (BBL_PARITY_SPEC Slice 1), REUSED (not
 * duplicated) from the public projection. Current belt = highest earned RankAward, read
 * Passport-rooted (`passport.rankAwardsEarned`, exposed as `user.ranks`), so it is
 * claim-invariant. Belt color stays data-driven (`Rank.colorHex` → `BeltSwatch` inside the
 * card). The founder → member lineage chain reuses the already-loaded ancestry walk
 * (SESSION_0501, Desi P2-11) — a < 2-entry walk is not a real up-chain (the
 * `AncestrySection` contract) and is omitted.
 *
 * The card carries the `var(--font-bbl-*, var(--font-…))` fallback idiom itself, so it reads
 * in the BBL type tokens under a BBL-font ancestor and degrades to the app font on this
 * brand-neutral surface — which is why `/directory` needs NO `BrandTypography` wrapper
 * (recipe directory gotcha).
 *
 * ONE visible render per viewport (SESSION_0501 P0): shared card builder consumed by BOTH
 * homes — `ProfileSidebar` (md+ sticky sidebar) and the mobile `PassportSection`
 * (`./passport-section`), which frames it with the sibling-section rhythm instead of the
 * old unframed `max-md:contents` slam-in.
 */
export function ProfilePassportCard({
  profile,
  ancestry,
  className,
}: {
  profile: DirectoryProfile
  ancestry: LineageAncestryEntry[]
  className?: string
}) {
  const { user } = profile
  const topRank = user.ranks[0] ?? null
  const passportRank = topRank ? { name: topRank.name, colorHex: topRank.colorHex } : null
  const lineageChain = ancestry.length >= 2 ? ancestry.map(entry => entry.displayName) : []

  return (
    <BjjPassportCard
      name={user.name ?? "Member"}
      rank={passportRank}
      lineageChain={lineageChain}
      school={user.organizations[0]?.name ?? null}
      avatarUrl={user.image}
      className={className}
    />
  )
}

/** Desktop (md+) home of the credential — the sticky sidebar slot. Mobile hides it; the
 *  labeled `PassportSection` in the body flow takes over below md. */
export function ProfileSidebar({
  profile,
  ancestry,
}: {
  profile: DirectoryProfile
  ancestry: LineageAncestryEntry[]
}) {
  return <ProfilePassportCard profile={profile} ancestry={ancestry} className="max-md:hidden" />
}
