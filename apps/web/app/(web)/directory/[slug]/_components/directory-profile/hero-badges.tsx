import { Badge } from "~/components/common/badge"
import { Stack } from "~/components/common/stack"
import { LineageClaimBadge, LineageTrustBadge } from "~/components/web/lineage/lineage-trust-badge"
import type { DirectoryProfile } from "./directory-profile-data"
import { profileTierLabel } from "./directory-profile-fields"

/**
 * Hero badge cluster: trust + claim + rich-media status + paid-tier (free tier badge dropped).
 *
 * The rich-media badge is keyed off `canRenderFullProfile` — the alias for the rich-media gate
 * (cover/video/social/location). A free CLAIMED profile is a FULL basic profile, NOT a "preview",
 * so the gated state reads "Media locked" (media unlocks with a paid listing), not "Listing
 * preview" (SESSION_0502 — the free/paid line is basic-vs-rich-media, not full-vs-preview).
 */
export function HeroBadges({ profile }: { profile: DirectoryProfile }) {
  return (
    <Stack size="xs" wrap>
      <LineageTrustBadge status={profile.trustStatus} />
      {profile.claimBadgeStatus && <LineageClaimBadge status={profile.claimBadgeStatus} />}
      <Badge variant={profile.canRenderFullProfile ? "primary" : "soft"}>
        {profile.canRenderFullProfile ? "Full profile" : "Media locked"}
      </Badge>
      {profile.profileTier !== "free" && (
        <Badge variant="outline">{profileTierLabel(profile.profileTier)}</Badge>
      )}
    </Stack>
  )
}
