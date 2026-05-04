"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { EllipsisIcon } from "lucide-react"
import type { Course } from "~/.generated/prisma/browser"
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

export function getColumns(): ColumnDef<Course & { _count?: { curriculumItems: number; enrollments: number }; organization?: { name: string } }>[] {
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
      accessorKey: "title",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
      cell: ({ row }) => (
        <Link href={`/admin/courses/${row.original.id}`} className="font-medium hover:underline">
          {row.getValue("title")}
        </Link>
      ),
    },
    {
      id: "organization",
      header: "Organization",
      cell: ({ row }) => (row.original as any).organization?.name ?? "—",
    },
    {
      id: "items",
      header: "Items",
      cell: ({ row }) => (row.original as any)._count?.curriculumItems ?? 0,
    },
    {
      id: "enrollments",
      header: "Enrollments",
      cell: ({ row }) => (row.original as any)._count?.enrollments ?? 0,
    },
    {
      accessorKey: "isPublished",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isPublished ? "success" : "soft"}>
          {row.original.isPublished ? "Published" : "Draft"}
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
              <Link href={`/admin/courses/${row.original.id}`}>Edit</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}
