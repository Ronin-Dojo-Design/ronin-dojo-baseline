"use client"

import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import { AdminCollection } from "~/components/admin/admin-collection"
import type { findPendingProfileClaimsPaginated } from "~/server/admin/claims/claim-queries"
import { claimsTableParamsSchema } from "~/server/admin/claims/schema"
import { getColumns } from "./claims-table-columns"

type ClaimsTableProps = {
  claimsPromise: ReturnType<typeof findPendingProfileClaimsPaginated>
}

export function ClaimsTable({ claimsPromise }: ClaimsTableProps) {
  const { rows, total, pageCount } = use(claimsPromise)
  const [{ perPage, sort }] = useQueryStates(claimsTableParamsSchema)

  const columns = useMemo(() => getColumns(), [])

  return (
    <AdminCollection
      title="Profile Claims"
      total={total}
      data={rows}
      columns={columns}
      pageCount={pageCount}
      sorting={sort}
      pageSize={perPage}
      emptyState="No pending profile claims."
    />
  )
}
