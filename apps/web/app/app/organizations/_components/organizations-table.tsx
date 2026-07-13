"use client"

import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import { AdminCollection } from "~/components/admin/admin-collection"
import type { findOrganizationsWithSettingsPaginated } from "~/server/admin/org-settings/queries"
import { organizationsTableParamsSchema } from "~/server/admin/org-settings/schema"
import { getColumns } from "./organizations-table-columns"

type OrganizationsTableProps = {
  organizationsPromise: ReturnType<typeof findOrganizationsWithSettingsPaginated>
}

export function OrganizationsTable({ organizationsPromise }: OrganizationsTableProps) {
  const { rows, total, pageCount } = use(organizationsPromise)
  const [{ perPage, sort }] = useQueryStates(organizationsTableParamsSchema)

  const columns = useMemo(() => getColumns(), [])

  return (
    <AdminCollection
      title="Organizations"
      total={total}
      data={rows}
      columns={columns}
      pageCount={pageCount}
      sorting={sort}
      pageSize={perPage}
      emptyState="No organizations found."
    />
  )
}
