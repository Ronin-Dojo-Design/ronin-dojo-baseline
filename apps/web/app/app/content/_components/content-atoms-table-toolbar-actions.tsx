"use client"

import type { Table } from "@tanstack/react-table"
import { TrashIcon } from "lucide-react"
import { ContentAtomsDeleteDialog } from "~/app/app/content/_components/content-atoms-delete-dialog"
import { Button } from "~/components/common/button"
import type { findContentAtoms } from "~/server/admin/content/queries"

type ContentAtomRow = Awaited<ReturnType<typeof findContentAtoms>>["atoms"][number]

interface ContentAtomsTableToolbarActionsProps {
  table: Table<ContentAtomRow>
}

export function ContentAtomsTableToolbarActions({ table }: ContentAtomsTableToolbarActionsProps) {
  const { rows } = table.getFilteredSelectedRowModel()

  if (!rows.length) {
    return null
  }

  return (
    <ContentAtomsDeleteDialog atoms={rows.map(row => row.original)}>
      <Button variant="secondary" size="md" prefix={<TrashIcon />}>
        Delete ({rows.length})
      </Button>
    </ContentAtomsDeleteDialog>
  )
}
