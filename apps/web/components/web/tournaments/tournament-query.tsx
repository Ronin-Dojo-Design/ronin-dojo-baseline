import type { SearchParams } from "nuqs"
import type { Brand } from "~/.generated/prisma/client"
import { TournamentList } from "~/components/web/tournaments/tournament-list"
import { searchTournaments } from "~/server/web/tournaments/queries"
import { tournamentFilterParamsCache } from "~/server/admin/tournaments/schema"

type TournamentQueryProps = {
  searchParams: Promise<SearchParams>
  brand: Brand
}

const TournamentQuery = async ({ searchParams, brand }: TournamentQueryProps) => {
  const parsedParams = tournamentFilterParamsCache.parse(await searchParams)
  const { tournaments, total, page, perPage } = await searchTournaments(parsedParams, brand)

  return (
    <div className="space-y-6">
      {tournaments.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No upcoming tournaments at this time. Check back soon!
        </p>
      ) : (
        <TournamentList tournaments={tournaments} />
      )}

      {total > perPage && (
        <p className="text-center text-sm text-muted-foreground">
          Showing {tournaments.length} of {total} tournaments
        </p>
      )}
    </div>
  )
}

export { TournamentQuery }
