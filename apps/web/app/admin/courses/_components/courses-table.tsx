"use client"

import { PlusIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import type { Course } from "~/.generated/prisma/browser"
import { getColumns } from "~/app/admin/courses/_components/courses-table-columns"
import { CoursesTableToolbarActions } from "~/app/admin/courses/_components/courses-table-toolbar-actions"
import { DateRangePicker } from "~/components/admin/date-range-picker"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { DataTable } from "~/components/data-table/data-table"
import { DataTableHeader } from "~/components/data-table/data-table-header"
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import { useDataTable } from "~/hooks/use-data-table"
import type { findCourses } from "~/server/admin/courses/queries"
import { coursesTableParamsSchema } from "~/server/admin/courses/schema"
import type { DataTableFilterField } from "~/types"

type CoursesTableProps = {
  coursesPromise: ReturnType<typeof findCourses>
}

export function CoursesTable({ coursesPromise }: CoursesTableProps) {
  const { courses, total, pageCount } = use(coursesPromise)
  const [{ perPage, sort }] = useQueryStates(coursesTableParamsSchema)

  const columns = useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<Course>[] = [
    {
      id: "title",
      label: "Title",
      placeholder: "Filter by title...",
    },
  ]

  const { table } = useDataTable({
    data: courses,
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
        title="Courses"
        total={total}
        callToAction={
          <Button
            variant="primary"
            size="md"
            prefix={<PlusIcon />}
            render={<Link href="/admin/courses/new" />}
          >
            <div className="max-sm:sr-only">New course</div>
          </Button>
        }
      >
        <DataTableToolbar table={table} filterFields={filterFields}>
          <CoursesTableToolbarActions table={table} />
          <DateRangePicker align="end" />
          <DataTableViewOptions table={table} />
        </DataTableToolbar>
      </DataTableHeader>
    </DataTable>
  )
}
