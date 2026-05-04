import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react"
import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { H3 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Note } from "~/components/common/note"

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
    <Link
      href={`/tournaments/${tournament.slug}`}
      className="group"
    >
      <Card className="flex flex-col p-5 transition-colors hover:border-primary/50 hover:bg-accent/50">
        <H3 className="group-hover:text-primary transition-colors">
          {tournament.name}
        </H3>

        {tournament.description && (
          <Note className="mt-1 line-clamp-2">
            {tournament.description}
          </Note>
        )}

        <Stack direction="column" size="xs" className="mt-3">
          <Stack direction="row" size="sm" className="items-center text-sm text-muted-foreground">
            <CalendarIcon className="size-4" />
            <span>
              {new Date(tournament.startDate).toLocaleDateString()} – {new Date(tournament.endDate).toLocaleDateString()}
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
        </Stack>

        <Stack direction="row" size="xs" className="mt-3 flex-wrap">
          {tournament.disciplines.map(td => (
            <Badge key={td.discipline.name} variant="soft">
              {td.discipline.name}
            </Badge>
          ))}
          {totalDivisions > 0 && (
            <Badge variant="outline">{totalDivisions} division{totalDivisions !== 1 ? "s" : ""}</Badge>
          )}
        </Stack>
      </Card>
    </Link>
  )
}
