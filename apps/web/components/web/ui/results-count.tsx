import type { ComponentProps } from "react"
import { cx } from "~/lib/utils"

export type ResultsCountProps = ComponentProps<"p"> & {
  total: number
  label: string
}

/**
 * A single filter-aware count line above a listing grid. `total` is the real, consume-able signal:
 * a count line for zero results is noise the `EmptyList` already carries, so this renders NOTHING at
 * `total <= 0` — callers can mount it unconditionally and let the count self-hide. `label` is the
 * caller-formatted plural string (e.g. "3 posts"); `total` also feeds `aria-label` so a screen
 * reader gets the number even when the label is abbreviated. (SESSION_0495 C2-6: `total` was accepted
 * then discarded — repaired to gate visibility + describe the region.)
 */
export const ResultsCount = ({ total, label, className, ...props }: ResultsCountProps) => {
  if (total <= 0) return null

  return (
    <p
      role="status"
      aria-label={label}
      className={cx("text-sm text-muted-foreground", className)}
      {...props}
    >
      {label}
    </p>
  )
}
