"use client"

import type { Table } from "@tanstack/react-table"
import { TrashIcon } from "lucide-react"
import type { CourseRow } from "~/app/admin/courses/_components/courses-table-columns"
import { CoursesDeleteDialog } from "~/app/admin/courses/_components/courses-delete-dialog"
import { Button } from "~/components/common/button"

interface CoursesTableToolbarActionsProps {
  table: Table<CourseRow>
}

export function CoursesTableToolbarActions({ table }: CoursesTableToolbarActionsProps) {
  const { rows } = table.getFilteredSelectedRowModel()

  if (!rows.length) {
    return null
  }

  return (
    <CoursesDeleteDialog courses={rows.map(row => row.original)}>
      <Button variant="secondary" size="md" prefix={<TrashIcon />}>
        Delete ({rows.length})
      </Button>
    </CoursesDeleteDialog>
  )
}
