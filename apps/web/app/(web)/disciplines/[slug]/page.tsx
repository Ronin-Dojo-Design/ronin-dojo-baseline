import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { Brand } from "~/.generated/prisma/client"
import { Badge } from "~/components/common/badge"
import { Card, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { generateCollectionPage } from "~/lib/structured-data"
import {
  findDisciplineBySlug,
  findDisciplineMembersByRank,
  findDisciplineVideos,
} from "~/server/web/disciplines/queries"
import { BlackBeltRail } from "../_components/black-belt-rail"
import { ContentAtomsSection } from "../_components/content-atoms-section"
import { CoursesSection } from "../_components/courses-section"
import { FounderCarousel } from "../_components/founder-carousel"
import { LineageTreeSection } from "../_components/lineage-tree-section"
import { MemberCarouselByRank } from "../_components/member-carousel-by-rank"
import { SchoolsSection } from "../_components/schools-section"
import { VideoCarousel } from "../_components/video-carousel"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? Brand.BASELINE_MARTIAL_ARTS
  const discipline = await findDisciplineBySlug(brand, slug)

  if (!discipline) return { title: "Discipline Not Found" }

  return {
    title: discipline.name,
    description: `${discipline.name} — ${discipline._count.rankSystems} rank systems, ${discipline._count.organizations} organizations`,
  }
}

export default async function DisciplineDetailPage({ params }: Props) {
  const { slug } = await params
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? Brand.BASELINE_MARTIAL_ARTS
  const discipline = await findDisciplineBySlug(brand, slug)

  if (!discipline) notFound()

  const [videos, membersByRank] = await Promise.all([
    findDisciplineVideos(discipline.id),
    findDisciplineMembersByRank(discipline.id),
  ])

  return (
    <>
      <Breadcrumbs
        items={[
          { url: "/disciplines", title: "Disciplines" },
          { url: `/disciplines/${discipline.slug}`, title: discipline.name },
        ]}
      />

      <Intro>
        <IntroTitle>{discipline.name}</IntroTitle>
        <IntroDescription>
          <Stack size="sm">
            {discipline.code && (
              <Badge variant="outline" size="lg">
                {discipline.code}
              </Badge>
            )}
            <span>
              {discipline._count.memberships} member{discipline._count.memberships !== 1 ? "s" : ""}
            </span>
            <span>·</span>
            <span>
              {discipline._count.organizations} organization
              {discipline._count.organizations !== 1 ? "s" : ""}
            </span>
          </Stack>
        </IntroDescription>
      </Intro>

      {/* Rank Systems */}
      <Section>
        <Section.Content>
          <H4>Rank Systems ({discipline.rankSystems.length})</H4>
          {discipline.rankSystems.length > 0 ? (
            <div className="grid gap-3 @md:grid-cols-2 mt-4">
              {discipline.rankSystems.map(rs => (
                <Card key={rs.id}>
                  <CardHeader>
                    <Stack size="sm">
                      <span className="font-medium">{rs.name}</span>
                      <Badge variant="soft" size="sm">
                        {rs.kind}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{rs._count.ranks} ranks</span>
                    </Stack>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground mt-2">No rank systems defined.</p>
          )}
        </Section.Content>
      </Section>

      {/* Organizations */}
      <Section>
        <Section.Content>
          <H4>Organizations ({discipline._count.organizations})</H4>
          {discipline.organizations.length > 0 ? (
            <div className="grid gap-3 @md:grid-cols-2 @lg:grid-cols-3 mt-4">
              {discipline.organizations.map(({ organization: org }) => (
                <Link key={org.id} href={`/organizations/${org.slug}`} className="no-underline">
                  <Card className="h-full transition-colors hover:border-foreground/20">
                    <CardHeader>
                      <Stack size="sm" direction="column">
                        <span className="font-medium">{org.name}</span>
                        <Stack size="xs" className="text-sm text-muted-foreground">
                          <Badge variant="outline" size="sm">
                            {org.type}
                          </Badge>
                          {(org.city || org.state) && (
                            <span>{[org.city, org.state].filter(Boolean).join(", ")}</span>
                          )}
                        </Stack>
                      </Stack>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground mt-2">No affiliated organizations.</p>
          )}
        </Section.Content>
      </Section>

      {/* Styles */}
      {discipline.styles.length > 0 && (
        <Section>
          <Section.Content>
            <H4>Styles ({discipline.styles.length})</H4>
            <Stack size="sm" wrap className="mt-4">
              {discipline.styles.map(style => (
                <Badge key={style.id} variant="soft">
                  {style.name}
                </Badge>
              ))}
            </Stack>
          </Section.Content>
        </Section>
      )}

      {/* Stats */}
      <Section>
        <Section.Content>
          <H4>Overview</H4>
          <dl className="grid gap-2 text-sm mt-4 @md:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Programs</dt>
              <dd className="font-medium">{discipline._count.programs}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Courses</dt>
              <dd className="font-medium">{discipline._count.courses}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Techniques</dt>
              <dd className="font-medium">{discipline._count.techniques}</dd>
            </div>
          </dl>
        </Section.Content>
      </Section>

      {/* Founder / History */}
      {(discipline.foundedBy || discipline.yearEstablished || discipline.history) && (
        <Section>
          <Section.Content>
            <H4>History</H4>
            <Stack size="sm" direction="column" className="mt-4">
              {discipline.foundedBy && <FounderCarousel founders={discipline.foundedBy} />}
              {discipline.yearEstablished && (
                <p className="text-sm text-muted-foreground">
                  Established {discipline.yearEstablished}
                </p>
              )}
              {discipline.history && <p className="text-sm">{discipline.history}</p>}
            </Stack>
          </Section.Content>
        </Section>
      )}

      {/* Courses & Certifications */}
      <Section>
        <Section.Content>
          <CoursesSection disciplineId={discipline.id} brand={brand} />
        </Section.Content>
      </Section>

      {/* Schools */}
      <Section>
        <Section.Content>
          <SchoolsSection disciplineId={discipline.id} brand={brand} />
        </Section.Content>
      </Section>

      {/* Black Belt Rail */}
      <Section>
        <Section.Content>
          <BlackBeltRail disciplineId={discipline.id} brand={brand} />
        </Section.Content>
      </Section>

      {/* Content Atoms */}
      <Section>
        <Section.Content>
          <ContentAtomsSection disciplineId={discipline.id} brand={brand} />
        </Section.Content>
      </Section>

      {/* Videos */}
      {videos.length > 0 && (
        <Section>
          <Section.Content>
            <VideoCarousel videos={videos} />
          </Section.Content>
        </Section>
      )}

      {/* Members by Rank */}
      {membersByRank.length > 0 && (
        <Section>
          <Section.Content>
            <MemberCarouselByRank members={membersByRank} />
          </Section.Content>
        </Section>
      )}

      {/* Lineage (Baseline-only) */}
      <Section>
        <Section.Content>
          <LineageTreeSection brand={brand} />
        </Section.Content>
      </Section>

      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            generateCollectionPage(
              `/disciplines/${discipline.slug}`,
              discipline.name,
              `${discipline.name} — rank systems, organizations, and training programs`,
            ),
          ],
        }}
      />
    </>
  )
}
