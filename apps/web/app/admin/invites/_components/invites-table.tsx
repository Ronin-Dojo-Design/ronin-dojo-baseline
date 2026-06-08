"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { CircleCheckIcon, CircleDotIcon, CircleIcon, CircleXIcon, PlusIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import { InviteStatus, InviteType } from "~/.generated/prisma/browser"
import { getColumns } from "~/app/admin/invites/_components/invites-table-columns"
import { DateRangePicker } from "~/components/admin/date-range-picker"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { DataTable } from "~/components/data-table/data-table"
import { DataTableHeader } from "~/components/data-table/data-table-header"
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import { useDataTable } from "~/hooks/use-data-table"
import type { findInvites } from "~/server/admin/invites/queries"
import { invitesTableParamsSchema } from "~/server/admin/invites/schema"
import type { DataTableFilterField } from "~/types"

type InviteRow = Awaited<ReturnType<typeof findInvites>>["invites"][number]

type InvitesTableProps = {
  invitesPromise: ReturnType<typeof findInvites>
  organizations: { id: string; name: string }[]
}

export function InvitesTable({ invitesPromise, organizations: _organizations }: InvitesTableProps) {
  const { invites, invitesTotal, pageCount } = use(invitesPromise)
  const [{ perPage, sort }] = useQueryStates(invitesTableParamsSchema)

  const columns = useMemo<ColumnDef<InviteRow>[]>(() => getColumns(), [])

  const filterFields: DataTableFilterField<InviteRow>[] = [
    {
      id: "code",
      label: "Code",
      placeholder: "Filter by code...",
    },
    {
      id: "status",
      label: "Status",
      options: [
        {
          label: "Pending",
          value: InviteStatus.PENDING,
          icon: <CircleIcon className="text-blue-500" />,
        },
        {
          label: "Accepted",
          value: InviteStatus.ACCEPTED,
          icon: <CircleCheckIcon className="text-green-500" />,
        },
        {
          label: "Expired",
          value: InviteStatus.EXPIRED,
          icon: <CircleDotIcon className="text-amber-500" />,
        },
        {
          label: "Revoked",
          value: InviteStatus.REVOKED,
          icon: <CircleXIcon className="text-red-500" />,
        },
      ],
    },
    {
      id: "type",
      label: "Type",
      options: [
        { label: "Organization", value: InviteType.ORGANIZATION },
        { label: "Program", value: InviteType.PROGRAM },
        { label: "Tournament", value: InviteType.TOURNAMENT },
        { label: "Event", value: InviteType.EVENT },
      ],
    },
  ]

  const { table } = useDataTable({
    data: invites,
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
      <DataTableHeader
        title="Invites"
        total={invitesTotal}
        callToAction={
          <Button
            variant="primary"
            size="md"
            prefix={<PlusIcon />}
            render={<Link href="/admin/invites/new" />}
          >
            <div className="max-sm:sr-only">New invite</div>
          </Button>
        }
      >
        <DataTableToolbar table={table} filterFields={filterFields}>
          <DateRangePicker align="end" />
          <DataTableViewOptions table={table} />
        </DataTableToolbar>
      </DataTableHeader>
    </DataTable>
  )
}
