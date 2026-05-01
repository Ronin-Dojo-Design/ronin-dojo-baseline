import { PlusIcon } from "lucide-react"
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
import { Grid } from "~/components/web/ui/grid"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { canEditOrganization } from "~/lib/authz"
import { getManageableProgramById } from "~/server/web/program/queries"
import { getSchedulesByProgram } from "~/server/web/schedule/queries"

interface Props {
  params: Promise<{ programId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { programId } = await params
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? Brand.RONIN_DOJO_DESIGN
  const program = await getManageableProgramById(brand, programId)

  if (!program) return { title: "Schedules" }
  return { title: `${program.name} schedules`, description: "Class schedules for this program." }
}

export default async function ProgramSchedulesPage({ params }: Props) {
  const { programId } = await params
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? Brand.RONIN_DOJO_DESIGN
  const program = await getManageableProgramById(brand, programId)

  if (!program) notFound()

  const session = await getServerSession()
  const canEdit = session?.user
    ? await canEditOrganization(session.user, program.organizationId)
    : false

  const schedules = await getSchedulesByProgram(brand, program.id, program.organizationId)

  return (
    <>
      <Intro>
        <IntroTitle>{program.name} — Schedules</IntroTitle>
        <IntroDescription>Recurring class blocks for {program.organization.name}.</IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <Stack className="justify-between w-full mb-4">
            <p className="text-sm text-muted-foreground">
              {schedules.length} schedule{schedules.length !== 1 ? "s" : ""}
            </p>
            {canEdit && (
              <Button size="sm" prefix={<PlusIcon />} asChild>
                <Link href={`/programs/${program.id}/schedules/new`}>Create Schedule</Link>
              </Button>
            )}
          </Stack>

          {schedules.length === 0 ? (
            <p className="text-secondary-foreground text-sm">No schedules yet.</p>
          ) : (
            <Grid>
              {schedules.map(schedule => (
                <Card key={schedule.id} isRevealed>
                  <CardHeader>
                    <H4 as="h3" className="truncate">
                      <Link href={`/programs/${program.id}/schedules/${schedule.id}`}>
                        <span className="absolute inset-0 z-10" />
                        {schedule.name}
                      </Link>
                    </H4>
                  </CardHeader>

                  <CardDescription>
                    {schedule.description ?? `${schedule.daysOfWeek.join(", ")} ${schedule.startTime}–${schedule.endTime}`}
                  </CardDescription>

                  <Stack size="sm" className="flex-wrap">
                    <Badge variant={schedule.status === "ACTIVE" ? "success" : "outline"}>
                      {schedule.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {schedule._count.instructorAssignments} instructor
                      {schedule._count.instructorAssignments !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {schedule._count.sessions} session
                      {schedule._count.sessions !== 1 ? "s" : ""}
                    </span>
                  </Stack>
                </Card>
              ))}
            </Grid>
          )}
        </Section.Content>
      </Section>
    </>
  )
}
