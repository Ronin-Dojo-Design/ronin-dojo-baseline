import { PencilIcon } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { CourseCard } from "~/components/web/courses/course-card"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Grid } from "~/components/web/ui/grid"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { canEditOrganization } from "~/lib/authz"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import { generateCollectionPage } from "~/lib/structured-data"
import { findProgramIds, findRelatedPrograms, getProgramById } from "~/server/web/program/queries"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  const programs = await findProgramIds()
  return programs.map(({ id }) => ({ id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const brand = await getRequestBrand()
  const program = await getProgramById(brand, id)

  if (!program) return { title: "Program Not Found" }

  return getPageMetadata({
    url: `/programs/${program.id}`,
    metadata: {
      title: program.name,
      description: program.description ?? `${program.organization.name} program`,
    },
  })
}

export default async function ProgramDetailPage({ params }: Props) {
  const { id } = await params
  const brand = await getRequestBrand()
  const [program, session] = await Promise.all([getProgramById(brand, id), getServerSession()])

  if (!program) notFound()

  const canEdit = session?.user
    ? await canEditOrganization(session.user, program.organizationId)
    : false

  const relatedPrograms = await findRelatedPrograms({
    programId: program.id,
    brand,
    disciplineId: program.disciplineId,
    organizationId: program.organizationId,
  })

  const ageRange = [program.ageMin, program.ageMax].filter(value => value !== null).join("-")

  return (
    <>
      <Breadcrumbs
        items={[
          { url: "/programs", title: "Programs" },
          { url: `/programs/${program.id}`, title: program.name },
        ]}
      />

      <Intro>
        <IntroTitle>{program.name}</IntroTitle>
        <IntroDescription>
          <Stack size="sm" className="flex-wrap">
            <Badge variant="outline" size="lg">
              <Link href={`/organizations/${program.organization.slug}`}>
                {program.organization.name}
              </Link>
            </Badge>
            {program.discipline && (
              <Badge size="lg">
                <Link href={`/disciplines/${program.discipline.slug}`}>
                  {program.discipline.name}
                </Link>
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {program._count.programEnrollments} enrolled
            </span>
          </Stack>
        </IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          {/* Overview */}
          <div className="space-y-2">
            <H4>Overview</H4>
            <p className="text-sm text-secondary-foreground text-pretty">
              {program.description ?? "No description has been added yet."}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <H4>Details</H4>
            <dl className="grid gap-2 text-sm @sm:grid-cols-[10rem_minmax(0,1fr)]">
              <dt className="text-muted-foreground">Organization</dt>
              <dd>
                <Link href={`/organizations/${program.organization.slug}`}>
                  {program.organization.name}
                </Link>
              </dd>

              {program.discipline && (
                <>
                  <dt className="text-muted-foreground">Discipline</dt>
                  <dd>
                    <Link href={`/disciplines/${program.discipline.slug}`}>
                      {program.discipline.name}
                    </Link>
                  </dd>
                </>
              )}

              {ageRange && (
                <>
                  <dt className="text-muted-foreground">Ages</dt>
                  <dd>{ageRange}</dd>
                </>
              )}

              {program.maxEnrollment && (
                <>
                  <dt className="text-muted-foreground">Capacity</dt>
                  <dd>{program.maxEnrollment} students</dd>
                </>
              )}
            </dl>
          </div>

          {/* Courses — using CourseCard */}
          {program.courses.length > 0 && (
            <div className="space-y-3">
              <H4>Courses ({program.courses.length})</H4>
              <Grid>
                {program.courses.map(({ course }) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </Grid>
            </div>
          )}
        </Section.Content>

        <Section.Sidebar>
          <Button
            size="md"
            className="w-full"
            render={<Link href={`/programs/${program.id}/enroll`} />}
          >
            Enroll Now
          </Button>

          {canEdit && (
            <Button
              size="md"
              variant="secondary"
              prefix={<PencilIcon />}
              className="w-full"
              render={<Link href={`/programs/${program.id}/edit`} />}
            >
              Edit Program
            </Button>
          )}

          <Card hover={false}>
            <CardHeader>
              <H4>Program State</H4>
            </CardHeader>
            <CardDescription>
              <Stack direction="column" className="items-start">
                <Badge variant="success">{program.status}</Badge>
                <span>{program._count.programEnrollments} enrollments</span>
                <span>{program._count.classSchedules} schedules</span>
              </Stack>
            </CardDescription>
          </Card>
        </Section.Sidebar>
      </Section>

      {/* Related Programs */}
      {relatedPrograms.length > 0 && (
        <Section>
          <Section.Content>
            <H4>Related Programs</H4>
            <Grid>
              {relatedPrograms.map(rp => (
                <Card key={rp.id} isRevealed>
                  <CardHeader>
                    <H4 render={props => <h3 {...props}>{props.children}</h3>} className="truncate">
                      <Link href={`/programs/${rp.id}`}>
                        <span className="absolute inset-0 z-10" />
                        {rp.name}
                      </Link>
                    </H4>
                  </CardHeader>
                  <CardDescription>
                    {rp.description ?? `${rp.organization.name} program`}
                  </CardDescription>
                  <Stack size="sm" className="flex-wrap">
                    <Badge variant="outline">{rp.organization.name}</Badge>
                    {rp.discipline && <Badge>{rp.discipline.name}</Badge>}
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
              `/programs/${program.id}`,
              program.name,
              program.description ?? `Training program by ${program.organization.name}`,
            ),
          ],
        }}
      />
    </>
  )
}
