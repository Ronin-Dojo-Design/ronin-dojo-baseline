import { LockKeyholeIcon } from "lucide-react"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Prose } from "~/components/common/prose"
import { QrShareButton } from "~/components/common/qr-share-button"
import { Stack } from "~/components/common/stack"
import { LineageClaimBadge, LineageTrustBadge } from "~/components/web/lineage/lineage-trust-badge"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { buildAbsoluteUrl, getRequestOrigin } from "~/lib/request-url"
import { findProfileBySlug } from "~/server/web/directory/queries"

type PageProps = {
  params: Promise<{ slug: string }>
}

function profileInitial(name: string | null | undefined) {
  return (name ?? "M").charAt(0).toUpperCase()
}

function profileTierLabel(tier: string) {
  if (tier === "legend") return "Legend"
  if (tier === "elite") return "Elite"
  if (tier === "premium") return "Premium"
  return "Free"
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const brand = await getRequestBrand()
  const profile = await findProfileBySlug({ slug, brand })

  if (!profile) return { title: "Profile Not Found" }

  return {
    title: profile.user.name ?? "Directory Profile",
    description: profile.canRenderFullProfile
      ? `View ${profile.user.name}'s profile in the directory.`
      : `View ${profile.user.name}'s directory listing preview.`,
  }
}

export default async function DirectoryProfilePage({ params }: PageProps) {
  const { slug } = await params
  const brand = await getRequestBrand()
  const session = await getServerSession()
  const viewerUserId = session?.user?.id ?? null

  const profile = await findProfileBySlug({
    slug,
    brand,
    viewerUserId,
    viewerRole: session?.user?.role,
  })

  if (!profile) {
    notFound()
  }

  const { user } = profile
  const origin = await getRequestOrigin()
  const profileUrl = buildAbsoluteUrl(`/directory/${slug}`, origin)

  return (
    <>
      <Intro>
        <Stack size="sm" wrap className="items-start justify-between">
          <Stack size="xs" direction="column">
            <IntroTitle>{user.name ?? "Directory Profile"}</IntroTitle>
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
          </Stack>
          {profile.canRenderFullProfile && (
            <QrShareButton
              url={profileUrl}
              title="Profile QR Code"
              description="Scan to open this public directory profile."
              fileName={`directory-${slug}`}
            />
          )}
        </Stack>
        {profile.locationCity && (
          <IntroDescription>
            {[profile.locationCity, profile.locationRegion, profile.locationCountry]
              .filter(Boolean)
              .join(", ")}
          </IntroDescription>
        )}
      </Intro>

      <Section>
        <div className="flex items-start gap-6">
          <Avatar className="size-20">
            {user.image && <AvatarImage src={user.image} alt={user.name ?? "Directory profile"} />}
            <AvatarFallback>{profileInitial(user.name)}</AvatarFallback>
          </Avatar>
          <Stack size="sm">
            {user.bio ? (
              <Prose>
                <p>{user.bio}</p>
              </Prose>
            ) : (
              !profile.canRenderFullProfile && (
                <Note>
                  This profile is currently published as a free listing. Full bio, links, school
                  details, and rank history unlock when the listing upgrades.
                </Note>
              )
            )}
            {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
          </Stack>
        </div>
      </Section>

      {user.ranks.length > 0 && (
        <Section>
          <H4>{profile.canRenderFullProfile ? "Ranks & Achievements" : "Rank Summary"}</H4>
          <Stack size="sm">
            {user.ranks.map(rankAward => (
              <div key={rankAward.id} className="flex items-center gap-2">
                <Badge variant="outline">{rankAward.rank?.name ?? "Rank"}</Badge>
                {rankAward.rank?.rankSystem?.name && (
                  <span className="text-sm text-muted-foreground">
                    {rankAward.rank.rankSystem.name}
                  </span>
                )}
              </div>
            ))}
          </Stack>
        </Section>
      )}

      {user.organizations.length > 0 && (
        <Section>
          <H4>Schools &amp; Organizations</H4>
          <Stack size="sm">
            {user.organizations.map(org => (
              <div key={org.id} className="flex items-center gap-2">
                <Link href={`/schools/${org.slug}`} className="font-medium">
                  {org.name}
                </Link>
                {org.discipline && <Badge variant="soft">{org.discipline.name}</Badge>}
              </div>
            ))}
          </Stack>
        </Section>
      )}

      {user.socialLinks && Object.keys(user.socialLinks).length > 0 && (
        <Section>
          <H4>Social</H4>
          <Stack size="sm" className="flex-wrap">
            {Object.entries(user.socialLinks as Record<string, string>).map(([platform, url]) => (
              <Link key={platform} href={url} target="_blank" rel="noopener noreferrer">
                <Badge variant="outline">{platform}</Badge>
              </Link>
            ))}
          </Stack>
        </Section>
      )}

      {!profile.canRenderFullProfile && (
        <Section>
          <Stack direction="column" size="sm" className="max-w-xl">
            <H4>Publish the full profile</H4>
            <Note>
              Premium and elite lineage listings publish the full public profile while free listings
              stay intentionally compact.
            </Note>
            <Button
              variant="primary"
              size="md"
              prefix={<LockKeyholeIcon />}
              render={<Link href="/lineage/join" />}
            >
              Upgrade listing
            </Button>
          </Stack>
        </Section>
      )}
    </>
  )
}
