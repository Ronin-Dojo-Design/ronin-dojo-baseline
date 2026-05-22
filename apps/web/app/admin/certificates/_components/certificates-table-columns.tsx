"use client"

import { formatDateTime } from "@dirstack/utils"
import type { ColumnDef } from "@tanstack/react-table"
import type { CertificateTemplate } from "~/.generated/prisma/browser"
import { CertificateActions } from "~/app/admin/certificates/_components/certificate-actions"
import { Badge } from "~/components/common/badge"
import { Checkbox } from "~/components/common/checkbox"
import { Link } from "~/components/common/link"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"

export type CertificateRow = CertificateTemplate & {
  organization: { name: string; id: string } | null
}

export function getColumns(): ColumnDef<CertificateRow>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
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
        <Link
          href={`/admin/certificates/${row.original.id}`}
          className="font-medium hover:underline"
        >
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
        row.original.priceCents === 0 ? "Free" : `$${(row.original.priceCents / 100).toFixed(2)}`,
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
      cell: ({ row }) => <CertificateActions template={row.original as CertificateTemplate} />,
    },
  ]
}
