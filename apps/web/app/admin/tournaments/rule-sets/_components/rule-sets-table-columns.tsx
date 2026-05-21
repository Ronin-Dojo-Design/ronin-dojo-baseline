"use client"

import { formatDate } from "@primoui/utils"
import type { ColumnDef } from "@tanstack/react-table"
import { HashIcon } from "lucide-react"
import { RuleSetActions } from "~/app/admin/tournaments/rule-sets/_components/rule-set-actions"
import { RowCheckbox } from "~/components/admin/row-checkbox"
import { Badge } from "~/components/common/badge"
import { Note } from "~/components/common/note"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/common/tooltip"
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header"
import { DataTableLink } from "~/components/data-table/data-table-link"
import type { findRuleSetsPaginated } from "~/server/admin/tournaments/queries"

type RuleSetRow = Awaited<ReturnType<typeof findRuleSetsPaginated>>["ruleSets"][number]

const SCORING_METHOD_LABELS: Record<string, string> = {
  POINTS: "Points-based scoring (Karate, TKD, Fencing)",
  SUBMISSION: "Submission-based (BJJ, Judo)",
  DECISION: "Decision-based judging",
  DISQUALIFICATION: "Disqualification rules",
  TIME: "Time-based scoring",
  CUSTOM: "Custom scoring configuration",
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—"
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return sec > 0 ? `${min}:${String(sec).padStart(2, "0")}` : `${min}:00`
}

export const getColumns = (): ColumnDef<RuleSetRow>[] => {
  return [
    {
      id: "select",
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <RowCheckbox
          checked={table.getIsAllPageRowsSelected()}
          ref={input => {
            if (input) {
              input.indeterminate =
                table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
            }
          }}
          onChange={e => table.toggleAllPageRowsSelected(e.target.checked)}
          aria-label="Select all"
        />
      ),
      cell: ({ row, table }) => (
        <RowCheckbox
          checked={row.getIsSelected()}
          onChange={e => row.toggleSelected(e.target.checked)}
          aria-label="Select row"
          table={table}
          row={row}
        />
      ),
    },
    {
      accessorKey: "name",
      enableHiding: false,
      size: 160,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <DataTableLink
          href={`/admin/tournaments/rule-sets/${row.original.id}`}
          title={row.original.name}
        />
      ),
    },
    {
      accessorKey: "scoringMethod",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Scoring" />,
      cell: ({ row }) => {
        const scoringTooltip = SCORING_METHOD_LABELS[row.original.scoringMethod]
        const scoringBadge = (
          <Badge variant="outline">{row.original.scoringMethod.replace(/_/g, " ")}</Badge>
        )

        if (!scoringTooltip) return scoringBadge

        return (
          <Tooltip>
            <TooltipTrigger render={scoringBadge} />
            <TooltipContent>{scoringTooltip}</TooltipContent>
          </Tooltip>
        )
      },
    },
    {
      accessorKey: "matchDurationSec",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Duration" />,
      cell: ({ row }) => <Note>{formatDuration(row.original.matchDurationSec)}</Note>,
    },
    {
      accessorKey: "discipline.name",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Discipline" />,
      cell: ({ row }) => <Note>{row.original.discipline?.name ?? "All"}</Note>,
    },
    {
      accessorKey: "isSystem",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => (
        <Badge variant={row.original.isSystem ? "info" : "outline"}>
          {row.original.isSystem ? "System" : "Custom"}
        </Badge>
      ),
    },
    {
      accessorKey: "_count.tournamentDisciplines",
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Usage" />,
      cell: ({ row }) => (
        <Badge prefix={<HashIcon className="opacity-50 size-3!" />} className="tabular-nums">
          {row.original._count?.tournamentDisciplines || 0}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
      cell: ({ cell }) => <Note>{formatDate(cell.getValue() as Date)}</Note>,
    },
    {
      id: "actions",
      cell: ({ row }) => <RuleSetActions ruleSet={row.original} className="float-right" />,
    },
  ]
}
