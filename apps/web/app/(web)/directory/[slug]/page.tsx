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
import { ProfileClaimTeaser } from "~/components/web/claims/profile-claim-teaser"
import { LineageClaimBadge, LineageTrustBadge } from "~/components/web/lineage/lineage-trust-badge"
import { ListingDetail } from "~/components/web/listing/listing-detail"
import { ListingSaveButton } from "~/components/web/listing/listing-save-button"
import { BjjPassportCard } from "~/components/web/profile/bjj-passport-card"
import { IntroDescription } from "~/components/web/ui/intro"
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

  // Legacy placeholder (no real account) → show the claim teaser instead of an
  // empty profile. HIDDEN/private already 404'd above (findProfileBySlug); a
  // tier-gated profile still renders its listing preview below.
  if (profile.isClaimablePlaceholder) {
    return (
      <ProfileClaimTeaser
        subjectType="PERSON"
        subjectId={profile.id}
        name={user.name}
        avatarUrl={user.image}
        subtitle={[profile.locationCity, profile.locationRegion].filter(Boolean).join(", ") || null}
        tags={user.ranks.map(rankAward => rankAward.rank?.name).filter(Boolean) as string[]}
      />
    )
  }

  const origin = await getRequestOrigin()
  const profileUrl = buildAbsoluteUrl(`/directory/${slug}`, origin)

  const locationLine = profile.locationCity
    ? [profile.locationCity, profile.locationRegion, profile.locationCountry]
        .filter(Boolean)
        .join(", ")
    : null

  // BJJ Passport credential card (BBL_PARITY_SPEC Slice 1) — the signature shareable card, REUSED
  // (not duplicated) from the public projection. Current belt = highest earned RankAward, read
  // Passport-rooted (`passport.rankAwardsEarned`, exposed as `user.ranks`), so it is claim-invariant.
  const topRank = user.ranks[0]?.rank ?? null
  const passportRank = topRank ? { name: topRank.name, colorHex: topRank.colorHex } : null
  const passportSidebar = (
    <BjjPassportCard
      name={user.name ?? "Member"}
      rank={passportRank}
      school={user.organizations[0]?.name ?? null}
      avatarUrl={user.image}
    />
  )

  // Hero actions cluster: persisted Save (any rendered profile — the subject is the Passport, the
  // identity SoT) + QrShare, which stays gated to a fully-rendered profile as before.
  const heroActions = (
    <Stack size="sm">
      <ListingSaveButton
        subjectType="PERSON"
        subjectId={profile.passportId}
        size="md"
        showLabel={false}
      />
      {profile.canRenderFullProfile && (
        <QrShareButton
          url={profileUrl}
          title="Profile QR Code"
          description="Scan to open this public directory profile."
          fileName={`directory-${slug}`}
        />
      )}
    </Stack>
  )

  return (
    <ListingDetail
      media={
        <Avatar className="size-12">
          {user.image && <AvatarImage src={user.image} alt={user.name ?? "Directory profile"} />}
          <AvatarFallback>{profileInitial(user.name)}</AvatarFallback>
        </Avatar>
      }
      title={user.name ?? "Directory Profile"}
      badges={
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
      }
      actions={heroActions}
      intro={locationLine && <IntroDescription>{locationLine}</IntroDescription>}
      sidebar={passportSidebar}
    >
      <Section>
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
    </ListingDetail>
  )
}
