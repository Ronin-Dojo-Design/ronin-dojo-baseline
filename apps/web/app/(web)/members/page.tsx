import { Suspense } from "react"
import type { SearchParams } from "nuqs"
import { MemberQuery } from "~/components/web/members/member-query"
import { MemberListingSkeleton } from "~/components/web/members/member-listing"
import { Intro, IntroTitle, IntroDescription } from "~/components/web/ui/intro"
import { getRequestBrand } from "~/lib/brand-context"

export const metadata = {
  title: "Members",
  description: "Browse the member directory — find training partners and instructors.",
}

type PageProps = {
  searchParams: Promise<SearchParams>
}

export default async function MembersPage({ searchParams }: PageProps) {
  const brand = await getRequestBrand()

  return (
    <>
      <Intro>
        <IntroTitle>Member Directory</IntroTitle>
        <IntroDescription>
          Find training partners and instructors in our community.
        </IntroDescription>
      </Intro>

      <Suspense fallback={<MemberListingSkeleton />}>
        <MemberQuery
          searchParams={searchParams}
          brand={brand}
          options={{ enableFilters: true, enableSort: true }}
        />
      </Suspense>
    </>
  )
}
