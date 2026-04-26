import type { Row, Table } from "@tanstack/react-table"
import type { ComponentProps, MouseEventHandler } from "react"
import { Box } from "~/components/common/box"
import { cx } from "~/lib/utils"

// Store the last selected index
let lastSelectedIndex: number | null = null

type RowCheckboxProps = ComponentProps<"input"> & {
  table?: Table<any>
  row?: Row<any>
}

export const RowCheckbox = ({ className, table, row, ...props }: RowCheckboxProps) => {
  const handleClick: MouseEventHandler<HTMLInputElement> = ({ shiftKey, currentTarget }) => {
    if (!table || !row) return

    const { checked } = currentTarget

    if (shiftKey && lastSelectedIndex !== null) {
      const { rows } = table.getRowModel()

      const start = Math.min(lastSelectedIndex, row.index)
      const end = Math.max(lastSelectedIndex, row.index)

      const rowsToSelect = rows.slice(start, end + 1)

      rowsToSelect.forEach(r => {
        if (r.index !== row.index && r.getCanSelect()) {
          r.toggleSelected(checked)
        }
      })
    }

    lastSelectedIndex = row.index
  }

  return (
    <label className={cx("relative z-10 cursor-pointer select-none", className)}>
      <Box hover focus>
        <input type="checkbox" name="select" className="block" onClick={handleClick} {...props} />
      </Box>

      <span className="absolute -inset-3 -right-2 z-0" />
    </label>
  )
}
