"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { EllipsisIcon } from "lucide-react"
import type { CertificateTemplate } from "~/.generated/prisma/browser"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { Badge } from "~/components/common/badge"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { Checkbox } from "~/components/common/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { formatDateTime } from "@primoui/utils"

export function getColumns(): ColumnDef<CertificateTemplate & { organization?: { name: string } }>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <Link href={`/admin/certificates/${row.original.id}`} className="font-medium hover:underline">
          {row.getValue("name")}
        </Link>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => row.original.type.replace(/_/g, " "),
    },
    {
      accessorKey: "deliveryMethod",
      header: "Delivery",
      cell: ({ row }) => row.original.deliveryMethod.replace(/_/g, " "),
    },
    {
      id: "price",
      header: "Price",
      cell: ({ row }) =>
        row.original.priceCents === 0
          ? "Free"
          : `$${(row.original.priceCents / 100).toFixed(2)}`,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "success" : "soft"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => formatDateTime(row.getValue("createdAt")),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" prefix={<EllipsisIcon />} aria-label="Actions" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/certificates/${row.original.id}`}>Edit</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
