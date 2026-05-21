import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { cache } from "react"
import type { Brand } from "~/.generated/prisma/client"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { getProgramById } from "~/server/web/program/queries"

type Props = PageProps<"/programs/[id]">

const getData = cache(async ({ params }: Props) => {
  const { id } = await params
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? "RONIN_DOJO_DESIGN"
  const program = await getProgramById(brand, id)

  if (!program) {
    notFound()
  }

  const url = `/programs/${program.id}/enroll/success`
  const title = "Enrollment Confirmed!"
  const description = `You're now enrolled in ${program.name} at ${program.organization.name}. Welcome aboard!`

  const data = getPageData(url, title, description, {
    breadcrumbs: [
      { url: `/programs/${program.id}`, title: program.name },
      { url, title: "Enrolled" },
    ],
  })

  return { program, ...data }
})

export const generateMetadata = async (props: Props): Promise<Metadata> => {
  const { url, metadata } = await getData(props)
  return getPageMetadata({ url, metadata })
}

export default async function ProgramEnrollSuccessPage(props: Props) {
  const { program, metadata } = await getData(props)

  return (
    <>
      <Intro alignment="center">
        <IntroTitle>{metadata.title}</IntroTitle>
        <IntroDescription>{metadata.description}</IntroDescription>
      </Intro>

      <div className="flex flex-col items-center gap-4">
        <Badge variant="success" size="lg">
          Enrolled
        </Badge>

        <div className="flex gap-3">
          <Button render={<Link href={`/programs/${program.id}`} />}>View Program</Button>

          <Button variant="secondary" render={<Link href="/dashboard" />}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </>
  )
}
