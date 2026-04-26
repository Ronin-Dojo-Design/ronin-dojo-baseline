import { Suspense } from "react"
import { TagsTable } from "~/app/admin/tags/_components/tags-table"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findTags } from "~/server/admin/tags/queries"
import { tagsTableParamsCache } from "~/server/admin/tags/schema"

export default withAdminPage(async ({ searchParams }: PageProps<"/admin/tags">) => {
  const search = tagsTableParamsCache.parse(await searchParams)
  const tagsPromise = findTags(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Tags" />}>
      <TagsTable tagsPromise={tagsPromise} />
    </Suspense>
  )
})
