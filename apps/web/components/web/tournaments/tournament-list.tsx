import type { ComponentProps } from "react"
import { TournamentCard } from "~/components/web/tournaments/tournament-card"
import { Grid } from "~/components/web/ui/grid"

type TournamentCardTournament = ComponentProps<typeof TournamentCard>["tournament"]

type TournamentListProps = {
  tournaments: TournamentCardTournament[]
}

export function TournamentList({ tournaments }: TournamentListProps) {
  return (
    <Grid>
      {tournaments.map(tournament => (
        <TournamentCard key={tournament.id} tournament={tournament} />
      ))}
    </Grid>
  )
}
