/**
 * @added   SESSION_0541 (2026-07-15)
 * @why     Compose the promoter-review projection through the existing AdminCollection primitive
 * @wired   app/app/belt-reviews/page.tsx
 */
"use client"

import { use, useMemo } from "react"
import { AdminCollection } from "~/components/admin/admin-collection"
import type { findPendingPromoterReviews } from "~/server/admin/rank-reviews/queries"
import type { ExtendedSortingState } from "~/types"
import { getColumns } from "./belt-reviews-table-columns"

type BeltReviewRow = Awaited<ReturnType<typeof findPendingPromoterReviews>>["rows"][number]

type BeltReviewsTableProps = {
  reviewsPromise: ReturnType<typeof findPendingPromoterReviews>
  sorting: ExtendedSortingState<BeltReviewRow>
  pageSize: number
}

export function BeltReviewsTable({ reviewsPromise, sorting, pageSize }: BeltReviewsTableProps) {
  const { rows, total, pageCount } = use(reviewsPromise)

  const columns = useMemo(() => getColumns(), [])

  return (
    <AdminCollection
      title="Belt reviews"
      total={total}
      data={rows}
      columns={columns}
      pageCount={pageCount}
      sorting={sorting}
      pageSize={pageSize}
      emptyState="No belt promoter-change reviews are waiting."
    />
  )
}
