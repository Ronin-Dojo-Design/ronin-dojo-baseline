import { Suspense } from "react"
import type { SearchParams } from "nuqs"
import { SchoolQuery } from "~/components/web/schools/school-query"
import { SchoolListingSkeleton } from "~/components/web/schools/school-listing"
import { Intro, IntroTitle, IntroDescription } from "~/components/web/ui/intro"
import { getRequestBrand } from "~/lib/brand-context"

export const metadata = {
  title: "Schools",
  description: "Browse schools and training locations in our network.",
}

type PageProps = {
  searchParams: Promise<SearchParams>
}

export default async function SchoolsPage({ searchParams }: PageProps) {
  const brand = await getRequestBrand()

  return (
    <>
      <Intro>
        <IntroTitle>School Directory</IntroTitle>
        <IntroDescription>
          Find dojos, gyms, and academies in our network.
        </IntroDescription>
      </Intro>

      <Suspense fallback={<SchoolListingSkeleton />}>
        <SchoolQuery
          searchParams={searchParams}
          brand={brand}
          options={{ enableFilters: true, enableSort: true }}
        />
      </Suspense>
    </>
  )
}
