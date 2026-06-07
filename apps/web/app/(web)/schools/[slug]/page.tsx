import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { EducationalOrganization, PostalAddress } from "schema-dts"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { OrgClaimCta } from "~/components/web/claims/org-claim-cta"
import { PromotionTimeline } from "~/components/web/promotion-events/promotion-timeline"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Grid } from "~/components/web/ui/grid"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { siteConfig } from "~/config/site"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import { generateCollectionPage } from "~/lib/structured-data"
import { getPromotionTimelineForOrganization } from "~/server/web/promotion-events/queries"
import { findRelatedSchools, findSchoolBySlug, findSchoolSlugs } from "~/server/web/schools/queries"

// Role codes that surface a membership as an "instructor" on the school page.
// Today only INSTRUCTOR is seeded; HEAD_INSTRUCTOR is forward-compatible
// (per SESSION_0238_TASK_02 spec) and simply won't match until that role
// code is introduced.
const INSTRUCTOR_ROLE_CODES = new Set(["INSTRUCTOR", "HEAD_INSTRUCTOR"])

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const schools = await findSchoolSlugs()
  return schools.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brand = await getRequestBrand()
  const school = await findSchoolBySlug({ brand, slug })

  if (!school) return { title: "School Not Found" }

  const locality = [school.city, school.state].filter(Boolean).join(", ")
  const description =
    school.description ??
    `${school.name}${locality ? ` — ${locality}` : ""}. ${school._count.memberships} member${
      school._count.memberships !== 1 ? "s" : ""
    }, ${school._count.programs} program${school._count.programs !== 1 ? "s" : ""}.`

  return await getPageMetadata({
    url: `/schools/${school.slug}`,
    metadata: {
      title: school.name,
      description,
    },
  })
}

export default async function SchoolDetailPage({ params }: Props) {
  const { slug } = await params
  const brand = await getRequestBrand()
  const school = await findSchoolBySlug({ brand, slug })

  if (!school) notFound()

  const [relatedSchools, promotionTimeline, session] = await Promise.all([
    findRelatedSchools({
      schoolId: school.id,
      brand,
      city: school.city,
      state: school.state,
    }),
    getPromotionTimelineForOrganization(school.id),
    getServerSession(),
  ])

  // Derived values --------------------------------------------------------

  const addressParts = [
    school.addressLine1,
    school.addressLine2,
    school.city,
    school.state,
    school.zip,
    school.country,
  ].filter(Boolean)
  const formattedAddress = addressParts.length > 0 ? addressParts.join(", ") : null

  const instructors = school.memberships.filter(
    m =>
      m.status === "ACTIVE" &&
      m.roleAssignments.some(ra => INSTRUCTOR_ROLE_CODES.has(ra.role.code)),
  )

  const classesPerWeek = school.classSchedules
    .filter(cs => cs.status === "ACTIVE")
    .reduce((acc, cs) => acc + cs.daysOfWeek.length, 0)

  // Structured data: WebPage CollectionPage + EducationalOrganization ----

  const educationalOrg: EducationalOrganization = {
    "@type": "EducationalOrganization",
    "@id": `${siteConfig.url}/schools/${school.slug}#school`,
    name: school.name,
    url: `${siteConfig.url}/schools/${school.slug}`,
    description: school.description ?? undefined,
    ...(formattedAddress
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress:
              [school.addressLine1, school.addressLine2].filter(Boolean).join(", ") || undefined,
            addressLocality: school.city ?? undefined,
            addressRegion: school.state ?? undefined,
            postalCode: school.zip ?? undefined,
            addressCountry: school.country ?? undefined,
          } satisfies PostalAddress,
        }
      : {}),
    ...(school.phoneE164 ? { telephone: school.phoneE164 } : {}),
    ...(school.email ? { email: school.email } : {}),
    ...(school.websiteUrl ? { sameAs: school.websiteUrl } : {}),
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { url: "/schools", title: "Schools" },
          { url: `/schools/${school.slug}`, title: school.name },
        ]}
      />

      <Intro>
        <IntroTitle>{school.name}</IntroTitle>
        <IntroDescription>
          <Stack size="sm" className="flex-wrap">
            <Badge variant="outline" size="lg">
              {school.type.replace(/_/g, " ")}
            </Badge>
            {school.disciplines.map(od => (
              <Badge key={od.discipline.id} size="lg">
                <Link href={`/disciplines/${od.discipline.slug}`}>{od.discipline.name}</Link>
              </Badge>
            ))}
            <span className="text-sm text-muted-foreground">
              {school._count.memberships} member{school._count.memberships !== 1 ? "s" : ""}
            </span>
            {formattedAddress && (
              <span className="text-sm text-muted-foreground">{formattedAddress}</span>
            )}
          </Stack>
        </IntroDescription>
      </Intro>

      {!school.ownerId && (
        <OrgClaimCta
          organizationId={school.id}
          organizationName={school.name}
          noun="school"
          returnPath={`/schools/${school.slug}`}
          isSignedIn={Boolean(session?.user)}
        />
      )}

      {/* Address + Disciplines content / Overview + Contact + Affiliation sidebar */}
      <Section>
        <Section.Content>
          {school.description && (
            <div className="space-y-2">
              <H4>About</H4>
              <p className="text-sm text-secondary-foreground text-pretty">{school.description}</p>
            </div>
          )}

          {formattedAddress && (
            <Card hover={false}>
              <CardHeader>
                <H4>Address</H4>
              </CardHeader>
              <CardDescription>
                <p className="text-sm">{formattedAddress}</p>
              </CardDescription>
            </Card>
          )}

          {school.disciplines.length > 0 && (
            <div className="space-y-3">
              <H4>Disciplines</H4>
              <Stack size="sm" className="flex-wrap">
                {school.disciplines.map(od => (
                  <Link
                    key={od.discipline.id}
                    href={`/disciplines/${od.discipline.slug}`}
                    className="no-underline"
                  >
                    <Badge variant="soft" size="lg">
                      {od.discipline.name}
                    </Badge>
                  </Link>
                ))}
              </Stack>
            </div>
          )}

          <PromotionTimeline
            entries={promotionTimeline}
            emptyMessage="No hosted promotion events or awarded ranks are linked to this school yet."
          />
        </Section.Content>

        <Section.Sidebar>
          <Card hover={false}>
            <CardHeader>
              <H4>Overview</H4>
            </CardHeader>
            <CardDescription>
              <Stack direction="column" className="items-start">
                <span>
                  <span className="text-muted-foreground">Instructors: </span>
                  <span className="font-medium">{instructors.length}</span>
                </span>
                <span>
                  <span className="text-muted-foreground">Members: </span>
                  <span className="font-medium">{school._count.memberships}</span>
                </span>
                <span>
                  <span className="text-muted-foreground">Programs: </span>
                  <span className="font-medium">{school._count.programs}</span>
                </span>
                {classesPerWeek > 0 && (
                  <span>
                    <span className="text-muted-foreground">Classes / week: </span>
                    <span className="font-medium">{classesPerWeek}</span>
                  </span>
                )}
              </Stack>
            </CardDescription>
          </Card>

          {(school.websiteUrl || school.phoneE164 || school.email) && (
            <Card hover={false}>
              <CardHeader>
                <H4>Contact</H4>
              </CardHeader>
              <CardDescription>
                <Stack direction="column" className="items-start">
                  {school.websiteUrl && (
                    <Link href={school.websiteUrl} target="_blank" rel="noopener noreferrer">
                      Website
                    </Link>
                  )}
                  {school.phoneE164 && (
                    <Link href={`tel:${school.phoneE164}`}>{school.phoneE164}</Link>
                  )}
                  {school.email && <Link href={`mailto:${school.email}`}>{school.email}</Link>}
                </Stack>
              </CardDescription>
            </Card>
          )}

          {school.parentRelationships.length > 0 && (
            <Card hover={false}>
              <CardHeader>
                <H4>Affiliations</H4>
              </CardHeader>
              <CardDescription>
                <Stack direction="column" className="items-start">
                  {school.parentRelationships.map(pr => {
                    const isSchoolType =
                      pr.parentOrg.type === "DOJO" || pr.parentOrg.type === "SCHOOL"
                    const href = isSchoolType
                      ? `/schools/${pr.parentOrg.slug}`
                      : `/organizations/${pr.parentOrg.slug}`
                    return (
                      <span key={pr.id} className="text-sm">
                        Part of <Link href={href}>{pr.parentOrg.name}</Link>
                      </span>
                    )
                  })}
                </Stack>
              </CardDescription>
            </Card>
          )}
        </Section.Sidebar>
      </Section>

      {/* Instructors */}
      {instructors.length > 0 && (
        <Section>
          <Section.Content>
            <H4>Instructors ({instructors.length})</H4>
            <div className="grid gap-3 @md:grid-cols-2 @lg:grid-cols-3 mt-4">
              {instructors.map(m => (
                <Card key={m.id} hover={false}>
                  <CardHeader>
                    <Stack size="sm" direction="column">
                      <span className="font-medium">{m.user.name ?? "Unknown"}</span>
                      <Stack size="xs" className="flex-wrap">
                        {m.roleAssignments
                          .filter(ra => INSTRUCTOR_ROLE_CODES.has(ra.role.code))
                          .map(ra => (
                            <Badge key={ra.role.id} variant="soft" size="sm">
                              {ra.role.displayTitle ?? ra.role.name}
                            </Badge>
                          ))}
                        {m.discipline && (
                          <Badge variant="outline" size="sm">
                            {m.discipline.name}
                          </Badge>
                        )}
                        {m.rank && (
                          <Badge variant="outline" size="sm">
                            {m.rank.name}
                          </Badge>
                        )}
                      </Stack>
                    </Stack>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </Section.Content>
        </Section>
      )}

      {/* Programs offered */}
      {school.programs.length > 0 && (
        <Section>
          <Section.Content>
            <H4>Programs offered ({school.programs.length})</H4>
            <div className="grid gap-3 @md:grid-cols-2 @lg:grid-cols-3 mt-4">
              {school.programs.map(p => (
                <Card key={p.id} hover={false}>
                  <CardHeader>
                    <Stack size="sm" direction="column">
                      <span className="font-medium">{p.name}</span>
                      <Stack size="xs" className="flex-wrap">
                        {p.discipline && (
                          <Badge variant="outline" size="sm">
                            {p.discipline.name}
                          </Badge>
                        )}
                        {(p.ageMin != null || p.ageMax != null) && (
                          <Badge variant="soft" size="sm">
                            Ages {p.ageMin ?? "?"}–{p.ageMax ?? "?"}
                          </Badge>
                        )}
                      </Stack>
                      {p.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {p.description}
                        </p>
                      )}
                    </Stack>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </Section.Content>
        </Section>
      )}

      {/* Related Schools */}
      {relatedSchools.length > 0 && (
        <Section>
          <Section.Content>
            <H4>Related Schools</H4>
            <Grid>
              {relatedSchools.map(rs => (
                <Card key={rs.id} isRevealed>
                  <CardHeader>
                    <H4 render={props => <h3 {...props}>{props.children}</h3>} className="truncate">
                      <Link href={`/schools/${rs.slug}`}>
                        <span className="absolute inset-0 z-10" />
                        {rs.name}
                      </Link>
                    </H4>
                  </CardHeader>
                  <CardDescription>
                    {rs.description ??
                      `${rs.type.replace(/_/g, " ")} — ${rs._count.memberships} member${rs._count.memberships !== 1 ? "s" : ""}`}
                  </CardDescription>
                  <Stack size="sm" className="flex-wrap">
                    <Badge variant="outline">{rs.type.replace(/_/g, " ")}</Badge>
                    {(rs.city || rs.state) && (
                      <Badge variant="soft">{[rs.city, rs.state].filter(Boolean).join(", ")}</Badge>
                    )}
                  </Stack>
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
              `/schools/${school.slug}`,
              school.name,
              school.description ??
                `${school.name} — ${school._count.memberships} members, ${school._count.programs} programs`,
            ),
            educationalOrg,
          ],
        }}
      />
    </>
  )
}
