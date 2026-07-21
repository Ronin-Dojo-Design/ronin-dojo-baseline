"use client"

import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import { AdminCollection } from "~/components/admin/admin-collection"
import { DataSelect } from "~/components/common/data-select"
import type {
  findPlanningIntakeForAdmin,
  PlanningIntakeAdminRow,
} from "~/server/admin/planning-intake/queries"
import {
  planningIntakeTableParamsSchema,
  type PlanningIntakeTableSchema,
} from "~/server/admin/planning-intake/schema"
import type { DataTableFilterField } from "~/types"
import { getColumns } from "./planning-intake-table-columns"

type PlanningIntakeTableProps = {
  rowsPromise: ReturnType<typeof findPlanningIntakeForAdmin>
}

const STATUS_OPTIONS: { value: PlanningIntakeTableSchema["status"]; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "TRIAGED", label: "Triaged" },
  { value: "PROMOTED", label: "Promoted" },
  { value: "DISMISSED", label: "Dismissed" },
  { value: "all", label: "All" },
]

export function PlanningIntakeTable({ rowsPromise }: PlanningIntakeTableProps) {
  const { rows, total, pageCount } = use(rowsPromise)
  // shallow:false — the status write must trigger a server round-trip (matches the
  // techniques `scope` precedent), or the URL flips while the rows stay on the old view.
  const [{ perPage, sort, status }, setParams] = useQueryStates(planningIntakeTableParamsSchema, {
    shallow: false,
  })

  const columns = useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<PlanningIntakeAdminRow>[] = [
    { id: "body", label: "Body", placeholder: "Filter by body..." },
  ]

  return (
    <AdminCollection
      title="Planning Intake"
      total={total}
      data={rows}
      columns={columns}
      pageCount={pageCount}
      sorting={sort}
      pageSize={perPage}
      filterFields={filterFields}
      emptyState="No intake rows match this view."
    >
      {() => (
        <DataSelect
          options={STATUS_OPTIONS}
          value={status}
          // Reset to page 1 on status change — same out-of-range-page guard as the
          // techniques `scope` select.
          onValueChange={value =>
            setParams({ status: value as PlanningIntakeTableSchema["status"], page: 1 })
          }
          aria-label="Status"
          triggerClassName="w-36"
        />
      )}
    </AdminCollection>
  )
}
