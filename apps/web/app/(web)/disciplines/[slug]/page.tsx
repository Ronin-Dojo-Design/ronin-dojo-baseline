import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Grid } from "~/components/web/ui/grid"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import { generateCollectionPage } from "~/lib/structured-data"
import {
  findDisciplineBySlug,
  findDisciplineMembersByRank,
  findDisciplineSlugs,
  findDisciplineVideos,
  findRelatedDisciplines,
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

export async function generateStaticParams() {
  const disciplines = await findDisciplineSlugs()
  return disciplines.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brand = await getRequestBrand()
  const discipline = await findDisciplineBySlug(brand, slug)

  if (!discipline) return { title: "Discipline Not Found" }

  return await getPageMetadata({
    url: `/disciplines/${discipline.slug}`,
    metadata: {
      title: discipline.name,
      description: `${discipline.name} — ${discipline._count.rankSystems} rank systems, ${discipline._count.organizations} organizations`,
    },
  })
}

export default async function DisciplineDetailPage({ params }: Props) {
  const { slug } = await params
  const brand = await getRequestBrand()
  const discipline = await findDisciplineBySlug(brand, slug)

  if (!discipline) notFound()

  const [videos, membersByRank, relatedDisciplines] = await Promise.all([
    findDisciplineVideos(discipline.id),
    findDisciplineMembersByRank(discipline.id),
    findRelatedDisciplines({ disciplineId: discipline.id, brand }),
  ])

  const hasHistory = Boolean(
    discipline.foundedBy || discipline.yearEstablished || discipline.history,
  )

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

      {/* Rank Systems + Overview/History sidebar */}
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

        <Section.Sidebar>
          <Card hover={false}>
            <CardHeader>
              <H4>Overview</H4>
            </CardHeader>
            <CardDescription>
              <Stack direction="column" className="items-start">
                <span>
                  <span className="text-muted-foreground">Programs: </span>
                  <span className="font-medium">{discipline._count.programs}</span>
                </span>
                <span>
                  <span className="text-muted-foreground">Courses: </span>
                  <span className="font-medium">{discipline._count.courses}</span>
                </span>
                <span>
                  <span className="text-muted-foreground">Techniques: </span>
                  <span className="font-medium">{discipline._count.techniques}</span>
                </span>
              </Stack>
            </CardDescription>
          </Card>

          {hasHistory && (
            <Card hover={false}>
              <CardHeader>
                <H4>History</H4>
              </CardHeader>
              <CardDescription>
                <Stack size="sm" direction="column" className="items-start">
                  {discipline.foundedBy && <FounderCarousel founders={discipline.foundedBy} />}
                  {discipline.yearEstablished && (
                    <p className="text-sm text-muted-foreground">
                      Established {discipline.yearEstablished}
                    </p>
                  )}
                  {discipline.history && <p className="text-sm">{discipline.history}</p>}
                </Stack>
              </CardDescription>
            </Card>
          )}
        </Section.Sidebar>
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
          <LineageTreeSection brand={brand} disciplineCode={discipline.code} />
        </Section.Content>
      </Section>

      {/* Related Disciplines */}
      {relatedDisciplines.length > 0 && (
        <Section>
          <Section.Content>
            <H4>Related Disciplines</H4>
            <Grid>
              {relatedDisciplines.map(rd => (
                <Card key={rd.id} isRevealed>
                  <CardHeader>
                    <H4 render={props => <h3 {...props}>{props.children}</h3>} className="truncate">
                      <Link href={`/disciplines/${rd.slug}`}>
                        <span className="absolute inset-0 z-10" />
                        {rd.name}
                      </Link>
                    </H4>
                  </CardHeader>
                  <CardDescription>
                    {rd._count.organizations} organizations · {rd._count.rankSystems} rank systems
                  </CardDescription>
                  {rd.code && (
                    <Stack size="sm" className="flex-wrap">
                      <Badge variant="outline">{rd.code}</Badge>
                    </Stack>
                  )}
                </Card>
              ))}
            </Grid>
          </Section.Content>
        </Section>
      )}

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
