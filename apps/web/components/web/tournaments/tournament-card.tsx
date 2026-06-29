import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react"
import { Badge } from "~/components/common/badge"
import { Stack } from "~/components/common/stack"
import { ListingCard } from "~/components/web/listing/listing-card"

/**
 * TournamentCard — a thin adapter over `ListingCard` (doctrine §5; SESSION_0470). The event meta
 * (date · location · registrations + division count) renders in the `statusBadges` slot; disciplines
 * are category badges. Default View+Save footer (View tournament). No bespoke card markup.
 */
type TournamentCardProps = {
  tournament: {
    id: string
    slug: string
    name: string
    description?: string | null
    startDate: Date | string
    endDate: Date | string
    venueName?: string | null
    venueCity?: string | null
    venueRegion?: string | null
    host: { name: string }
    disciplines: { discipline: { name: string }; _count: { divisions: number } }[]
    _count: { registrations: number }
  }
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const location = [tournament.venueName, tournament.venueCity, tournament.venueRegion]
    .filter(Boolean)
    .join(", ")

  const totalDivisions = tournament.disciplines.reduce((sum, d) => sum + d._count.divisions, 0)

  return (
    <ListingCard
      href={`/tournaments/${tournament.slug}`}
      name={tournament.name}
      tagline={tournament.description}
      categories={tournament.disciplines.map(td => ({ name: td.discipline.name }))}
      statusBadges={
        <Stack direction="column" size="xs" className="w-full">
          <Stack direction="row" size="sm" className="items-center text-sm text-muted-foreground">
            <CalendarIcon className="size-4" />
            <span>
              {new Date(tournament.startDate).toLocaleDateString()} –{" "}
              {new Date(tournament.endDate).toLocaleDateString()}
            </span>
          </Stack>

          {location && (
            <Stack direction="row" size="sm" className="items-center text-sm text-muted-foreground">
              <MapPinIcon className="size-4" />
              <span>{location}</span>
            </Stack>
          )}

          <Stack direction="row" size="sm" className="items-center text-sm text-muted-foreground">
            <UsersIcon className="size-4" />
            <span>{tournament._count.registrations} registered</span>
          </Stack>

          {totalDivisions > 0 && (
            <Badge variant="outline" className="mt-1">
              {totalDivisions} division{totalDivisions !== 1 ? "s" : ""}
            </Badge>
          )}
        </Stack>
      }
      viewLabel="View tournament"
    />
  )
}
