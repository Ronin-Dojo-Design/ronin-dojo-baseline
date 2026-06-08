import { cx } from "~/lib/utils"

/**
 * A small belt-color swatch driven by `Rank.colorHex` data — never a hardcoded
 * belt-color map (the brand-safe rule, see ADR 0022 / lineage surfaces).
 *
 * Rendered as an SVG so the DB colour is applied via the `fill` presentation
 * attribute rather than a `style={}` inline style. Presentation-only and
 * `aria-hidden` — the adjacent rank text carries the meaning. Falls back to a
 * neutral muted dot (`currentColor` + `text-muted`) when a rank has no `colorHex`.
 */
export function BeltSwatch({
  colorHex,
  className,
}: {
  colorHex?: string | null
  className?: string
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 12 12"
      className={cx("size-3 shrink-0", !colorHex && "text-muted", className)}
    >
      <circle cx="6" cy="6" r="5" fill={colorHex ?? "currentColor"} className="stroke-border" />
    </svg>
  )
}
