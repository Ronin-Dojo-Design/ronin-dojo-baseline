import { headers } from "next/headers"
import type { Metadata } from "next"
import { Brand } from "~/.generated/prisma/client"
import { CreateOrganizationForm } from "~/components/web/organizations/create-organization-form"
import { Intro, IntroTitle, IntroDescription } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getDisciplinesByBrand } from "~/server/web/organization/discipline-queries"

export const metadata: Metadata = {
  title: "Create Organization",
  description: "Register a new dojo, school, club, or league.",
}

export default async function CreateOrganizationPage() {
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? Brand.RONIN_DOJO_DESIGN
  const disciplines = await getDisciplinesByBrand(brand)

  return (
    <>
      <Intro>
        <IntroTitle>Create Organization</IntroTitle>
        <IntroDescription>
          Register a new dojo, school, club, or league.
        </IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <CreateOrganizationForm
            brand={brand}
            disciplines={disciplines}
            className="max-w-lg"
          />
        </Section.Content>
      </Section>
    </>
  )
}
