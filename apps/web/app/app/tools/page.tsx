import { Suspense } from "react"
import { ToolsTable } from "~/app/app/tools/_components/tools-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findTools } from "~/server/admin/tools/queries"
import { toolsTableParamsCache } from "~/server/admin/tools/schema"

export default async function Page({ searchParams }: PageProps<"/app/tools">) {
  const search = toolsTableParamsCache.parse(await searchParams)
  const toolsPromise = findTools(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Listings" />}>
      <ToolsTable toolsPromise={toolsPromise} />
    </Suspense>
  )
}
