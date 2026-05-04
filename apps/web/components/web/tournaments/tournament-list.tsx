import { TournamentCard } from "~/components/web/tournaments/tournament-card"

type TournamentListProps = {
  tournaments: any[]
}

export function TournamentList({ tournaments }: TournamentListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tournaments.map(tournament => (
        <TournamentCard key={tournament.id} tournament={tournament} />
      ))}
    </div>
  )
}
