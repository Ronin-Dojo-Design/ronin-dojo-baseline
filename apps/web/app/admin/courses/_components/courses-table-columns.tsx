"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Course } from "~/.generated/prisma/browser"
import { CourseActions } from "~/app/admin/courses/_components/course-actions"
import { Link } from "~/components/common/link"
import { Badge } from "~/components/common/badge"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { Checkbox } from "~/components/common/checkbox"
import { formatDateTime } from "@primoui/utils"

export type CourseRow = Course & {
  organization: { name: string; id: string }
  discipline: { name: string; id: string } | null
  _count: { curriculumItems: number; enrollments: number }
}

export function getColumns(): ColumnDef<CourseRow>[] {
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
      cell: ({ row }) => row.original.organization?.name ?? "—",
    },
    {
      id: "items",
      header: "Items",
      cell: ({ row }) => row.original._count?.curriculumItems ?? 0,
    },
    {
      id: "enrollments",
      header: "Enrollments",
      cell: ({ row }) => row.original._count?.enrollments ?? 0,
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
        <CourseActions course={row.original as Course} />
      ),
    },
  ]
}
