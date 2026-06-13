"use client"

import {
  ArchiveIcon,
  CheckCircleIcon,
  CircleDashedIcon,
  CircleDotIcon,
  InboxIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react"
import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import { ContentAtomStatus } from "~/.generated/prisma/browser"
import { getColumns } from "~/app/app/content/_components/content-atoms-table-columns"
import { ContentAtomsTableToolbarActions } from "~/app/app/content/_components/content-atoms-table-toolbar-actions"
import { DateRangePicker } from "~/components/admin/date-range-picker"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { DataTable } from "~/components/data-table/data-table"
import { DataTableHeader } from "~/components/data-table/data-table-header"
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import { useDataTable } from "~/hooks/use-data-table"
import type { findContentAtoms } from "~/server/admin/content/queries"
import { contentAtomsTableParamsSchema } from "~/server/admin/content/schema"
import type { DataTableFilterField } from "~/types"

type ContentAtomRow = Awaited<ReturnType<typeof findContentAtoms>>["atoms"][number]

type ContentAtomsTableProps = {
  atomsPromise: ReturnType<typeof findContentAtoms>
}

export function ContentAtomsTable({ atomsPromise }: ContentAtomsTableProps) {
  const { atoms, total, pageCount } = use(atomsPromise)
  const [{ perPage, sort }] = useQueryStates(contentAtomsTableParamsSchema)

  const columns = useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<ContentAtomRow>[] = [
    {
      id: "title",
      label: "Title",
      placeholder: "Filter by title...",
    },
    {
      id: "status",
      label: "Status",
      options: [
        {
          label: "Inbox",
          value: ContentAtomStatus.INBOX,
          icon: <InboxIcon className="text-gray-500" />,
        },
        {
          label: "Draft",
          value: ContentAtomStatus.DRAFT,
          icon: <CircleDashedIcon className="text-gray-500" />,
        },
        {
          label: "Review",
          value: ContentAtomStatus.REVIEW,
          icon: <SearchIcon className="text-blue-500" />,
        },
        {
          label: "Approved",
          value: ContentAtomStatus.APPROVED,
          icon: <CircleDotIcon className="text-green-500" />,
        },
        {
          label: "Published",
          value: ContentAtomStatus.PUBLISHED,
          icon: <CheckCircleIcon className="text-green-500" />,
        },
        {
          label: "Archived",
          value: ContentAtomStatus.ARCHIVED,
          icon: <ArchiveIcon className="text-orange-500" />,
        },
      ],
    },
  ]

  const { table } = useDataTable({
    data: atoms,
    columns,
    pageCount,
    filterFields,
    shallow: false,
    clearOnDefault: true,
    initialState: {
      pagination: { pageIndex: 0, pageSize: perPage },
      sorting: sort,
      columnVisibility: { createdAt: false },
      columnPinning: { right: ["actions"] },
    },
    getRowId: originalRow => originalRow.id,
  })

  return (
    <DataTable table={table}>
      <DataTableHeader
        title="Content Atoms"
        total={total}
        callToAction={
          <Button
            variant="primary"
            size="md"
            prefix={<PlusIcon />}
            render={<Link href="/app/content/new" />}
          >
            <div className="max-sm:sr-only">New atom</div>
          </Button>
        }
      >
        <DataTableToolbar table={table} filterFields={filterFields}>
          <ContentAtomsTableToolbarActions table={table} />
          <DateRangePicker align="end" />
          <DataTableViewOptions table={table} />
        </DataTableToolbar>
      </DataTableHeader>
    </DataTable>
  )
}
