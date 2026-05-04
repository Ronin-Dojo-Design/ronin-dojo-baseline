import { PencilIcon } from "lucide-react"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { Brand } from "~/.generated/prisma/client"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { canEditOrganization } from "~/lib/authz"
import { getProgramById } from "~/server/web/program/queries"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? Brand.RONIN_DOJO_DESIGN
  const program = await getProgramById(brand, id)

  if (!program) return { title: "Program Not Found" }

  return {
    title: program.name,
    description: program.description ?? `${program.organization.name} program`,
  }
}

export default async function ProgramDetailPage({ params }: Props) {
  const { id } = await params
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? Brand.RONIN_DOJO_DESIGN
  const [program, session] = await Promise.all([getProgramById(brand, id), getServerSession()])

  if (!program) notFound()

  const canEdit = session?.user
    ? await canEditOrganization(session.user, program.organizationId)
    : false

  const ageRange = [program.ageMin, program.ageMax].filter(value => value !== null).join("-")

  return (
    <>
      <Intro>
        <IntroTitle>{program.name}</IntroTitle>
        <IntroDescription>
          <Stack size="sm" className="flex-wrap">
            <Badge variant="outline" size="lg">
              {program.organization.name}
            </Badge>
            {program.discipline && <Badge size="lg">{program.discipline.name}</Badge>}
          </Stack>
        </IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <div className="grid gap-8 @lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-6">
              <div className="space-y-2">
                <H4>Overview</H4>
                <p className="text-sm text-secondary-foreground text-pretty">
                  {program.description ?? "No description has been added yet."}
                </p>
              </div>

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
                      <dd>{program.discipline.name}</dd>
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

              {program.courses.length > 0 && (
                <div className="space-y-3">
                  <H4>Courses</H4>
                  <div className="grid gap-3">
                    {program.courses.map(({ course }) => (
                      <Card key={course.id} hover={false}>
                        <CardHeader>
                          <span className="text-sm font-medium">{course.title}</span>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-4">
              <Button size="md" className="w-full" asChild>
                <Link href={`/programs/${program.id}/enroll`}>Enroll Now</Link>
              </Button>

              {canEdit && (
                <Button size="md" variant="secondary" prefix={<PencilIcon />} className="w-full" asChild>
                  <Link href={`/programs/${program.id}/edit`}>Edit Program</Link>
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
            </aside>
          </div>
        </Section.Content>
      </Section>
    </>
  )
}
