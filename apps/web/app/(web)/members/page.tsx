import type { SearchParams } from "nuqs"
import { Suspense } from "react"
import { MemberListingSkeleton } from "~/components/web/members/member-listing"
import { MemberQuery } from "~/components/web/members/member-query"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { getServerSession } from "~/lib/auth"
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
  const session = await getServerSession()
  const viewerUserId = session?.user?.id ?? null

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
          viewerUserId={viewerUserId}
          options={{ enableFilters: true, enableSort: true }}
        />
      </Suspense>
    </>
  )
}
