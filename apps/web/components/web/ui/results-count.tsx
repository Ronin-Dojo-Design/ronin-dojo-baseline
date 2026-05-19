import type { ComponentProps } from "react"
import { cx } from "~/lib/utils"

export type ResultsCountProps = ComponentProps<"p"> & {
  total: number
  label: string
}

export const ResultsCount = ({ total: _total, label, className, ...props }: ResultsCountProps) => {
  return (
    <p className={cx("text-sm text-muted-foreground", className)} {...props}>
      {label}
    </p>
  )
}
