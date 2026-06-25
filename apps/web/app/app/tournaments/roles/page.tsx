import { Suspense } from "react"
import { TournamentsSubNav } from "~/app/app/tournaments/_components/tournaments-sub-nav"
import { TournamentRolesTable } from "~/app/app/tournaments/roles/_components/tournament-roles-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findTournamentRolesPaginated } from "~/server/admin/tournaments/queries"
import { tournamentRolesTableParamsCache } from "~/server/admin/tournaments/schema"

export default async ({ searchParams }: PageProps<"/app/tournaments/roles">) => {
  const search = tournamentRolesTableParamsCache.parse(await searchParams)
  const rolesPromise = findTournamentRolesPaginated(search)

  return (
    <>
      <TournamentsSubNav />

      <Suspense fallback={<DataTableSkeleton title="Tournament Roles" />}>
        <TournamentRolesTable rolesPromise={rolesPromise} />
      </Suspense>
    </>
  )
}
