import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Brand } from "~/.generated/prisma/client"
import { CreateProgramForm } from "~/components/web/programs/create-program-form"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { getEditableProgramOrganizations } from "~/server/web/program/queries"

export const metadata: Metadata = {
  title: "Create Program",
  description: "Create a school operations program.",
}

export default async function CreateProgramPage() {
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? Brand.RONIN_DOJO_DESIGN
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/auth/login?next=/programs/new")
  }

  const organizations = await getEditableProgramOrganizations(
    brand,
    session.user.id,
    (session.user as { role?: string | null }).role,
  )

  return (
    <>
      <Intro>
        <IntroTitle>Create Program</IntroTitle>
        <IntroDescription>
          Add a student-facing training program for an organization you manage.
        </IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <CreateProgramForm organizations={organizations} className="max-w-2xl" />
        </Section.Content>
      </Section>
    </>
  )
}
