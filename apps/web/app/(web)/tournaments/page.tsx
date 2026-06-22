import type { SearchParams } from "nuqs"
import { Suspense } from "react"
import { Skeleton } from "~/components/common/skeleton"
import { TournamentQuery } from "~/components/web/tournaments/tournament-query"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Brand } from "~/.generated/prisma/client"

export const metadata = {
  title: "Tournaments",
  description: "Discover upcoming tournaments and events. Register to compete.",
}

type PageProps = {
  searchParams: Promise<SearchParams>
}

export default async function TournamentsPage({ searchParams }: PageProps) {
  return (
    <>
      <Intro>
        <IntroTitle>Tournaments & Events</IntroTitle>
        <IntroDescription>
          Discover upcoming competitions. Filter by discipline and register to compete.
        </IntroDescription>
      </Intro>

      <Suspense fallback={<Skeleton className="h-96" />}>
        <TournamentQuery searchParams={searchParams} brand={Brand.BBL} />
      </Suspense>
    </>
  )
}
