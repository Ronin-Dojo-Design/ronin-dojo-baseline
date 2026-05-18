import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { Brand } from "~/.generated/prisma/client"
import { Badge } from "~/components/common/badge"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { findProfileBySlug } from "~/server/web/directory/queries"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? Brand.RONIN_DOJO_DESIGN
  const profile = await findProfileBySlug({ slug, brand })

  if (!profile) return { title: "Member Not Found" }

  return {
    title: profile.user.name ?? "Member Profile",
    description: profile.user.bio
      ? profile.user.bio.slice(0, 160)
      : `View ${profile.user.name}'s profile`,
  }
}

export default async function MemberDetailPage({ params }: Props) {
  const { slug } = await params
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? Brand.RONIN_DOJO_DESIGN
  const session = await getServerSession()

  const profile = await findProfileBySlug({
    slug,
    brand,
    viewerUserId: session?.user?.id,
  })

  if (!profile) notFound()

  const locationParts = [
    profile.locationCity,
    profile.locationRegion,
    profile.locationCountry,
  ].filter(Boolean)

  return (
    <>
      <Intro>
        <IntroTitle>{profile.user.name ?? "Member"}</IntroTitle>
        {locationParts.length > 0 && (
          <IntroDescription>📍 {locationParts.join(", ")}</IntroDescription>
        )}
      </Intro>

      {/* Bio */}
      {profile.user.bio && (
        <Section>
          <Section.Content>
            <p className="text-secondary-foreground italic">&ldquo;{profile.user.bio}&rdquo;</p>
          </Section.Content>
        </Section>
      )}

      {/* Ranks */}
      {profile.user.ranks.length > 0 && (
        <Section>
          <Section.Content>
            <H4>Ranks</H4>
            <Stack size="sm" className="flex-wrap mt-2">
              {profile.user.ranks.map(award => (
                <Badge key={award.rank.id} variant="soft">
                  {award.rank.name} — {award.rank.rankSystem.name}
                </Badge>
              ))}
            </Stack>
          </Section.Content>
        </Section>
      )}

      {/* Organizations */}
      {profile.user.organizations.length > 0 && (
        <Section>
          <Section.Content>
            <H4>Schools</H4>
            <div className="grid gap-3 mt-2">
              {profile.user.organizations.map(org => (
                <Link
                  key={org.id}
                  href={`/organizations/${org.slug}`}
                  className="flex items-center gap-2 text-sm hover:underline"
                >
                  <span className="font-medium">{org.name}</span>
                  {org.discipline && (
                    <Badge size="sm" variant="outline">
                      {org.discipline.name}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          </Section.Content>
        </Section>
      )}

      {/* Technique Progress */}
      {profile.user.techniqueProgress.length > 0 && (
        <Section>
          <Section.Content>
            <H4>Technique Progress</H4>
            <p className="text-sm text-muted-foreground mt-2">
              {profile.user.techniqueProgress.length} technique
              {profile.user.techniqueProgress.length !== 1 ? "s" : ""} logged
              {" · "}
              {profile.user.techniqueProgress.filter(tp => tp.verifiedById).length} verified
            </p>
          </Section.Content>
        </Section>
      )}

      {/* Contact */}
      {profile.user.email && (
        <Section>
          <Section.Content>
            <H4>Contact</H4>
            <p className="text-sm mt-2">
              ✉{" "}
              <a href={`mailto:${profile.user.email}`} className="text-primary underline">
                {profile.user.email}
              </a>
            </p>
          </Section.Content>
        </Section>
      )}
    </>
  )
}
