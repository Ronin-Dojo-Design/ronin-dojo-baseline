import { Suspense } from "react"
import type { SearchParams } from "nuqs"
import { TournamentQuery } from "~/components/web/tournaments/tournament-query"
import { Intro, IntroTitle, IntroDescription } from "~/components/web/ui/intro"
import { getRequestBrand } from "~/lib/brand-context"

export const metadata = {
  title: "Tournaments",
  description: "Discover upcoming tournaments and events. Register to compete.",
}

type PageProps = {
  searchParams: Promise<SearchParams>
}

export default async function TournamentsPage({ searchParams }: PageProps) {
  const brand = await getRequestBrand()

  return (
    <>
      <Intro>
        <IntroTitle>Tournaments & Events</IntroTitle>
        <IntroDescription>
          Discover upcoming competitions. Filter by discipline and register to compete.
        </IntroDescription>
      </Intro>

      <Suspense fallback={<div className="animate-pulse h-96" />}>
        <TournamentQuery searchParams={searchParams} brand={brand} />
      </Suspense>
    </>
  )
}
