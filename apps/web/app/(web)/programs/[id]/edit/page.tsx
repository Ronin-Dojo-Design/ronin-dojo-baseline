import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { CreateProgramForm } from "~/components/web/programs/create-program-form"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { Brand } from "~/.generated/prisma/client"
import { canEditOrganization } from "~/lib/authz"
import {
  getEditableProgramOrganizations,
  getManageableProgramById,
} from "~/server/web/program/queries"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const program = await getManageableProgramById(Brand.BBL, id)

  if (!program) return { title: "Program Not Found" }

  return {
    title: `Edit ${program.name}`,
    description: "Edit a school operations program.",
  }
}

export default async function EditProgramPage({ params }: Props) {
  const { id } = await params
  const [program, session] = await Promise.all([
    getManageableProgramById(Brand.BBL, id),
    getServerSession(),
  ])

  if (!program) notFound()

  if (!session?.user) {
    redirect(`/auth/login?next=/programs/${id}/edit`)
  }

  const canEdit = await canEditOrganization(session.user, program.organizationId)
  if (!canEdit) notFound()

  const organizations = await getEditableProgramOrganizations(
    Brand.BBL,
    session.user.id,
    (session.user as { role?: string | null }).role,
  )

  return (
    <>
      <Intro>
        <IntroTitle>Edit Program</IntroTitle>
        <IntroDescription>Update the program details students and families see.</IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <CreateProgramForm
            organizations={organizations}
            program={program}
            className="max-w-2xl"
          />
        </Section.Content>
      </Section>
    </>
  )
}
