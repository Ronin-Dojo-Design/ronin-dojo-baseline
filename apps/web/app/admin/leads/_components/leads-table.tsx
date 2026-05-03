"use client"

import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotDashedIcon,
  CircleDotIcon,
  CircleIcon,
  CircleXIcon,
  HeartPulseIcon,
  PlusIcon,
} from "lucide-react"
import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import { LeadStatus, LeadSource } from "~/.generated/prisma/browser"
import { getColumns } from "~/app/admin/leads/_components/leads-table-columns"
import { LeadsTableToolbarActions } from "~/app/admin/leads/_components/leads-table-toolbar-actions"
import { DateRangePicker } from "~/components/admin/date-range-picker"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { DataTable } from "~/components/data-table/data-table"
import { DataTableHeader } from "~/components/data-table/data-table-header"
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import { useDataTable } from "~/hooks/use-data-table"
import type { findLeads, findOrganizationList } from "~/server/admin/leads/queries"
import { leadsTableParamsSchema } from "~/server/admin/leads/schema"
import type { DataTableFilterField } from "~/types"
import type { LeadRow } from "~/server/admin/leads/queries"

type LeadsTableProps = {
  leadsPromise: ReturnType<typeof findLeads>
  organizationsPromise: ReturnType<typeof findOrganizationList>
}

export function LeadsTable({ leadsPromise, organizationsPromise }: LeadsTableProps) {
  const { leads, total, pageCount } = use(leadsPromise)
  const organizations = use(organizationsPromise)
  const [{ perPage, sort }] = useQueryStates(leadsTableParamsSchema)

  const columns = useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<LeadRow>[] = [
    {
      id: "name" as keyof LeadRow,
      label: "Name",
      placeholder: "Filter by name...",
    },
    {
      id: "status",
      label: "Status",
      options: [
        { label: "New", value: LeadStatus.NEW, icon: <CircleIcon className="text-blue-500" /> },
        { label: "Contacted", value: LeadStatus.CONTACTED, icon: <CircleDotDashedIcon className="text-cyan-500" /> },
        { label: "Trial Booked", value: LeadStatus.TRIAL_BOOKED, icon: <CircleDotIcon className="text-indigo-500" /> },
        { label: "Trial Completed", value: LeadStatus.TRIAL_COMPLETED, icon: <CircleDashedIcon className="text-purple-500" /> },
        { label: "Converted", value: LeadStatus.CONVERTED, icon: <CircleCheckIcon className="text-green-500" /> },
        { label: "Lost", value: LeadStatus.LOST, icon: <CircleXIcon className="text-red-500" /> },
        { label: "Nurture", value: LeadStatus.NURTURE, icon: <HeartPulseIcon className="text-amber-500" /> },
      ],
    },
    {
      id: "source",
      label: "Source",
      options: Object.values(LeadSource).map(s => ({
        label: s.replace(/_/g, " "),
        value: s,
      })),
    },
  ]

  const { table } = useDataTable({
    data: leads,
    columns,
    pageCount,
    filterFields,
    shallow: false,
    clearOnDefault: true,
    initialState: {
      pagination: { pageIndex: 0, pageSize: perPage },
      sorting: sort,
      columnVisibility: { phoneE164: false, referredBy: false },
      columnPinning: { right: ["actions"] },
    },
    getRowId: originalRow => originalRow.id,
  })

  return (
    <DataTable table={table}>
      <DataTableHeader
        title="Leads"
        total={total}
        callToAction={
          <Button variant="primary" size="md" prefix={<PlusIcon />} asChild>
            <Link href="/admin/leads/new">
              <div className="max-sm:sr-only">New lead</div>
            </Link>
          </Button>
        }
      >
        <DataTableToolbar table={table} filterFields={filterFields}>
          <LeadsTableToolbarActions table={table} />
          <DateRangePicker align="end" />
          <DataTableViewOptions table={table} />
        </DataTableToolbar>
      </DataTableHeader>
    </DataTable>
  )
}
