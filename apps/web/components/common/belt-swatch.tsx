import { cx } from "~/lib/utils"

/**
 * A belt indicator driven by `Rank.colorHex` data — never a hardcoded belt-color
 * map (the brand-safe rule, see ADR 0022 / lineage surfaces).
 *
 * Rendered as an SVG so the DB colour is applied via the `fill` presentation
 * attribute rather than a `style={}` inline style. Presentation-only and
 * `aria-hidden` — the adjacent rank text carries the meaning. Falls back to a
 * neutral muted swatch (`currentColor` + `text-muted`) when a rank has no `colorHex`.
 *
 * Variants:
 * - `dot` (default) — a small belt-color dot for dense/listing surfaces.
 * - `bar` — a belt graphic (folded belt + knot) for the cinematic lineage explorer.
 *   Pass `shimmer` for a brand specular sweep; the sweep self-disables under
 *   `prefers-reduced-motion` (handled in `app/styles.css` `.belt-shimmer`).
 * - `flat-bar` — a flat horizontal rank bar (the ancestry-timeline shape,
 *   SESSION_0493). Pass `degree` to render degree stripes toward one end — the
 *   standard BJJ black-belt bar layout. Stripes are white with a faint dark edge so
 *   they read on any data-driven belt color; capped at 10.
 */
const FLAT_BAR_MAX_STRIPES = 10

export function BeltSwatch({
  colorHex,
  className,
  variant = "dot",
  shimmer = false,
  degree = null,
}: {
  colorHex?: string | null
  className?: string
  variant?: "dot" | "bar" | "flat-bar"
  shimmer?: boolean
  /** Degree stripes on the `flat-bar` variant (ignored by `dot`/`bar`). */
  degree?: number | null
}) {
  if (variant === "flat-bar") {
    const fill = colorHex ?? "currentColor"
    const stripeCount = Math.min(Math.max(degree ?? 0, 0), FLAT_BAR_MAX_STRIPES)
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 56 10"
        className={cx("h-2.5 w-14 shrink-0 overflow-hidden", !colorHex && "text-muted", className)}
      >
        {/* flat belt body */}
        <rect
          x="0.5"
          y="1.5"
          width="55"
          height="7"
          rx="1.5"
          fill={fill}
          className={cx(!colorHex && "stroke-border")}
        />
        {/* degree stripes — right-anchored, standard black-belt bar layout */}
        {Array.from({ length: stripeCount }, (_, index) => (
          <rect
            // eslint-disable-next-line react/no-array-index-key -- stripes are positional by definition
            key={index}
            x={49.5 - index * 4}
            y="1.5"
            width="2.4"
            height="7"
            fill="rgba(255,255,255,0.92)"
            stroke="rgba(0,0,0,0.25)"
            strokeWidth="0.4"
          />
        ))}
      </svg>
    )
  }

  if (variant === "bar") {
    const fill = colorHex ?? "currentColor"
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 40 12"
        className={cx("h-3 w-10 shrink-0 overflow-hidden", !colorHex && "text-muted", className)}
      >
        {/* belt body */}
        <rect
          x="0.5"
          y="3"
          width="39"
          height="6"
          rx="3"
          fill={fill}
          className={cx(!colorHex && "stroke-border")}
        />
        {/* knot + wrap shadow */}
        <rect
          x="15.5"
          y="1.5"
          width="9"
          height="9"
          rx="1.6"
          fill={fill}
          stroke="rgba(0,0,0,0.28)"
          strokeWidth="0.6"
        />
        <rect x="18.4" y="1.5" width="3.2" height="9" fill="rgba(0,0,0,0.2)" />
        {shimmer && (
          <rect
            className="belt-shimmer"
            x="0"
            y="3"
            width="5"
            height="6"
            rx="2.5"
            fill="rgba(255,255,255,0.5)"
          />
        )}
      </svg>
    )
  }

  // dot (default — unchanged; aria-hidden, adjacent text carries meaning)
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
