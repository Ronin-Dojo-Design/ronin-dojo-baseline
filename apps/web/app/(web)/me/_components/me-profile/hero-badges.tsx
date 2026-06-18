import { Badge } from "~/components/common/badge"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { Stack } from "~/components/common/stack"
import type { MyProfile } from "~/server/web/directory/profile-projection"
import { VISIBILITY_LABEL } from "./me-profile-fields"

/**
 * Hero badge cluster: the current belt (data-driven via `BeltSwatch` → `Rank.colorHex`,
 * never a hardcoded palette) plus the directory-visibility chip.
 */
export function HeroBadges({ profile }: { profile: MyProfile }) {
  const isPublic = profile.visibility === "PUBLIC"

  return (
    <Stack size="xs" wrap>
      {profile.currentRank && (
        <Badge variant="primary" prefix={<BeltSwatch colorHex={profile.currentRank.colorHex} />}>
          {profile.currentRank.name}
        </Badge>
      )}
      <Badge variant={isPublic ? "soft" : "outline"}>{VISIBILITY_LABEL[profile.visibility]}</Badge>
    </Stack>
  )
}
