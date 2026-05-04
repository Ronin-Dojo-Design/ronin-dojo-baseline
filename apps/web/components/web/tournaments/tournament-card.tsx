import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react"
import { Badge } from "~/components/common/badge"
import { Link } from "~/components/common/link"

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
      className="group flex flex-col rounded-lg border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-accent/50"
    >
      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
        {tournament.name}
      </h3>

      {tournament.description && (
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {tournament.description}
        </p>
      )}

      <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-4" />
          <span>
            {new Date(tournament.startDate).toLocaleDateString()} – {new Date(tournament.endDate).toLocaleDateString()}
          </span>
        </div>

        {location && (
          <div className="flex items-center gap-2">
            <MapPinIcon className="size-4" />
            <span>{location}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <UsersIcon className="size-4" />
          <span>{tournament._count.registrations} registered</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {tournament.disciplines.map(td => (
          <Badge key={td.discipline.name} variant="soft">
            {td.discipline.name}
          </Badge>
        ))}
        {totalDivisions > 0 && (
          <Badge variant="outline">{totalDivisions} division{totalDivisions !== 1 ? "s" : ""}</Badge>
        )}
      </div>
    </Link>
  )
}
