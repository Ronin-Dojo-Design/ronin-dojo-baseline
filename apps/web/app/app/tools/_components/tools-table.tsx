"use client"

import { PlusIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import { type Tool, ToolStatus, ToolTier } from "~/.generated/prisma/browser"
import { getColumns } from "~/app/app/tools/_components/tools-table-columns"
import { ToolsTableToolbarActions } from "~/app/app/tools/_components/tools-table-toolbar-actions"
import { AdminCollection } from "~/components/admin/admin-collection"
import { DateRangePicker } from "~/components/admin/date-range-picker"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { toolStatusIcon } from "~/components/common/tool-status"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import { tiersConfig } from "~/config/tiers"
import type { findTools } from "~/server/admin/tools/queries"
import { toolsTableParamsSchema } from "~/server/admin/tools/schema"
import type { DataTableFilterField } from "~/types"

type ToolsTableProps = {
  toolsPromise: ReturnType<typeof findTools>
}

// Module-scoped so the reference is stable across renders (the hook keys its filter-parser memo
// off this identity — see AdminCollection's `initialState` contract). Tools is a NON-defaulted
// collection (no `columnFilters`): clearing a facet removes the param entirely.
const TOOLS_INITIAL_STATE = {
  columnVisibility: { submitterEmail: false, createdAt: false },
  columnPinning: { right: ["actions"] },
}

export function ToolsTable({ toolsPromise }: ToolsTableProps) {
  const { tools, total, pageCount } = use(toolsPromise)
  const [{ perPage, sort }] = useQueryStates(toolsTableParamsSchema)

  // Memoize the columns so they don't re-render on every render
  const columns = useMemo(() => getColumns(), [])

  // Search filters
  const filterFields: DataTableFilterField<Tool>[] = [
    {
      id: "name",
      label: "Name",
      placeholder: "Filter by name...",
    },
    {
      id: "status",
      label: "Status",
      options: [
        ToolStatus.Published,
        ToolStatus.Scheduled,
        ToolStatus.Pending,
        ToolStatus.Draft,
        ToolStatus.Rejected,
        ToolStatus.Deleted,
      ].map(value => ({
        label: value,
        value,
        icon: toolStatusIcon[value],
      })),
    },
    {
      id: "tier",
      label: "Tier",
      options: Object.values(ToolTier).map(tier => ({
        label: tiersConfig[tier].label,
        value: tier,
      })),
    },
  ]

  return (
    <AdminCollection
      title="Listings"
      total={total}
      data={tools}
      columns={columns}
      pageCount={pageCount}
      filterFields={filterFields}
      sorting={sort}
      pageSize={perPage}
      initialState={TOOLS_INITIAL_STATE}
      emptyState="No listings found."
      getRowId={originalRow => originalRow.id}
      callToAction={
        <Button
          variant="primary"
          size="md"
          prefix={<PlusIcon />}
          render={<Link href="/app/tools/new" />}
        >
          <div className="max-sm:sr-only">New listing</div>
        </Button>
      }
    >
      {table => (
        <>
          <ToolsTableToolbarActions table={table} />
          <DateRangePicker align="end" />
          <DataTableViewOptions table={table} />
        </>
      )}
    </AdminCollection>
  )
}
