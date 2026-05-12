import { Suspense } from "react"
import { ProgramsTable } from "~/app/admin/programs/_components/programs-table"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findPrograms } from "~/server/admin/programs/queries"
import { programsTableParamsCache } from "~/server/admin/programs/schema"

export default withAdminPage(async ({ searchParams }) => {
  const search = programsTableParamsCache.parse(await searchParams)
  const programsPromise = findPrograms(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Programs" />}>
      <ProgramsTable programsPromise={programsPromise} />
    </Suspense>
  )
})
