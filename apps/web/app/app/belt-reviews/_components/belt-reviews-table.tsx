"use client"

import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import { AdminCollection } from "~/components/admin/admin-collection"
import type { findPendingPromoterReviews } from "~/server/admin/rank-reviews/queries"
import { rankReviewsTableParamsSchema } from "~/server/admin/rank-reviews/schema"
import { getColumns } from "./belt-reviews-table-columns"

type BeltReviewsTableProps = {
  reviewsPromise: ReturnType<typeof findPendingPromoterReviews>
}

export function BeltReviewsTable({ reviewsPromise }: BeltReviewsTableProps) {
  const { rows, total, pageCount } = use(reviewsPromise)
  const [{ perPage, sort }] = useQueryStates(rankReviewsTableParamsSchema, { shallow: false })

  const columns = useMemo(() => getColumns(), [])

  return (
    <AdminCollection
      title="Belt reviews"
      total={total}
      data={rows}
      columns={columns}
      pageCount={pageCount}
      sorting={sort}
      pageSize={perPage}
      emptyState="No belt promoter-change reviews are waiting."
    />
  )
}
