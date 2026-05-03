import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { Brand } from "~/.generated/prisma/client"
import { CreateScheduleForm } from "~/components/web/schedules/create-schedule-form"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { canEditOrganization } from "~/lib/authz"
import { getManageableProgramById } from "~/server/web/program/queries"
import { db } from "~/services/db"

interface Props {
  params: Promise<{ programId: string }>
}

export const metadata: Metadata = {
  title: "Create Schedule",
  description: "Add a recurring class schedule to this program.",
}

export default async function CreateSchedulePage({ params }: Props) {
  const { programId } = await params
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? Brand.RONIN_DOJO_DESIGN

  const session = await getServerSession()
  if (!session?.user) {
    redirect(`/auth/login?next=/programs/${programId}/schedules/new`)
  }

  const program = await getManageableProgramById(brand, programId)
  if (!program) notFound()

  const canEdit = await canEditOrganization(session.user, program.organizationId)
  if (!canEdit) notFound()

  const disciplines = await db.organizationDiscipline.findMany({
    where: { organizationId: program.organizationId },
    select: { discipline: { select: { id: true, name: true, slug: true } } },
    orderBy: { discipline: { name: "asc" } },
  })

  return (
    <>
      <Intro>
        <IntroTitle>Create Schedule</IntroTitle>
        <IntroDescription>
          Add a recurring class block for {program.name} at {program.organization.name}.
        </IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <CreateScheduleForm
            organizationId={program.organizationId}
            programId={program.id}
            disciplines={disciplines.map(d => d.discipline)}
            className="max-w-2xl"
          />
        </Section.Content>
      </Section>
    </>
  )
}
