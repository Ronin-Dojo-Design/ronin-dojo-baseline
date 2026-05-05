import { notFound } from "next/navigation"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { H3 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Intro, IntroTitle, IntroDescription } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { MedalStandings } from "~/components/web/tournaments/medal-standings"
import { BracketResults } from "~/components/web/tournaments/bracket-results"
import { getRequestBrand } from "~/lib/brand-context"
import { findTournamentResults } from "~/server/web/tournaments/queries"

export const metadata = {
  title: "Tournament Results",
  description: "View bracket results and medal standings.",
}

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function TournamentResultsPage({ params }: PageProps) {
  const { slug } = await params
  const brand = await getRequestBrand()
  const tournament = await findTournamentResults(slug, brand)

  if (!tournament) {
    notFound()
  }

  // Flatten all divisions across disciplines for medal + bracket display
  const allDivisions = tournament.disciplines.flatMap((td) =>
    td.divisions.map((div) => ({
      ...div,
      disciplineName: td.discipline.name,
    })),
  )

  return (
    <>
      <Intro>
        <IntroTitle>
          {tournament.name} — Results
        </IntroTitle>
        <IntroDescription>
          Bracket results and medal standings
        </IntroDescription>
      </Intro>

      <Section>
        <Stack size="sm" className="flex-wrap">
          <Badge variant="outline">
            {new Date(tournament.startDate).toLocaleDateString()} –{" "}
            {new Date(tournament.endDate).toLocaleDateString()}
          </Badge>
          {tournament.venueName && (
            <Badge variant="soft">
              {[tournament.venueName, tournament.venueCity, tournament.venueRegion]
                .filter(Boolean)
                .join(", ")}
            </Badge>
          )}
          <Badge variant="soft">{tournament.host.name}</Badge>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/tournaments/${tournament.slug}`}>← Back to tournament</Link>
          </Button>
        </Stack>
      </Section>

      <Section>
        <H3>Medal Standings</H3>
        <MedalStandings divisions={allDivisions} />
      </Section>

      <Section>
        <H3>Match Results</H3>
        <BracketResults divisions={allDivisions} />
      </Section>
    </>
  )
}
