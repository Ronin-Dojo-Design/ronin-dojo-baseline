import { Suspense } from "react"
import { TournamentsTable } from "~/app/admin/tournaments/_components/tournaments-table"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findTournaments } from "~/server/admin/tournaments/queries"
import { tournamentsTableParamsCache } from "~/server/admin/tournaments/schema"

export default withAdminPage(async ({ searchParams }) => {
  const search = tournamentsTableParamsCache.parse(await searchParams)
  const tournamentsPromise = findTournaments(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Tournaments" />}>
      <TournamentsTable tournamentsPromise={tournamentsPromise} />
    </Suspense>
  )
})
