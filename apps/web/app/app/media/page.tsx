import { Suspense } from "react"
import { Brand } from "~/.generated/prisma/client"
import { MediaTable } from "~/app/app/media/_components/media-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findMedia } from "~/server/admin/media/queries"
import { mediaTableParamsCache } from "~/server/admin/media/schema"

export default async ({ searchParams }: PageProps<"/app/media">) => {
  const { title, page, perPage } = mediaTableParamsCache.parse(await searchParams)
  const mediaPromise = findMedia({
    brand: Brand.BBL,
    title: title || undefined,
    page,
    perPage,
  })

  return (
    <Suspense fallback={<DataTableSkeleton title="Media Gallery" />}>
      <MediaTable mediaPromise={mediaPromise} />
    </Suspense>
  )
}
