import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Prose } from "~/components/common/prose"
import { Stack } from "~/components/common/stack"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { findProfileBySlug } from "~/server/web/directory/queries"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const brand = await getRequestBrand()
  const profile = await findProfileBySlug({ slug, brand })

  if (!profile) return { title: "Member Not Found" }

  return {
    title: profile.user.name ?? "Member Profile",
    description: `View ${profile.user.name}'s profile in the member directory.`,
  }
}

export default async function MemberDetailPage({ params }: PageProps) {
  const { slug } = await params
  const brand = await getRequestBrand()
  const session = await getServerSession()
  const viewerUserId = session?.user?.id ?? null

  const profile = await findProfileBySlug({ slug, brand, viewerUserId })

  if (!profile) {
    notFound()
  }

  const { user } = profile

  return (
    <>
      <Intro>
        <IntroTitle>{user.name ?? "Member"}</IntroTitle>
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
            {user.image && <AvatarImage src={user.image} alt={user.name ?? "Member"} />}
            <AvatarFallback>{(user.name ?? "M").charAt(0)}</AvatarFallback>
          </Avatar>
          <Stack size="sm">
            {user.bio && (
              <Prose>
                <p>{user.bio}</p>
              </Prose>
            )}
            {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
          </Stack>
        </div>
      </Section>

      {/* Organizations / Schools */}
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

      {/* Ranks */}
      {user.ranks.length > 0 && (
        <Section>
          <H4>Ranks &amp; Achievements</H4>
          <Stack size="sm">
            {user.ranks.map((rank: any) => (
              <div key={rank.id} className="flex items-center gap-2">
                <Badge variant="outline">{rank.rank?.name ?? "Rank"}</Badge>
                {rank.discipline && (
                  <span className="text-sm text-muted-foreground">{rank.discipline.name}</span>
                )}
              </div>
            ))}
          </Stack>
        </Section>
      )}

      {/* Social links */}
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
    </>
  )
}
