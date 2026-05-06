import { Suspense } from "react"
import { TournamentsSubNav } from "~/app/admin/tournaments/_components/tournaments-sub-nav"
import { TournamentsTable } from "~/app/admin/tournaments/_components/tournaments-table"
import { withTournamentAdminPage } from "~/components/admin/auth-hoc"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findTournaments } from "~/server/admin/tournaments/queries"
import { tournamentsTableParamsCache } from "~/server/admin/tournaments/schema"

export default withTournamentAdminPage(async ({ searchParams }) => {
  const search = tournamentsTableParamsCache.parse(await searchParams)
  const tournamentsPromise = findTournaments(search)

  return (
    <>
      <TournamentsSubNav />

      <Suspense fallback={<DataTableSkeleton title="Tournaments" />}>
        <TournamentsTable tournamentsPromise={tournamentsPromise} />
      </Suspense>
    </>
  )
})
