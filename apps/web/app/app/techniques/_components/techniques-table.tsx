"use client"

import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import { AdminCollection } from "~/components/admin/admin-collection"
import { DataSelect } from "~/components/common/data-select"
import type { findTechniquesForAdmin, TechniqueAdminRow } from "~/server/admin/techniques/queries"
import {
  techniquesTableParamsSchema,
  type TechniquesTableSchema,
} from "~/server/admin/techniques/schema"
import type { DataTableFilterField } from "~/types"
import { getColumns } from "./techniques-table-columns"

type TechniquesTableProps = {
  techniquesPromise: ReturnType<typeof findTechniquesForAdmin>
}

const SCOPE_OPTIONS: { value: TechniquesTableSchema["scope"]; label: string }[] = [
  { value: "pending-promotion", label: "Pending promotion" },
  { value: "featured", label: "Featured" },
  { value: "authored", label: "Authored" },
  { value: "all", label: "All" },
]

export function TechniquesTable({ techniquesPromise }: TechniquesTableProps) {
  const { rows, total, pageCount } = use(techniquesPromise)
  // shallow:false — the scope write must trigger a server round-trip (re-run the RSC →
  // re-query findTechniquesForAdmin), matching useDataTable's own non-shallow pagination/sort/name
  // writes. Without it the URL flips to ?scope=… but the rows stay on the old view until reload.
  const [{ perPage, sort, scope }, setParams] = useQueryStates(techniquesTableParamsSchema, {
    shallow: false,
  })

  const columns = useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<TechniqueAdminRow>[] = [
    { id: "name", label: "Name", placeholder: "Filter by name..." },
  ]

  return (
    <AdminCollection
      title="Techniques"
      total={total}
      data={rows}
      columns={columns}
      pageCount={pageCount}
      sorting={sort}
      pageSize={perPage}
      filterFields={filterFields}
      emptyState="No techniques match this view."
    >
      {() => (
        <DataSelect
          options={SCOPE_OPTIONS}
          value={scope}
          onValueChange={value => setParams({ scope: value as TechniquesTableSchema["scope"] })}
          aria-label="Scope"
          triggerClassName="w-44"
        />
      )}
    </AdminCollection>
  )
}
