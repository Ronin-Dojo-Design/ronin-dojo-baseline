/**
 * Cover photo banner for the claimed public directory profile (FI-007 / WL-P2-14).
 *
 * `DirectoryProfile.coverPhotoUrl` is uploaded + stored + projected into the read
 * model, but had no render surface. The placeholder/teaser path shows the cover via
 * `ProfileHero`'s background; this is the claimed-profile (ListingDetail) surface —
 * a full-width banner above the hero. Renders nothing when no cover is set.
 */
export function ProfileCoverBanner({ coverPhotoUrl }: { coverPhotoUrl?: string | null }) {
  if (!coverPhotoUrl) {
    return null
  }

  return (
    <div
      role="img"
      aria-label="Profile cover photo"
      className="h-40 w-full rounded-lg border bg-muted bg-center bg-cover sm:h-56"
      style={{ backgroundImage: `url("${coverPhotoUrl}")` }}
    />
  )
}
