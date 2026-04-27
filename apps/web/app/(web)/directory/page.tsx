import { headers } from "next/headers"
import type { Metadata } from "next"
import type { SearchParams } from "nuqs"
import { Brand } from "~/.generated/prisma/client"
import { DirectoryQuery } from "~/components/web/directory/directory-query"
import { Intro, IntroTitle, IntroDescription } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"

export const metadata: Metadata = {
  title: "Directory",
  description: "Find practitioners, instructors, and schools.",
}

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function DirectoryPage({ searchParams }: Props) {
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? Brand.RONIN_DOJO_DESIGN
  const session = await getServerSession()

  return (
    <>
      <Intro>
        <IntroTitle>Directory</IntroTitle>
        <IntroDescription>
          Find practitioners, instructors, and schools in the community.
        </IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <DirectoryQuery
            searchParams={searchParams}
            brand={brand}
            viewerUserId={session?.user?.id}
          />
        </Section.Content>
      </Section>
    </>
  )
}
