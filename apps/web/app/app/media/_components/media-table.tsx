"use client"

import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import { AdminCollection } from "~/components/admin/admin-collection"
import type { findMedia, MediaRow } from "~/server/admin/media/queries"
import { mediaTableParamsSchema } from "~/server/admin/media/schema"
import type { DataTableFilterField } from "~/types"
import { getColumns } from "./media-table-columns"
import { MediaUploader } from "./media-uploader"

type MediaTableProps = {
  mediaPromise: ReturnType<typeof findMedia>
}

export function MediaTable({ mediaPromise }: MediaTableProps) {
  const { media, total, pageCount } = use(mediaPromise)
  const [{ perPage, sort }] = useQueryStates(mediaTableParamsSchema)

  const columns = useMemo(() => getColumns(), [])

  // Search over title + description — keyed `title` (the Title column id) so the toolbar
  // renders the input and the derived `title` URL param reaches `findMedia` (the old `q`).
  const filterFields: DataTableFilterField<MediaRow>[] = [
    {
      id: "title",
      label: "Title",
      placeholder: "Search media...",
    },
  ]

  return (
    <AdminCollection
      title="Media Gallery"
      total={total}
      data={media}
      columns={columns}
      pageCount={pageCount}
      filterFields={filterFields}
      sorting={sort}
      pageSize={perPage}
      initialState={{ columnPinning: { right: ["actions"] } }}
      callToAction={<MediaUploader />}
      emptyState="No media uploaded yet."
    />
  )
}
