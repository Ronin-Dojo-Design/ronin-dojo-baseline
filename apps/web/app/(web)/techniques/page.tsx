import { Suspense } from "react"
import type { SearchParams } from "nuqs"
import { TechniqueQuery } from "~/components/web/techniques/technique-query"
import { TechniqueListingSkeleton } from "~/components/web/techniques/technique-listing"
import { Intro, IntroTitle, IntroDescription } from "~/components/web/ui/intro"
import { getRequestBrand } from "~/lib/brand-context"

export const metadata = {
  title: "Techniques",
  description: "Browse our technique library — filter by category, position, and discipline.",
}

type PageProps = {
  searchParams: Promise<SearchParams>
}

export default async function TechniquesPage({ searchParams }: PageProps) {
  const brand = await getRequestBrand()

  return (
    <>
      <Intro>
        <IntroTitle>Technique Library</IntroTitle>
        <IntroDescription>
          Browse techniques by category, position, and discipline.
        </IntroDescription>
      </Intro>

      <Suspense fallback={<TechniqueListingSkeleton />}>
        <TechniqueQuery
          searchParams={searchParams}
          brand={brand}
          options={{ enableFilters: true, enableSort: true }}
        />
      </Suspense>
    </>
  )
}
