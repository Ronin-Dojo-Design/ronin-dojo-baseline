import { Suspense } from "react"
import { ContentAtomsTable } from "~/app/app/content/_components/content-atoms-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findContentAtoms } from "~/server/admin/content/queries"
import { contentAtomsTableParamsCache } from "~/server/admin/content/schema"

export default async ({ searchParams }: PageProps<"/app/content">) => {
  const search = contentAtomsTableParamsCache.parse(await searchParams)
  const atomsPromise = findContentAtoms(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Content Atoms" />}>
      <ContentAtomsTable atomsPromise={atomsPromise} />
    </Suspense>
  )
}
