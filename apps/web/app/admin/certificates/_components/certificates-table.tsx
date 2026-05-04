"use client"

import { PlusIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import type { CertificateTemplate } from "~/.generated/prisma/browser"
import { getColumns } from "~/app/admin/certificates/_components/certificates-table-columns"
import { CertificatesTableToolbarActions } from "~/app/admin/certificates/_components/certificates-table-toolbar-actions"
import { DateRangePicker } from "~/components/admin/date-range-picker"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { DataTable } from "~/components/data-table/data-table"
import { DataTableHeader } from "~/components/data-table/data-table-header"
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import { useDataTable } from "~/hooks/use-data-table"
import type { findCertificateTemplates } from "~/server/admin/certificates/queries"
import { certificatesTableParamsSchema } from "~/server/admin/certificates/schema"
import type { DataTableFilterField } from "~/types"

type CertificatesTableProps = {
  templatesPromise: ReturnType<typeof findCertificateTemplates>
}

export function CertificatesTable({ templatesPromise }: CertificatesTableProps) {
  const { templates, total, pageCount } = use(templatesPromise)
  const [{ perPage, sort }] = useQueryStates(certificatesTableParamsSchema)

  const columns = useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<CertificateTemplate>[] = [
    {
      id: "name",
      label: "Name",
      placeholder: "Filter by name...",
    },
  ]

  const { table } = useDataTable({
    data: templates,
    columns,
    pageCount,
    filterFields,
    shallow: false,
    clearOnDefault: true,
    initialState: {
      pagination: { pageIndex: 0, pageSize: perPage },
      sorting: sort,
      columnPinning: { right: ["actions"] },
    },
    getRowId: originalRow => originalRow.id,
  })

  return (
    <DataTable table={table}>
      <DataTableHeader
        title="Certificate Templates"
        total={total}
        callToAction={
          <Button variant="primary" size="md" prefix={<PlusIcon />} asChild>
            <Link href="/admin/certificates/new">
              <div className="max-sm:sr-only">New template</div>
            </Link>
          </Button>
        }
      >
        <DataTableToolbar table={table} filterFields={filterFields}>
          <CertificatesTableToolbarActions table={table} />
          <DateRangePicker align="end" />
          <DataTableViewOptions table={table} />
        </DataTableToolbar>
      </DataTableHeader>
    </DataTable>
  )
}
