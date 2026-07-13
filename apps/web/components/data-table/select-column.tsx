import type { ColumnDef } from "@tanstack/react-table"
import { RowCheckbox } from "~/components/admin/row-checkbox"

/**
 * The one row-selection column for admin data-tables (WL-P2-59, Phase B). Hoists the
 * byte-identical `id: "select"` `ColumnDef` — the indeterminate-ref "select all" header
 * checkbox plus the shift-click-aware "select row" cell checkbox — that 20 `*-columns.tsx`
 * files hand-rolled verbatim. Callers pass their row type: `selectColumn<Tool>()`.
 *
 * Surfaces whose select cell genuinely deviates are intentionally NOT migrated: the
 * `Checkbox`-based variant (certificates/courses/programs/tournaments) and the per-row
 * `disabled` account-gate (users/people) keep their inline blocks.
 */
export function selectColumn<TData>(): ColumnDef<TData> {
  return {
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
  }
}
