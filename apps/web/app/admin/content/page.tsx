import { Suspense } from "react"
import { ContentAtomsTable } from "~/app/admin/content/_components/content-atoms-table"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findContentAtoms } from "~/server/admin/content/queries"
import { contentAtomsTableParamsCache } from "~/server/admin/content/schema"

export default withAdminPage(async ({ searchParams }: PageProps<"/admin/content">) => {
  const search = contentAtomsTableParamsCache.parse(await searchParams)
  const atomsPromise = findContentAtoms(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Content Atoms" />}>
      <ContentAtomsTable atomsPromise={atomsPromise} />
    </Suspense>
  )
})
