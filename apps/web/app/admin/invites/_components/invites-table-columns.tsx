"use client"

import { formatDate } from "@primoui/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { CopyIcon, MoreHorizontalIcon, ShieldXIcon, TrashIcon } from "lucide-react"
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
import { DataTableLink } from "~/components/data-table/data-table-link"
import { deleteInvites, revokeInvite } from "~/server/admin/invites/actions"
import type { findInvites } from "~/server/admin/invites/queries"

type InviteRow = Awaited<ReturnType<typeof findInvites>>["invites"][number]

const statusVariant: Record<
  string,
  "primary" | "success" | "warning" | "danger" | "outline" | "soft"
> = {
  PENDING: "primary",
  ACCEPTED: "success",
  EXPIRED: "warning",
  REVOKED: "danger",
}

export const getColumns = (): ColumnDef<InviteRow>[] => {
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
      accessorKey: "code",
      enableHiding: false,
      size: 160,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
      cell: ({ row }) => (
        <DataTableLink href={`/admin/invites/${row.original.id}`} title={row.original.code} />
      ),
    },
    {
      accessorKey: "organization.name",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Organization" />,
      cell: ({ row }) => <Note>{row.original.organization.name}</Note>,
    },
    {
      accessorKey: "type",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
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
      accessorKey: "currentUses",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Uses" />,
      cell: ({ row }) => (
        <Note className="tabular-nums">
          {row.original.currentUses}/{row.original.maxUses ?? "∞"}
        </Note>
      ),
    },
    {
      accessorKey: "expiresAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Expires" />,
      cell: ({ row }) => (
        <Note>{row.original.expiresAt ? formatDate(row.original.expiresAt) : "Never"}</Note>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ cell }) => <Note>{formatDate(cell.getValue() as Date)}</Note>,
    },
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      size: 40,
      cell: ({ row }) => <InviteRowActions invite={row.original} />,
    },
  ]
}

function InviteRowActions({ invite }: { invite: InviteRow }) {
  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${invite.code}`)
    toast.success("Invite link copied to clipboard")
  }

  const handleRevoke = async () => {
    const result = await revokeInvite({ id: invite.id })
    if (result?.serverError) {
      toast.error(result.serverError)
    } else {
      toast.success("Invite revoked")
    }
  }

  const handleDelete = async () => {
    const result = await deleteInvites({ ids: [invite.id] })
    if (result?.serverError) {
      toast.error(result.serverError)
    } else {
      toast.success("Invite deleted")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" prefix={<MoreHorizontalIcon />} aria-label="Actions" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={copyLink}>
          <CopyIcon className="mr-2 size-4" />
          Copy invite link
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={`/admin/invites/${invite.id}`}>View details</Link>
        </DropdownMenuItem>

        {invite.status === "PENDING" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleRevoke} className="text-destructive">
              <ShieldXIcon className="mr-2 size-4" />
              Revoke
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          <TrashIcon className="mr-2 size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
