import type { Metadata } from "next"
import { CreateOrganizationForm } from "~/components/web/organizations/create-organization-form"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { Brand } from "~/.generated/prisma/client"
import { getDisciplinesByBrand } from "~/server/web/organization/discipline-queries"

export const metadata: Metadata = {
  title: "Create Organization",
  description: "Register a new dojo, school, club, or league.",
}

export default async function CreateOrganizationPage() {
  const disciplines = await getDisciplinesByBrand(Brand.BBL)

  return (
    <>
      <Intro>
        <IntroTitle>Create Organization</IntroTitle>
        <IntroDescription>Register a new dojo, school, club, or league.</IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <CreateOrganizationForm
            brand={Brand.BBL}
            disciplines={disciplines}
            className="max-w-lg"
          />
        </Section.Content>
      </Section>
    </>
  )
}
