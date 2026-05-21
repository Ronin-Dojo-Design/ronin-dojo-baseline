/**
 * @added   SESSION_0148 (2026-05-12)
 * @why     Column definitions + row actions for membership admin data table
 * @wired   app/admin/memberships/_components/memberships-table.tsx
 */
"use client"

import { formatDate } from "@primoui/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowRightIcon, MoreHorizontalIcon, TrashIcon } from "lucide-react"
import { toast } from "sonner"
import { RowCheckbox } from "~/components/admin/row-checkbox"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { deleteMemberships, transitionMembershipStatus } from "~/server/admin/memberships/actions"
import { VALID_TRANSITIONS } from "~/server/admin/memberships/constants"
import type { findMemberships } from "~/server/admin/memberships/queries"

type MembershipRow = Awaited<ReturnType<typeof findMemberships>>["memberships"][number]

const statusVariant: Record<
  string,
  "primary" | "success" | "warning" | "danger" | "outline" | "soft"
> = {
  INVITED: "soft",
  PENDING: "primary",
  ACTIVE: "success",
  SUSPENDED: "warning",
  CANCELLED: "danger",
  EXPIRED: "outline",
}

export const getColumns = (): ColumnDef<MembershipRow>[] => {
  return [
    {
      id: "select",
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <RowCheckbox
          checked={table.getIsAllPageRowsSelected()}
          ref={input => {
            if (input) {
              input.indeterminate =
                table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
            }
          }}
          onChange={e => table.toggleAllPageRowsSelected(e.target.checked)}
          aria-label="Select all"
        />
      ),
      cell: ({ row, table }) => (
        <RowCheckbox
          checked={row.getIsSelected()}
          onChange={e => row.toggleSelected(e.target.checked)}
          aria-label="Select row"
          table={table}
          row={row}
        />
      ),
    },
    {
      id: "name",
      accessorKey: "user.name",
      enableHiding: false,
      size: 180,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Member" />,
      cell: ({ row }) => (
        <Link href={`/admin/memberships/${row.original.id}`} className="block">
          <div className="font-medium">{row.original.user.name ?? "—"}</div>
          <Note className="text-xs">{row.original.user.email}</Note>
        </Link>
      ),
    },
    {
      accessorKey: "organization.name",
      enableSorting: false,
      size: 140,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Organization" />,
      cell: ({ row }) => (
        <Note className="truncate max-w-35">{row.original.organization.name}</Note>
      ),
    },
    {
      accessorKey: "discipline.name",
      enableSorting: false,
      size: 120,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Discipline" />,
      cell: ({ row }) => <Note className="truncate max-w-30">{row.original.discipline.name}</Note>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status] ?? "outline"}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "rank.name",
      enableSorting: false,
      size: 100,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Rank" />,
      cell: ({ row }) => <Note>{row.original.rank?.name ?? "—"}</Note>,
    },
    {
      id: "roles",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Roles" />,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roleAssignments.length > 0 ? (
            row.original.roleAssignments.map(ra => (
              <Badge key={ra.role.id} variant="outline" size="sm">
                {ra.role.name}
              </Badge>
            ))
          ) : (
            <Note>—</Note>
          )}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
      cell: ({ cell }) => <Note>{formatDate(cell.getValue() as Date)}</Note>,
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      size: 40,
      cell: ({ row }) => <MembershipRowActions membership={row.original} />,
    },
  ]
}

function MembershipRowActions({ membership }: { membership: MembershipRow }) {
  const validTransitions = VALID_TRANSITIONS[membership.status] ?? []

  const handleTransition = async (toStatus: MembershipRow["status"]) => {
    const result = await transitionMembershipStatus({ id: membership.id, toStatus })
    if (result?.serverError) {
      toast.error(result.serverError)
    } else {
      toast.success(`Status changed to ${toStatus}`)
    }
  }

  const handleDelete = async () => {
    const result = await deleteMemberships({ ids: [membership.id] })
    if (result?.serverError) {
      toast.error(result.serverError)
    } else {
      toast.success("Membership deleted")
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" prefix={<MoreHorizontalIcon />} aria-label="Actions" />
        }
      />

      <DropdownMenuContent align="end" sideOffset={8}>
        {validTransitions.map(target => (
          <DropdownMenuItem
            key={target}
            onClick={() => handleTransition(target as MembershipRow["status"])}
          >
            <ArrowRightIcon className="mr-2 size-4" />
            Transition to {target}
          </DropdownMenuItem>
        ))}

        {validTransitions.length > 0 && <DropdownMenuSeparator />}

        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          <TrashIcon className="mr-2 size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
