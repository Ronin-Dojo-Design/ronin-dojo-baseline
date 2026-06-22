import { TrophyIcon } from "lucide-react"
import { notFound } from "next/navigation"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { DivisionTable } from "~/components/web/tournaments/division-table"
import { RegisterButton } from "~/components/web/tournaments/register-button"
import { RegistrationNotice } from "~/components/web/tournaments/registration-notice"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { Brand } from "~/.generated/prisma/client"
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
  const tournament = await findTournamentBySlug(slug, Brand.BBL)

  if (!tournament) {
    notFound()
  }

  // Look up existing registration for the current user (if logged in)
  const session = await getServerSession()
  const existingRegistration = session?.user
    ? await db.registration.findUnique({
        where: {
          tournamentId_recipientKey: {
            tournamentId: tournament.id,
            recipientKey: session.user.id,
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

  const location = [
    tournament.venueName,
    tournament.venueCity,
    tournament.venueRegion,
    tournament.venueCountry,
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <>
      <Intro>
        <IntroTitle>{tournament.name}</IntroTitle>
        {tournament.description && <IntroDescription>{tournament.description}</IntroDescription>}
      </Intro>

      {registered === "true" && (
        <Section>
          <RegistrationNotice registered={registered} existingRegistration={existingRegistration} />
        </Section>
      )}

      <Section>
        <Stack size="sm" className="flex-wrap">
          <Badge variant="outline">
            {new Date(tournament.startDate).toLocaleDateString()} –{" "}
            {new Date(tournament.endDate).toLocaleDateString()}
          </Badge>
          {location && <Badge variant="soft">{location}</Badge>}
          <Badge variant="soft">{tournament.host.name}</Badge>
          <Button
            variant="ghost"
            size="sm"
            prefix={<TrophyIcon className="size-4" />}
            render={<Link href={`/tournaments/${slug}/results`} />}
          >
            View Results
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
