"use client"

import { formatDate } from "@dirstack/utils"
import type { ColumnDef } from "@tanstack/react-table"
import type { ComponentProps } from "react"
import { ContentAtomStatus } from "~/.generated/prisma/browser"
import { ContentAtomActions } from "~/app/app/content/_components/content-atom-actions"
import { Badge } from "~/components/common/badge"
import { Note } from "~/components/common/note"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { DataTableLink } from "~/components/data-table/data-table-link"
import { selectColumn } from "~/components/data-table/select-column"
import type { findContentAtoms } from "~/server/admin/content/queries"

type ContentAtomRow = Awaited<ReturnType<typeof findContentAtoms>>["atoms"][number]

export const getColumns = (): ColumnDef<ContentAtomRow>[] => {
  const statusBadges: Record<ContentAtomStatus, ComponentProps<typeof Badge>> = {
    [ContentAtomStatus.INBOX]: { variant: "soft" },
    [ContentAtomStatus.DRAFT]: { variant: "soft" },
    [ContentAtomStatus.REVIEW]: { variant: "info" },
    [ContentAtomStatus.APPROVED]: { variant: "success" },
    [ContentAtomStatus.PUBLISHED]: { variant: "success" },
    [ContentAtomStatus.ARCHIVED]: { variant: "warning" },
  }

  return [
    selectColumn<ContentAtomRow>(),
    {
      accessorKey: "title",
      enableHiding: false,
      size: 240,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
      cell: ({ row }) => {
        const { title, id } = row.original
        return <DataTableLink href={`/app/content/${id}`} title={title} />
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge {...statusBadges[row.original.status]}>{row.original.status}</Badge>
      ),
    },
    {
      id: "discipline",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Discipline" />,
      cell: ({ row }) => <Note>{row.original.discipline?.name ?? "—"}</Note>,
    },
    {
      id: "tags",
      header: "Tags",
      cell: ({ row }) => <Note>{row.original._count.tags}</Note>,
    },
    {
      id: "variants",
      header: "Variants",
      cell: ({ row }) => <Note>{row.original._count.variants}</Note>,
    },
    {
      id: "media",
      header: "Media",
      cell: ({ row }) => <Note>{row.original._count.mediaAttachments}</Note>,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => <Note>{formatDate(row.getValue<Date>("createdAt"))}</Note>,
    },
    {
      id: "actions",
      cell: ({ row }) => <ContentAtomActions atom={row.original} className="float-right" />,
    },
  ]
}
