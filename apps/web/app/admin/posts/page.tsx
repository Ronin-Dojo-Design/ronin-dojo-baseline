import { Suspense } from "react"
import { PostsTable } from "~/app/admin/posts/_components/posts-table"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { getRequestBrand } from "~/lib/brand-context"
import { findPosts } from "~/server/admin/posts/queries"
import { postsTableParamsCache } from "~/server/admin/posts/schema"

export default withAdminPage(async ({ searchParams }: PageProps<"/admin/posts">) => {
  const search = postsTableParamsCache.parse(await searchParams)
  const brand = await getRequestBrand()
  const postsPromise = findPosts(search, { brand })

  return (
    <Suspense fallback={<DataTableSkeleton title="Posts" />}>
      <PostsTable postsPromise={postsPromise} />
    </Suspense>
  )
})
