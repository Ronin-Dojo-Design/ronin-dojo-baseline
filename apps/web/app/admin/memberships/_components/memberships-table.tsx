/**
 * @added   SESSION_0148 (2026-05-12)
 * @why     Membership data table with status faceted filter + date range
 * @wired   app/admin/memberships/page.tsx, server/admin/memberships/
 */
"use client"

import {
  CircleCheckIcon,
  CircleDotIcon,
  CircleIcon,
  CirclePauseIcon,
  CircleXIcon,
  MailIcon,
} from "lucide-react"
import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import { MembershipStatus } from "~/.generated/prisma/browser"
import { getColumns } from "~/app/admin/memberships/_components/memberships-table-columns"
import { DateRangePicker } from "~/components/admin/date-range-picker"
import { DataTable } from "~/components/data-table/data-table"
import { DataTableHeader } from "~/components/data-table/data-table-header"
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import { useDataTable } from "~/hooks/use-data-table"
import type { findMemberships } from "~/server/admin/memberships/queries"
import { membershipsTableParamsSchema } from "~/server/admin/memberships/schema"
import type { DataTableFilterField } from "~/types"

type MembershipRow = Awaited<ReturnType<typeof findMemberships>>["memberships"][number]

type MembershipsTableProps = {
  membershipsPromise: ReturnType<typeof findMemberships>
  organizations: { id: string; name: string }[]
  disciplines: { id: string; name: string }[]
}

export function MembershipsTable({
  membershipsPromise,
  organizations: _organizations,
  disciplines: _disciplines,
}: MembershipsTableProps) {
  const { memberships, membershipsTotal, pageCount } = use(membershipsPromise)
  const [{ perPage, sort }] = useQueryStates(membershipsTableParamsSchema)

  const columns = useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<MembershipRow>[] = [
    {
      id: "name" as keyof MembershipRow,
      label: "Member",
      placeholder: "Filter by name or member #...",
    },
    {
      id: "status",
      label: "Status",
      options: [
        {
          label: "Invited",
          value: MembershipStatus.INVITED,
          icon: <MailIcon className="text-blue-500" />,
        },
        {
          label: "Pending",
          value: MembershipStatus.PENDING,
          icon: <CircleIcon className="text-blue-500" />,
        },
        {
          label: "Active",
          value: MembershipStatus.ACTIVE,
          icon: <CircleCheckIcon className="text-green-500" />,
        },
        {
          label: "Suspended",
          value: MembershipStatus.SUSPENDED,
          icon: <CirclePauseIcon className="text-amber-500" />,
        },
        {
          label: "Cancelled",
          value: MembershipStatus.CANCELLED,
          icon: <CircleXIcon className="text-red-500" />,
        },
        {
          label: "Expired",
          value: MembershipStatus.EXPIRED,
          icon: <CircleDotIcon className="text-gray-500" />,
        },
      ],
    },
  ]

  const { table } = useDataTable({
    data: memberships,
    columns,
    pageCount,
    filterFields,
    shallow: false,
    clearOnDefault: true,
    initialState: {
      pagination: { pageIndex: 0, pageSize: perPage },
      sorting: sort,
      columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
  })

  return (
    <DataTable table={table}>
      <DataTableHeader title="Memberships" total={membershipsTotal}>
        <DataTableToolbar table={table} filterFields={filterFields}>
          <DateRangePicker align="end" />
          <DataTableViewOptions table={table} />
        </DataTableToolbar>
      </DataTableHeader>
    </DataTable>
  )
}
