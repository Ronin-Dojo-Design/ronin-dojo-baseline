import type { SearchParams } from "nuqs"
import type { Brand } from "~/.generated/prisma/client"
import { EmptyList } from "~/components/common/empty-list"
import { Stack } from "~/components/common/stack"
import { TournamentList } from "~/components/web/tournaments/tournament-list"
import { tournamentFilterParamsCache } from "~/server/admin/tournaments/schema"
import { searchTournaments } from "~/server/web/tournaments/queries"

type TournamentQueryProps = {
  searchParams: Promise<SearchParams>
  brand: Brand
}

const TournamentQuery = async ({ searchParams, brand }: TournamentQueryProps) => {
  const parsedParams = tournamentFilterParamsCache.parse(await searchParams)
  const { tournaments, total, page: _page, perPage } = await searchTournaments(parsedParams, brand)

  return (
    <Stack direction="column" size="lg">
      {tournaments.length === 0 ? (
        <EmptyList>No upcoming tournaments at this time. Check back soon!</EmptyList>
      ) : (
        <TournamentList tournaments={tournaments} />
      )}

      {total > perPage && (
        <p className="text-center text-sm text-muted-foreground">
          Showing {tournaments.length} of {total} tournaments
        </p>
      )}
    </Stack>
  )
}

export { TournamentQuery }
