import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { Brand } from "~/.generated/prisma/client"
import { CreateScheduleForm } from "~/components/web/schedules/create-schedule-form"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { canEditOrganization } from "~/lib/authz"
import { getScheduleById } from "~/server/web/schedule/queries"
import { db } from "~/services/db"

interface Props {
  params: Promise<{ programId: string; id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? Brand.RONIN_DOJO_DESIGN
  const schedule = await getScheduleById(brand, id)

  if (!schedule) return { title: "Schedule Not Found" }
  return { title: `Edit ${schedule.name}` }
}

export default async function EditSchedulePage({ params }: Props) {
  const { programId, id } = await params
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? Brand.RONIN_DOJO_DESIGN

  const session = await getServerSession()
  if (!session?.user) {
    redirect(`/auth/login?next=/programs/${programId}/schedules/${id}/edit`)
  }

  const schedule = await getScheduleById(brand, id)
  if (!schedule || schedule.programId !== programId) notFound()

  const canEdit = await canEditOrganization(session.user, schedule.organizationId)
  if (!canEdit) notFound()

  const disciplines = await db.organizationDiscipline.findMany({
    where: { organizationId: schedule.organizationId },
    select: { discipline: { select: { id: true, name: true, slug: true } } },
    orderBy: { discipline: { name: "asc" } },
  })

  return (
    <>
      <Intro>
        <IntroTitle>Edit Schedule</IntroTitle>
        <IntroDescription>Update the recurring class schedule.</IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <CreateScheduleForm
            organizationId={schedule.organizationId}
            programId={schedule.programId}
            disciplines={disciplines.map(d => d.discipline)}
            schedule={{
              id: schedule.id,
              organizationId: schedule.organizationId,
              programId: schedule.programId,
              disciplineId: schedule.disciplineId,
              name: schedule.name,
              description: schedule.description,
              status: schedule.status,
              daysOfWeek: schedule.daysOfWeek,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
              timezone: schedule.timezone,
              effectiveFrom: schedule.effectiveFrom,
              effectiveTo: schedule.effectiveTo,
              capacity: schedule.capacity,
              locationName: schedule.locationName,
            }}
            className="max-w-2xl"
          />
        </Section.Content>
      </Section>
    </>
  )
}
