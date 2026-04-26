import { Suspense } from "react"
import { ToolsTable } from "~/app/admin/tools/_components/tools-table"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findTools } from "~/server/admin/tools/queries"
import { toolsTableParamsCache } from "~/server/admin/tools/schema"

export default withAdminPage(async ({ searchParams }: PageProps<"/admin/tools">) => {
  const search = toolsTableParamsCache.parse(await searchParams)
  const toolsPromise = findTools(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Tools" />}>
      <ToolsTable toolsPromise={toolsPromise} />
    </Suspense>
  )
})
