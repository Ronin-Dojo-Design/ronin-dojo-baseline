import { notFound } from "next/navigation"
import { Badge } from "~/components/common/badge"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { Intro, IntroTitle, IntroDescription } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { DivisionTable } from "~/components/web/tournaments/division-table"
import { getRequestBrand } from "~/lib/brand-context"
import { findTournamentBySlug } from "~/server/web/tournaments/queries"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function TournamentDetailPage({ params }: PageProps) {
  const { slug } = await params
  const brand = await getRequestBrand()
  const tournament = await findTournamentBySlug(slug, brand)

  if (!tournament) {
    notFound()
  }

  const location = [tournament.venueName, tournament.venueCity, tournament.venueRegion, tournament.venueCountry]
    .filter(Boolean)
    .join(", ")

  return (
    <>
      <Intro>
        <IntroTitle>{tournament.name}</IntroTitle>
        {tournament.description && (
          <IntroDescription>{tournament.description}</IntroDescription>
        )}
      </Intro>

      <Section>
        <Stack size="sm" className="flex-wrap">
          <Badge variant="outline">
            {new Date(tournament.startDate).toLocaleDateString()} – {new Date(tournament.endDate).toLocaleDateString()}
          </Badge>
          {location && <Badge variant="soft">{location}</Badge>}
          <Badge variant="soft">{tournament.host.name}</Badge>
        </Stack>
      </Section>

      {tournament.disciplines.map(td => (
        <Section key={td.id}>
          <H4>{td.discipline.name}</H4>
          {td.rulesetName && (
            <p className="text-sm text-muted-foreground mb-2">Ruleset: {td.rulesetName}</p>
          )}
          <DivisionTable divisions={td.divisions} />
        </Section>
      ))}
    </>
  )
}
