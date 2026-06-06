import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { LineageClaimBadge, LineageTrustBadge } from "~/components/web/lineage/lineage-trust-badge"
import type { LineageClaimBadgeStatus, LineageTrustStatus } from "~/lib/lineage/trust-status"

type DirectoryProfile = {
  id: string
  slug: string
  userId: string
  name: string | null
  image: string | null
  profileTier: "free" | "premium" | "elite" | "legend"
  canRenderFullProfile: boolean
  trustStatus: LineageTrustStatus
  claimBadgeStatus: LineageClaimBadgeStatus | null
  locationCity: string | null
  locationRegion: string | null
  locationCountry: string | null
  email: string | null
  organizations: {
    id: string
    name: string
    slug: string
    discipline: { id: string; name: string } | null
  }[]
  ranks: {
    rank: { id: string; name: string; sortOrder: number; rankSystem: { id: string; name: string } }
    awardedAt: Date | null
  }[]
}

type DirectoryListProps = {
  profiles: DirectoryProfile[]
}

function profileTierLabel(tier: DirectoryProfile["profileTier"]) {
  if (tier === "legend") return "Legend"
  if (tier === "elite") return "Elite"
  if (tier === "premium") return "Premium"
  return "Free"
}

const DirectoryList = ({ profiles }: DirectoryListProps) => {
  if (profiles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>
            No profiles found. Try adjusting your search or filters.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {profiles.map(profile => (
        <Card key={profile.id}>
          <CardHeader>
            <Stack direction="row" className="items-center gap-3">
              <Avatar>
                {profile.image && <AvatarImage src={profile.image} alt={profile.name ?? ""} />}
                <AvatarFallback>{(profile.name ?? "?").charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <H4>
                  <Link href={`/directory/${profile.slug}`}>{profile.name ?? "Anonymous"}</Link>
                </H4>
                {(profile.locationCity || profile.locationRegion) && (
                  <CardDescription>
                    {[profile.locationCity, profile.locationRegion].filter(Boolean).join(", ")}
                  </CardDescription>
                )}
              </div>
            </Stack>

            <Stack direction="row" className="mt-2 flex-wrap gap-1">
              <LineageTrustBadge status={profile.trustStatus} />
              {profile.claimBadgeStatus && <LineageClaimBadge status={profile.claimBadgeStatus} />}
              <Badge variant={profile.canRenderFullProfile ? "primary" : "soft"}>
                {profile.canRenderFullProfile ? "Full profile" : "Preview"}
              </Badge>
              {profile.profileTier !== "free" && (
                <Badge variant="outline">{profileTierLabel(profile.profileTier)}</Badge>
              )}
            </Stack>

            {profile.organizations.length > 0 && (
              <Stack direction="row" className="mt-2 flex-wrap gap-1">
                {profile.organizations.map(org => (
                  <Link key={org.id} href={`/organizations/${org.slug}`}>
                    <Badge variant="outline">{org.name}</Badge>
                  </Link>
                ))}
              </Stack>
            )}

            {profile.ranks.length > 0 && (
              <Stack direction="row" className="mt-2 flex-wrap gap-1">
                {profile.ranks.map(ra => (
                  <Badge key={ra.rank.id} variant="soft">
                    {ra.rank.name}
                  </Badge>
                ))}
              </Stack>
            )}

            {profile.email && (
              <CardDescription className="mt-2 text-xs">{profile.email}</CardDescription>
            )}
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

export { DirectoryList, type DirectoryListProps, type DirectoryProfile }
