import { useId } from "react"
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
 *   they read on any data-driven belt color. Stripes render for degrees 1–6 only:
 *   red/coral belts (7th+) don't carry stripe bars in BJJ, and 7–10 stripes read as
 *   a barcode at this size — the adjacent rank text already states the degree.
 *   Pass `secondaryColorHex` (from `Rank.secondaryColorHex`) to render alternating
 *   panels — the true coral red/black (7th) · red/white (8th) and Kodokan red-white
 *   Dan belts. Data-driven; null = solid belt.
 *
 * Every belt body carries the `stroke-border` outline UNCONDITIONALLY — a
 * `#000000` black belt is otherwise invisible on the dark default theme
 * (SESSION_0493 Desi P0).
 */
const FLAT_BAR_MAX_STRIPED_DEGREE = 6
/** Alternating-panel count for two-color belts (coral) — even width across the bar. */
const FLAT_BAR_PANEL_COUNT = 8

export function BeltSwatch({
  colorHex,
  className,
  variant = "dot",
  shimmer = false,
  degree = null,
  secondaryColorHex = null,
}: {
  colorHex?: string | null
  className?: string
  variant?: "dot" | "bar" | "flat-bar"
  shimmer?: boolean
  /** Degree stripes on the `flat-bar` variant, degrees 1–6 (7+ suppressed; ignored by `dot`/`bar`). */
  degree?: number | null
  /** Second panel color for alternating belts (coral) on the `flat-bar` variant; null = solid. */
  secondaryColorHex?: string | null
}) {
  // Unique per instance — several flat-bars render on one page (an ancestry chain),
  // so the clipPath id must not collide.
  const clipId = useId()

  if (variant === "flat-bar") {
    const fill = colorHex ?? "currentColor"
    const clampedDegree = Math.max(degree ?? 0, 0)
    // Panels and stripes never co-render: an alternating belt (coral / red-white Dan)
    // encodes its degree in the panels themselves — white stripes over white panels
    // would vanish (Doug P3, SESSION_0493).
    const stripeCount =
      secondaryColorHex || clampedDegree > FLAT_BAR_MAX_STRIPED_DEGREE ? 0 : clampedDegree
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 80 10"
        className={cx("h-2.5 w-20 shrink-0 overflow-hidden", !colorHex && "text-muted", className)}
      >
        {/* flat belt body */}
        <rect
          x="0.5"
          y="1.5"
          width="79"
          height="7"
          rx="1.5"
          fill={fill}
          className="stroke-border"
        />
        {/* alternating second-color panels — coral red/black · red/white (clipped to the body) */}
        {secondaryColorHex && (
          <g>
            <clipPath id={clipId}>
              <rect x="0.5" y="1.5" width="79" height="7" rx="1.5" />
            </clipPath>
            <g clipPath={`url(#${clipId})`}>
              {Array.from({ length: FLAT_BAR_PANEL_COUNT / 2 }, (_, index) => (
                <rect
                  // eslint-disable-next-line react/no-array-index-key -- panels are positional by definition
                  key={index}
                  x={0.5 + (79 / FLAT_BAR_PANEL_COUNT) * (index * 2 + 1)}
                  y="1.5"
                  width={79 / FLAT_BAR_PANEL_COUNT}
                  height="7"
                  fill={secondaryColorHex}
                />
              ))}
            </g>
            {/* re-stroke the outline over the panels so the silhouette stays unbroken */}
            <rect
              x="0.5"
              y="1.5"
              width="79"
              height="7"
              rx="1.5"
              fill="none"
              className="stroke-border"
            />
          </g>
        )}
        {/* degree stripes — right-anchored, standard black-belt bar layout */}
        {Array.from({ length: stripeCount }, (_, index) => (
          <rect
            // eslint-disable-next-line react/no-array-index-key -- stripes are positional by definition
            key={index}
            x={73.5 - index * 4}
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
        <rect x="0.5" y="3" width="39" height="6" rx="3" fill={fill} className="stroke-border" />
        {/* knot + wrap shadow — the knot overpaints the body outline, so it needs the
            border stroke too or a black belt's silhouette breaks mid-bar on dark. */}
        <rect
          x="15.5"
          y="1.5"
          width="9"
          height="9"
          rx="1.6"
          fill={fill}
          strokeWidth="0.6"
          className="stroke-border"
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
