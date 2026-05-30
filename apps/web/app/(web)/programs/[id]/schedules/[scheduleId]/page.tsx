import { PencilIcon } from "lucide-react"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { Brand } from "~/.generated/prisma/client"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { EmptyList } from "~/components/common/empty-list"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { MaterializeScheduleButton } from "~/components/web/schedules/materialize-schedule-button"
import { ScheduleInstructorList } from "~/components/web/schedules/schedule-instructor-list"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { canEditOrganization } from "~/lib/authz"
import { getEditableInstructors, getScheduleById } from "~/server/web/schedule/queries"

interface Props {
  params: Promise<{ id: string; scheduleId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { scheduleId } = await params
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? Brand.RONIN_DOJO_DESIGN
  const schedule = await getScheduleById(brand, scheduleId)

  if (!schedule) return { title: "Schedule Not Found" }
  return { title: schedule.name, description: `${schedule.daysOfWeek.join(", ")}` }
}

export default async function ScheduleDetailPage({ params }: Props) {
  const { id: programId, scheduleId } = await params
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? Brand.RONIN_DOJO_DESIGN

  const schedule = await getScheduleById(brand, scheduleId)
  if (!schedule || schedule.programId !== programId) notFound()

  const session = await getServerSession()
  const canEdit = session?.user
    ? await canEditOrganization(session.user, schedule.organizationId)
    : false

  const eligibleInstructors = canEdit
    ? await getEditableInstructors(brand, schedule.organizationId)
    : []

  const upcomingSessions = schedule.sessions.filter(s => {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    return s.date.getTime() >= today.getTime()
  })

  return (
    <>
      <Intro>
        <IntroTitle>{schedule.name}</IntroTitle>
        <IntroDescription>
          <Stack size="sm" className="flex-wrap">
            <Badge variant={schedule.status === "ACTIVE" ? "success" : "outline"} size="lg">
              {schedule.status}
            </Badge>
            <Badge variant="outline" size="lg">
              {schedule.daysOfWeek.join(", ")}
            </Badge>
            <Badge variant="outline" size="lg">
              {schedule.startTime}–{schedule.endTime}
            </Badge>
            {schedule.locationName && (
              <Badge variant="outline" size="lg">
                {schedule.locationName}
              </Badge>
            )}
          </Stack>
        </IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <div className="grid gap-8 @lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="space-y-6">
              <div className="space-y-2">
                <H4>Description</H4>
                <p className="text-sm text-secondary-foreground text-pretty">
                  {schedule.description ?? "No description has been added yet."}
                </p>
              </div>

              <div className="space-y-3">
                <H4>Instructors</H4>
                {canEdit ? (
                  <ScheduleInstructorList
                    classScheduleId={schedule.id}
                    assignments={schedule.instructorAssignments}
                    eligibleInstructors={eligibleInstructors}
                  />
                ) : schedule.instructorAssignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No instructors assigned yet.</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {schedule.instructorAssignments.map(a => (
                      <li key={a.id}>
                        {a.user.name ?? "Instructor"}
                        {a.isPrimary && " (Primary)"}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-3">
                <Stack className="justify-between">
                  <H4>Upcoming sessions</H4>
                  {canEdit && <MaterializeScheduleButton scheduleId={schedule.id} />}
                </Stack>

                {upcomingSessions.length === 0 ? (
                  <EmptyList className="text-sm">
                    No upcoming sessions yet. Use “Generate sessions” to materialize the next 90
                    days.
                  </EmptyList>
                ) : (
                  <ul className="grid gap-2">
                    {upcomingSessions.slice(0, 30).map(s => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
                      >
                        <span>
                          {s.date.toISOString().slice(0, 10)} · {s.startTime}–{s.endTime}
                        </span>
                        <Badge variant={s.status === "CANCELLED" ? "danger" : "outline"} size="sm">
                          {s.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <aside className="space-y-4">
              {canEdit && (
                <Button
                  size="md"
                  prefix={<PencilIcon />}
                  className="w-full"
                  render={<Link href={`/programs/${programId}/schedules/${schedule.id}/edit`} />}
                >
                  Edit Schedule
                </Button>
              )}

              <Card hover={false}>
                <CardHeader>
                  <H4>Schedule Details</H4>
                </CardHeader>
                <CardDescription>
                  <Stack direction="column" className="items-start gap-1 text-sm">
                    <span>Timezone: {schedule.timezone}</span>
                    {schedule.effectiveFrom && (
                      <span>
                        Effective: {schedule.effectiveFrom.toISOString().slice(0, 10)}
                        {schedule.effectiveTo
                          ? ` → ${schedule.effectiveTo.toISOString().slice(0, 10)}`
                          : " → ongoing"}
                      </span>
                    )}
                    {schedule.capacity && <span>Capacity: {schedule.capacity}</span>}
                    {schedule.discipline && <span>Discipline: {schedule.discipline.name}</span>}
                    <span>{schedule._count.sessions} total session(s) recorded</span>
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
