"use client"

import { PlusIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { use, useMemo } from "react"
import type { SkillLevel } from "~/.generated/prisma/browser"
import { getColumns } from "~/app/app/skill-levels/_components/skill-levels-table-columns"
import { DateRangePicker } from "~/components/admin/date-range-picker"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { DataTable } from "~/components/data-table/data-table"
import { DataTableHeader } from "~/components/data-table/data-table-header"
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import { useDataTable } from "~/hooks/use-data-table"
import type { findSkillLevels } from "~/server/admin/skill-levels/queries"
import { skillLevelsTableParamsSchema } from "~/server/admin/skill-levels/schema"
import type { DataTableFilterField } from "~/types"

type SkillLevelsTableProps = {
  skillLevelsPromise: ReturnType<typeof findSkillLevels>
}

export function SkillLevelsTable({ skillLevelsPromise }: SkillLevelsTableProps) {
  const { skillLevels, skillLevelsTotal, pageCount } = use(skillLevelsPromise)
  const [{ perPage, sort }] = useQueryStates(skillLevelsTableParamsSchema)

  const columns = useMemo(() => getColumns(), [])

  const filterFields: DataTableFilterField<SkillLevel>[] = [
    {
      id: "name",
      label: "Name",
      placeholder: "Filter by name...",
    },
  ]

  const { table } = useDataTable({
    data: skillLevels,
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
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
  })

  return (
    <DataTable table={table}>
      <DataTableHeader
        title="Skill Levels"
        total={skillLevelsTotal}
        callToAction={
          <Button
            variant="primary"
            size="md"
            prefix={<PlusIcon />}
            render={<Link href="/app/skill-levels/new" />}
          >
            <div className="max-sm:sr-only">New skill level</div>
          </Button>
        }
      >
        <DataTableToolbar table={table} filterFields={filterFields}>
          <DateRangePicker align="end" />
          <DataTableViewOptions table={table} />
        </DataTableToolbar>
      </DataTableHeader>
    </DataTable>
  )
}
