import type { SearchParams } from "nuqs"
import { Suspense } from "react"
import { ListingRegisterCta } from "~/components/web/directory/listing-register-cta"
import { SchoolListingSkeleton } from "~/components/web/schools/school-listing"
import { SchoolQuery } from "~/components/web/schools/school-query"
import { BrandTypography, bblHeadingScopeClass } from "~/components/web/ui/brand-typography"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
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
    <BrandTypography brand={brand} className={bblHeadingScopeClass}>
      <Intro>
        <IntroTitle>School Directory</IntroTitle>
        <IntroDescription>Find dojos, gyms, and academies in our network.</IntroDescription>
      </Intro>

      <ListingRegisterCta
        title="Run a school or dojo?"
        description="Add your school to the directory so students can find and join you."
        href="/organizations/new"
        cta="Add your school"
      />

      <Suspense fallback={<SchoolListingSkeleton />}>
        <SchoolQuery
          searchParams={searchParams}
          options={{ enableFilters: true, enableSort: true }}
        />
      </Suspense>
    </BrandTypography>
  )
}
