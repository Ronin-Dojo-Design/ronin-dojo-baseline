"use client"

import type { Table } from "@tanstack/react-table"
import { TrashIcon } from "lucide-react"
import { CertificatesDeleteDialog } from "~/app/admin/certificates/_components/certificates-delete-dialog"
import type { CertificateRow } from "~/app/admin/certificates/_components/certificates-table-columns"
import { Button } from "~/components/common/button"

interface CertificatesTableToolbarActionsProps {
  table: Table<CertificateRow>
}

export function CertificatesTableToolbarActions({ table }: CertificatesTableToolbarActionsProps) {
  const { rows } = table.getFilteredSelectedRowModel()

  if (!rows.length) {
    return null
  }

  return (
    <CertificatesDeleteDialog templates={rows.map(row => row.original)}>
      <Button variant="secondary" size="md" prefix={<TrashIcon />}>
        Delete ({rows.length})
      </Button>
    </CertificatesDeleteDialog>
  )
}
