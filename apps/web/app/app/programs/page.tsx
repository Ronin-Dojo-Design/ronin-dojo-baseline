import { Suspense } from "react"
import { ProgramsTable } from "~/app/app/programs/_components/programs-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findPrograms } from "~/server/admin/programs/queries"
import { programsTableParamsCache } from "~/server/admin/programs/schema"

export default async ({ searchParams }: PageProps<"/app/programs">) => {
  const search = programsTableParamsCache.parse(await searchParams)
  const programsPromise = findPrograms(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Programs" />}>
      <ProgramsTable programsPromise={programsPromise} />
    </Suspense>
  )
}
