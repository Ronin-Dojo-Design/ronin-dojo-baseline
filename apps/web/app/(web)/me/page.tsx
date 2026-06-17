import { ExternalLinkIcon, PencilIcon } from "lucide-react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { Button } from "~/components/common/button"
import { Card, CardHeader } from "~/components/common/card"
import { H4, H5 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Prose } from "~/components/common/prose"
import { Stack } from "~/components/common/stack"
import { LineageRankHistoryTab } from "~/components/web/lineage/lineage-rank-history-tab"
import { ListingDetail } from "~/components/web/listing/listing-detail"
import { BjjPassportCard } from "~/components/web/profile/bjj-passport-card"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { IntroDescription } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import type { AffiliationRole, DirectoryVisibility } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import { getOwnDirectoryProfile } from "~/server/web/directory/queries"
import type { MyProfile, MyProfileAffiliation } from "~/server/web/directory/profile-projection"
import { getOwnLineageProfile } from "~/server/web/lineage/queries"
import { getDashboardMediaAttachments } from "~/server/web/media/queries"

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url: "/me",
    metadata: {
      title: "My Passport",
      description: "Your martial arts identity, promotion history, and directory profile.",
      robots: { index: false, follow: false },
    },
  })
}

const VISIBILITY_LABEL: Record<DirectoryVisibility, string> = {
  PUBLIC: "Public",
  MEMBERS_ONLY: "Members only",
  HIDDEN: "Hidden",
}

const AFFILIATION_ROLE_LABEL: Record<AffiliationRole, string> = {
  TRAINS_AT: "Trains at",
  TEACHES_AT: "Teaches at",
  HEAD_INSTRUCTOR: "Head instructor",
  OWNER: "Owner",
  MEMBER: "Member",
}

function profileInitial(name: string | null | undefined) {
  return (name ?? "M").charAt(0).toUpperCase()
}

function formatYear(date: Date | null): string | null {
  if (!date) {
    return null
  }
  const year = new Date(date).getUTCFullYear()
  return Number.isNaN(year) ? null : String(year)
}

export default async function MePage() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/auth/login")
  }

  const brand = await getRequestBrand()
  const userId = session.user.id
  const profile = await getOwnDirectoryProfile({ userId, brand })

  // Post-S2 sign-up always creates a Passport + DirectoryProfile, but degrade
  // gracefully (no redirect loop) if the profile hasn't been provisioned yet.
  if (!profile) {
    return (
      <>
        <Breadcrumbs items={[{ url: "/me", title: "My Passport" }]} />
        <Section>
          <Section.Content>
            <Card hover={false} className="max-w-xl">
              <CardHeader>
                <H4>Set up your Passport</H4>
              </CardHeader>
              <Note>
                Your member profile isn&apos;t set up yet. Add your identity details to publish a
                profile.
              </Note>
              <Button
                variant="primary"
                prefix={<PencilIcon />}
                render={<Link href="/app/profile" />}
              >
                Complete your profile
              </Button>
            </Card>
          </Section.Content>
        </Section>
      </>
    )
  }

  const [lineageProfile, attachments] = await Promise.all([
    profile.lineageNodeId ? getOwnLineageProfile(userId) : Promise.resolve(null),
    getDashboardMediaAttachments({
      brand,
      user: session.user,
      target: { kind: "passport", id: profile.passportId },
    }),
  ])

  const galleryImages = (attachments ?? []).filter(attachment => attachment.type === "IMAGE")
  const isPublic = profile.visibility === "PUBLIC"

  const heroActions = (
    <Stack size="sm">
      <Button
        variant="primary"
        size="md"
        prefix={<PencilIcon />}
        render={<Link href="/app/profile" />}
      >
        Edit profile
      </Button>
      {isPublic && profile.slug && (
        <Button
          variant="secondary"
          size="md"
          prefix={<ExternalLinkIcon />}
          render={<Link href={`/directory/${profile.slug}`} />}
        >
          View public profile
        </Button>
      )}
    </Stack>
  )

  return (
    <>
      <Breadcrumbs items={[{ url: "/me", title: "My Passport" }]} />

      <ListingDetail
        media={
          <Avatar className="size-12">
            {profile.avatarUrl && (
              <AvatarImage src={profile.avatarUrl} alt={profile.name ?? "My profile"} />
            )}
            <AvatarFallback>{profileInitial(profile.name)}</AvatarFallback>
          </Avatar>
        }
        title={profile.name ?? "My Passport"}
        badges={
          <Stack size="xs" wrap>
            {profile.currentRank && (
              <Badge
                variant="primary"
                prefix={<BeltSwatch colorHex={profile.currentRank.colorHex} />}
              >
                {profile.currentRank.name}
              </Badge>
            )}
            <Badge variant={isPublic ? "soft" : "outline"}>
              {VISIBILITY_LABEL[profile.visibility]}
            </Badge>
          </Stack>
        }
        actions={heroActions}
        intro={profile.locationLine && <IntroDescription>{profile.locationLine}</IntroDescription>}
        sidebar={<ProfileSidebar profile={profile} />}
      >
        <Section>
          <H4>About</H4>
          {profile.bio ? (
            <Prose>
              <p>{profile.bio}</p>
            </Prose>
          ) : (
            <Note>
              No bio yet. Add a short introduction from{" "}
              <Link href="/app/profile">your profile editor</Link>.
            </Note>
          )}
        </Section>

        <Section>
          <H4>Belt history</H4>
          {lineageProfile ? (
            <LineageRankHistoryTab profile={lineageProfile} />
          ) : (
            <Note>
              No promotions recorded yet. Once an instructor logs a promotion it appears here as a
              dated, attributed timeline.
            </Note>
          )}
        </Section>

        {galleryImages.length > 0 && (
          <Section>
            <H4>Gallery</H4>
            <ul className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
              {galleryImages.map(image => (
                <li key={image.attachmentId} className="overflow-hidden rounded-lg border bg-card">
                  {/* eslint-disable-next-line @next/next/no-img-element -- public media URL (R2/S3), no Next loader */}
                  <img
                    src={image.url}
                    alt={image.altText ?? image.title ?? "Profile photo"}
                    className="aspect-square size-full object-cover"
                    loading="lazy"
                  />
                </li>
              ))}
            </ul>
          </Section>
        )}
      </ListingDetail>
    </>
  )
}

function ProfileSidebar({ profile }: { profile: MyProfile }) {
  const trainingSince = formatYear(profile.startedTrainingAt)
  const identityRows = [
    { label: "Born in", value: profile.placeOfBirth },
    { label: "Based in", value: profile.locationLine },
    { label: "Training since", value: trainingSince },
  ].filter(row => row.value)

  return (
    <>
      <BjjPassportCard
        name={profile.name ?? "Member"}
        rank={profile.currentRank}
        school={profile.schoolLabel}
        avatarUrl={profile.avatarUrl}
        disciplineLabel={profile.currentRank?.disciplineLabel ?? undefined}
      />

      {identityRows.length > 0 && (
        <Card hover={false}>
          <CardHeader>
            <H5>Identity</H5>
          </CardHeader>
          <Stack direction="column" size="sm" className="w-full">
            {identityRows.map(row => (
              <Stack key={row.label} className="w-full items-baseline justify-between gap-3">
                <Note className="shrink-0">{row.label}</Note>
                <span className="truncate text-right text-sm">{row.value}</span>
              </Stack>
            ))}
          </Stack>
        </Card>
      )}

      {profile.affiliations.length > 0 && (
        <Card hover={false}>
          <CardHeader>
            <H5>Schools &amp; affiliations</H5>
          </CardHeader>
          <Stack direction="column" size="sm" className="w-full">
            {profile.affiliations.map(affiliation => (
              <AffiliationRow key={affiliation.id} affiliation={affiliation} />
            ))}
          </Stack>
        </Card>
      )}

      {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
        <Card hover={false}>
          <CardHeader>
            <H5>Social</H5>
          </CardHeader>
          <Stack size="sm" wrap className="w-full">
            {Object.entries(profile.socialLinks).map(([platform, url]) => (
              <Link key={platform} href={url} target="_blank" rel="noopener noreferrer">
                <Badge variant="outline">{platform}</Badge>
              </Link>
            ))}
          </Stack>
        </Card>
      )}
    </>
  )
}

function AffiliationRow({ affiliation }: { affiliation: MyProfileAffiliation }) {
  return (
    <Stack className="w-full items-center justify-between gap-2">
      <Stack direction="column" size="xs" className="min-w-0">
        <Note className="text-xs">{AFFILIATION_ROLE_LABEL[affiliation.role]}</Note>
        {affiliation.slug ? (
          <Link href={`/schools/${affiliation.slug}`} className="truncate font-medium text-sm">
            {affiliation.name ?? "School"}
          </Link>
        ) : (
          <span className="truncate font-medium text-sm">{affiliation.name ?? "School"}</span>
        )}
      </Stack>
      {!affiliation.isCurrent && (
        <Badge variant="outline" size="sm">
          Past
        </Badge>
      )}
    </Stack>
  )
}
