import { notFound } from "next/navigation"
import { TrophyIcon } from "lucide-react"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Intro, IntroTitle, IntroDescription } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { DivisionTable } from "~/components/web/tournaments/division-table"
import { RegisterButton } from "~/components/web/tournaments/register-button"
import { getRequestBrand } from "~/lib/brand-context"
import { getServerSession } from "~/lib/auth"
import { findTournamentBySlug } from "~/server/web/tournaments/queries"
import { db } from "~/services/db"

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ registered?: string }>
}

export default async function TournamentDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { registered } = await searchParams
  const brand = await getRequestBrand()
  const tournament = await findTournamentBySlug(slug, brand)

  if (!tournament) {
    notFound()
  }

  // Look up existing registration for the current user (if logged in)
  const session = await getServerSession()
  const existingRegistration = session?.user
    ? await db.registration.findUnique({
        where: {
          tournamentId_userId: {
            tournamentId: tournament.id,
            userId: session.user.id,
          },
        },
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          entries: {
            select: { division: { select: { name: true } } },
          },
        },
      })
    : null

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

      {registered === "true" && (
        <Section>
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-700 dark:text-green-400">
            <p className="font-semibold">Registration confirmed!</p>
            <p className="text-sm mt-1">You have been successfully registered for this tournament.</p>
          </div>
        </Section>
      )}

      <Section>
        <Stack size="sm" className="flex-wrap">
          <Badge variant="outline">
            {new Date(tournament.startDate).toLocaleDateString()} – {new Date(tournament.endDate).toLocaleDateString()}
          </Badge>
          {location && <Badge variant="soft">{location}</Badge>}
          <Badge variant="soft">{tournament.host.name}</Badge>
          <Button variant="ghost" size="sm" asChild prefix={<TrophyIcon className="size-4" />}>
            <Link href={`/tournaments/${slug}/results`}>View Results</Link>
          </Button>
        </Stack>
      </Section>

      {tournament.disciplines.map(td => (
        <Section key={td.id}>
          <H4>{td.discipline.name}</H4>
          {td.rulesetName && (
            <p className="text-sm text-muted-foreground mb-2">Ruleset: {td.rulesetName}</p>
          )}
          <DivisionTable divisions={td.divisions} />

          <div className="mt-4">
            <RegisterButton
              tournamentId={tournament.id}
              divisions={td.divisions.map(d => ({
                id: d.id,
                name: d.name,
                feeCents: d.feeCents,
                capacity: d.capacity,
                _count: d._count,
              }))}
              existingRegistration={existingRegistration}
            />
          </div>
        </Section>
      ))}
    </>
  )
}
