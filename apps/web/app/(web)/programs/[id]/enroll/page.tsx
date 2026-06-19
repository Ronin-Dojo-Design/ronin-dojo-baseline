import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { cache, Suspense } from "react"
import { ProductListSkeleton } from "~/components/web/products/product-list"
import { ProductQuery } from "~/components/web/products/product-query"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { getProgramById } from "~/server/web/program/queries"

type Props = PageProps<"/programs/[id]">

const getData = cache(async ({ params }: Props) => {
  const { id } = await params
  const brand = await getRequestBrand()
  const program = await getProgramById(brand, id)

  if (!program) {
    notFound()
  }

  const url = `/programs/${program.id}/enroll`
  const title = `Enroll in ${program.name}`
  const description = `Choose a plan to enroll in ${program.name} at ${program.organization.name}.`

  const data = await getPageData(url, title, description, {
    breadcrumbs: [
      { url: `/programs/${program.id}`, title: program.name },
      { url, title: "Enroll" },
    ],
  })

  return { program, ...data }
})

export const generateMetadata = async (props: Props): Promise<Metadata> => {
  const { url, metadata } = await getData(props)
  return await getPageMetadata({ url, metadata })
}

export default async function ProgramEnrollPage(props: Props) {
  const { program, url, metadata } = await getData(props)
  const session = await getServerSession()

  // Enrollment requires authentication — redirect to login if not signed in
  if (!session?.user) {
    redirect(`/auth/login?next=${encodeURIComponent(url)}`)
  }

  return (
    <>
      <Intro alignment="center">
        <IntroTitle>{metadata.title}</IntroTitle>
        <IntroDescription>{metadata.description}</IntroDescription>
      </Intro>

      <Suspense fallback={<ProductListSkeleton />}>
        <ProductQuery
          searchParams={props.searchParams}
          programEnrollmentCheckoutData={{ programId: program.id }}
          productFilter={({ name }) => name.includes("Enrollment")}
          productMapper={({ name, ...product }) => ({
            ...product,
            name: name.replace("Enrollment", "Plan").trim(),
          })}
        />
      </Suspense>
    </>
  )
}
