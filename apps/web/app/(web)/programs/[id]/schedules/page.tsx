import { PlusIcon } from "lucide-react"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import type { SearchParams } from "nuqs"
import { createSearchParamsCache, parseAsInteger, parseAsStringEnum } from "nuqs/server"
import { Brand, type ScheduleStatus } from "~/.generated/prisma/client"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Pagination } from "~/components/web/pagination"
import { Grid } from "~/components/web/ui/grid"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { canEditOrganization } from "~/lib/authz"
import { getManageableProgramById } from "~/server/web/program/queries"
import { getSchedulesByProgramPaginated } from "~/server/web/schedule/queries"

const PAGE_SIZE = 20

const STATUS_VALUES = ["ACTIVE", "PAUSED", "ARCHIVED"] as const satisfies readonly ScheduleStatus[]

const scheduleListParams = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  status: parseAsStringEnum<ScheduleStatus>([...STATUS_VALUES]),
})


interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<SearchParams>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: programId } = await params
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? Brand.RONIN_DOJO_DESIGN
  const program = await getManageableProgramById(brand, programId)

  if (!program) return { title: "Schedules" }
  return { title: `${program.name} schedules`, description: "Class schedules for this program." }
}

const STATUS_FILTER_OPTIONS: { label: string; value: ScheduleStatus | "" }[] = [
  { label: "All non-archived", value: "" },
  { label: "Active", value: "ACTIVE" },
  { label: "Paused", value: "PAUSED" },
  { label: "Archived", value: "ARCHIVED" },
]

function buildStatusHref(programId: string, status: ScheduleStatus | "") {
  const search = status ? `?status=${status}` : ""
  return `/programs/${programId}/schedules${search}`
}

export default async function ProgramSchedulesPage({ params, searchParams }: Props) {
  const { id: programId } = await params
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? Brand.RONIN_DOJO_DESIGN
  const program = await getManageableProgramById(brand, programId)

  if (!program) notFound()

  const session = await getServerSession()
  const canEdit = session?.user
    ? await canEditOrganization(session.user, program.organizationId)
    : false

  const { page, status } = scheduleListParams.parse(await searchParams)
  const activeStatus: ScheduleStatus | undefined = status ?? undefined

  const { items: schedules, total } = await getSchedulesByProgramPaginated(
    brand,
    program.id,
    program.organizationId,
    { status: activeStatus, page, pageSize: PAGE_SIZE },
  )

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
              {total} schedule{total !== 1 ? "s" : ""}
            </p>
            {canEdit && (
              <Button size="sm" prefix={<PlusIcon />} asChild>
                <Link href={`/programs/${program.id}/schedules/new`}>Create Schedule</Link>
              </Button>
            )}
          </Stack>

          <Stack
            size="sm"
            className="flex-wrap mb-4"
            aria-label="Filter schedules by status"
          >
            {STATUS_FILTER_OPTIONS.map(option => {
              const isActive = (activeStatus ?? "") === option.value
              return (
                <Link
                  key={option.value || "all"}
                  href={buildStatusHref(program.id, option.value)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Badge variant={isActive ? "primary" : "outline"}>{option.label}</Badge>
                </Link>
              )
            })}
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

          <Pagination
            className="mt-6"
            total={total}
            perPage={PAGE_SIZE}
            page={page}
          />
        </Section.Content>
      </Section>
    </>
  )
}
