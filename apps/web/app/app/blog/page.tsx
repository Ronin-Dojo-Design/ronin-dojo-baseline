import { Suspense } from "react"
import { PostsTable } from "~/app/app/blog/_components/posts-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { Brand } from "~/.generated/prisma/client"
import { findPosts } from "~/server/admin/posts/queries"
import { postsTableParamsCache } from "~/server/admin/posts/schema"

export default async ({ searchParams }: PageProps<"/app/blog">) => {
  const search = postsTableParamsCache.parse(await searchParams)
  const postsPromise = findPosts(search, { brand: Brand.BBL })

  return (
    <Suspense fallback={<DataTableSkeleton title="Posts" />}>
      <PostsTable postsPromise={postsPromise} />
    </Suspense>
  )
}
