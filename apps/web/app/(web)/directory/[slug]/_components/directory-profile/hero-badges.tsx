import { Badge } from "~/components/common/badge"
import { Stack } from "~/components/common/stack"
import { LineageClaimBadge, LineageTrustBadge } from "~/components/web/lineage/lineage-trust-badge"
import type { DirectoryProfile } from "./directory-profile-data"
import { profileTierLabel } from "./directory-profile-fields"

/** Hero badge cluster: trust + claim + full/preview + paid-tier (free tier dropped). */
export function HeroBadges({ profile }: { profile: DirectoryProfile }) {
  return (
    <Stack size="xs" wrap>
      <LineageTrustBadge status={profile.trustStatus} />
      {profile.claimBadgeStatus && <LineageClaimBadge status={profile.claimBadgeStatus} />}
      <Badge variant={profile.canRenderFullProfile ? "primary" : "soft"}>
        {profile.canRenderFullProfile ? "Full profile" : "Listing preview"}
      </Badge>
      {profile.profileTier !== "free" && (
        <Badge variant="outline">{profileTierLabel(profile.profileTier)}</Badge>
      )}
    </Stack>
  )
}
