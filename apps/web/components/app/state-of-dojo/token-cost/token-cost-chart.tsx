"use client"

/**
 * TokenCostChart — the `dataviz`-guidance area chart for the token-cost panel (SESSION_0608):
 * semantic-token palette (theme-aware via `--color-*` CSS vars, same idiom as
 * `lineage-connector-layer.tsx`'s `stroke-primary`/`stroke-border`), a faint dashed grid, an area
 * fill under the trend line, and an emphasized endpoint marking the most recent session's spend.
 *
 * Hand-rolled SVG (no chart library in this repo — mirrors `components/admin/chart.tsx`'s posture
 * of a small presentational chart over a data dependency). Renders nothing for <2 points (a single
 * point has no trend to draw) — the panel falls back to the accessible table in that case.
 *
 * The endpoint marker is a CSS-positioned dot OUTSIDE the `<svg>`, not an SVG `<circle>` (DES-003):
 * the svg uses `preserveAspectRatio="none"` so the 320×96 viewBox stretches non-uniformly to fill
 * the full-width container — intended for the line/area, but it would squash a `<circle>` into an
 * ellipse. Positioning the dot with percentage `left`/`top` over the container keeps it round under
 * any stretch.
 */
import { useId } from "react"
import type { CostPoint } from "~/lib/state-of-dojo/token-cost-parse"
import { cx } from "~/lib/utils"

const WIDTH = 320
const HEIGHT = 96
const GRID_LINES = 3

export function TokenCostChart({ points, className }: { points: CostPoint[]; className?: string }) {
  const gradientId = useId()
  if (points.length < 2) return null

  const maxCost = Math.max(...points.map(p => p.costUsd), 0.01)
  const stepX = WIDTH / (points.length - 1)
  const coords = points.map((p, i) => ({
    x: i * stepX,
    y: HEIGHT - (p.costUsd / maxCost) * HEIGHT,
    point: p,
  }))
  const last = coords[coords.length - 1]

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ")
  const areaPath = `${linePath} L ${last.x.toFixed(1)} ${HEIGHT} L ${coords[0].x.toFixed(1)} ${HEIGHT} Z`

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className={cx("h-24 w-full", className)}
        role="img"
        aria-label={`Token cost trend across ${points.length} sessions, ending at $${last.point.costUsd.toFixed(2)} (session #${last.point.number})`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* faint grid */}
        {Array.from({ length: GRID_LINES }, (_, i) => {
          const y = (HEIGHT / (GRID_LINES + 1)) * (i + 1)
          return (
            <line
              key={i}
              x1={0}
              y1={y}
              x2={WIDTH}
              y2={y}
              className="stroke-border"
              strokeWidth={1}
              strokeDasharray="2 3"
            />
          )
        })}

        {/* area fill */}
        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />

        {/* trend line */}
        <path
          d={linePath}
          fill="none"
          className="stroke-primary"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      {/* emphasized endpoint — CSS dot, not an SVG circle, so it stays round under the svg's
          non-uniform `preserveAspectRatio="none"` stretch. `clamp(6px, …%, calc(100% - 6px))` insets
          the center by the dot's visual half-radius (4px dot half + 2px ring = 6px) so an extreme
          point (last.x=WIDTH → 100%, or latest-is-max-cost → last.y=0 → 0%) can't poke the dot past
          the chart box; interior points are untouched — the clamp only bites at the edges. */}
      <span
        aria-hidden
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-2 ring-background"
        style={{
          left: `clamp(6px, ${(last.x / WIDTH) * 100}%, calc(100% - 6px))`,
          top: `clamp(6px, ${(last.y / HEIGHT) * 100}%, calc(100% - 6px))`,
          width: 8,
          height: 8,
        }}
      />
    </div>
  )
}
