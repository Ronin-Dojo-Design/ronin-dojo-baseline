import type { ComponentProps } from "react"
import { cx } from "~/lib/utils"

export type ResultsCountProps = ComponentProps<"p"> & {
  total: number
  label: string
  /**
   * Opt-in: render nothing at `total <= 0`. Use only where a zero count is pure noise the sibling
   * `EmptyList` already carries (e.g. `/posts`). Default is `false` — the count ALWAYS renders, so
   * "0 lineage trees" / "0 results" stays a visible zero-signal (a public-visibility contract for the
   * lineage listing: an anonymous search matching only hidden members must show "0 lineage trees").
   */
  hideWhenEmpty?: boolean
}

/**
 * A single filter-aware count line above a listing grid. `total` is the real, consume-able signal and
 * also feeds `aria-label` so a screen reader gets the number even when the label is abbreviated.
 * `label` is the caller-formatted plural string (e.g. "3 posts"). By default the zero count still
 * renders ("0 results") — pass `hideWhenEmpty` only where the `EmptyList` owns the zero copy.
 * (SESSION_0495 C2-6 repaired the discarded `total`; the hide-at-0 was made opt-in after an E2E
 * regression showed the lineage listing needs the visible "0 lineage trees" signal.)
 */
export const ResultsCount = ({
  total,
  label,
  hideWhenEmpty = false,
  className,
  ...props
}: ResultsCountProps) => {
  if (hideWhenEmpty && total <= 0) return null

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
