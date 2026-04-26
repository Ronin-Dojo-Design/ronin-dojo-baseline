import { Suspense } from "react"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findReports } from "~/server/admin/reports/queries"
import { reportsTableParamsCache } from "~/server/admin/reports/schema"
import { ReportsTable } from "./_components/reports-table"

export default withAdminPage(async ({ searchParams }: PageProps<"/admin/reports">) => {
  const search = reportsTableParamsCache.parse(await searchParams)
  const reportsPromise = findReports(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Reports" />}>
      <ReportsTable reportsPromise={reportsPromise} />
    </Suspense>
  )
})
