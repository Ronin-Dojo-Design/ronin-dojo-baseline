import { useId } from "react"
import { cx } from "~/lib/utils"

/**
 * A belt indicator driven by `Rank` data — never a hardcoded belt-color map (the
 * brand-safe rule, ADR 0026 + design-system doctrine / lineage surfaces). The belt BODY
 * color always comes from `Rank.colorHex`; only the rank-bar TREATMENT (bar color + outline)
 * is design, driven by the belt FAMILY — see `beltBarTreatment` below, the ONE home for
 * those design constants.
 *
 * Rendered as an SVG so DB colours apply via the `fill` presentation attribute rather
 * than an inline `style={}`. Presentation-only and `aria-hidden` — the adjacent rank
 * text carries the meaning. Falls back to an explicit neutral swatch (`BELTLESS_FILL`, a
 * fixed mid-gray that reads consistently on both light + dark themes) when a rank has no
 * `colorHex` — never theme-following `currentColor`, which renders near-white in light mode
 * on the always-dark cinematic lineage card (WL-P3-41).
 *
 * Variants:
 * - `dot` (default) — a small belt-color dot for dense/listing surfaces.
 * - `belt` — the refined BJJ rank-bar belt (SESSION_0539, operator-locked geometry): a belt
 *   body + a rank bar right-anchored to a constant tip edge + a belt-color tip past it. The
 *   bar length varies by family (coral/red full; white → 6th-degree black are 3/4). Degree
 *   marks are full-height white "athletic-tape" bands wrapped edge-to-edge across the belt
 *   (clipped to the rounded body), right-anchored from the tip at 1:1 tape-to-gap, sized so up
 *   to 10 stay countable — a 9th and a 10th never look alike. Bar color + treatment come from
 *   `beltFamily` via `beltBarTreatment`:
 *     · COLORED (white/blue/purple/brown) → black bar (3/4), 0–4 stripe marks
 *     · BLACK (1st–6th degree)            → red bar (3/4), 1–6 degree marks
 *     · CORAL (7th/8th degree)            → red bar (full) + white flush seams, alternating
 *       `secondaryColorHex` panel body, 7/8 marks
 *     · RED (9th/10th degree)             → red bar (full) + white flush seams, solid red body, 9/10 marks
 *   A null `beltFamily` (non-BJJ / unseeded rank) renders JUST the belt-color body — no bar,
 *   no marks — so an eskrima/kajukenbo rank never shows a jarring neutral bar.
 *
 * Sizing: the SVG WIDTH governs the rendered belt size (`h-*` only letterboxes), so the
 * `belt` variant takes a `size` preset that sets width and lets height auto-follow the
 * 7.4:1 aspect — never pass a fighting `h-*` at a call site (Desi, SESSION_0539 verify).
 *
 * The belt body carries a hairline neutral border UNCONDITIONALLY — a `#000000` black belt
 * is otherwise invisible on the dark default theme (SESSION_0493 Desi P0).
 */

/** A belt-family literal (mirrors the Prisma `BeltFamily` enum; kept local so this
 * `"use client"`-safe presentational component never imports the generated Prisma
 * module — that breaks Turbopack with `node:module`). */
export type BeltFamily = "COLORED" | "BLACK" | "CORAL" | "RED"

/**
 * The four `Rank` fields the `belt` variant renders — the render-model every belt
 * surface threads through and spreads into `<BeltSwatch variant="belt" {...belt} />`.
 * Resolvers (`memberBeltRender`, etc.) produce this shape once so surfaces inherit it.
 */
export type BeltRenderData = {
  colorHex: string | null
  secondaryColorHex: string | null
  degree: number | null
  beltFamily: BeltFamily | null
}

// --- Rank-bar treatment design constants (the ONE home) ---------------------
// These are DESIGN, not per-belt data: the belt family drives the bar, belt body
// colours still come from `Rank.colorHex` (ADR 0026 intact).
const BAR_BLACK = "#111111"
const BAR_RED = "#C1121F"
const BAR_NEUTRAL = "#6B7280"
const BAR_OUTLINE = "#FFFFFF"

/**
 * The ONE home for the rank-bar treatment constants: maps a belt family to its bar
 * color + whether the bar carries a thin white outline. Outline whenever the belt body
 * is red-ish (coral + red) so the red bar stays distinct from the red body. `null`
 * (non-BJJ / unseeded) → a neutral bar, no outline.
 */
export function beltBarTreatment(family: BeltFamily | null): {
  barColor: string
  outline: boolean
} {
  switch (family) {
    case "COLORED":
      return { barColor: BAR_BLACK, outline: false }
    case "BLACK":
      return { barColor: BAR_RED, outline: false }
    case "CORAL":
    case "RED":
      return { barColor: BAR_RED, outline: true }
    default:
      // F04: retained as a type-safety fallback — unreachable in RENDER (the bar is guarded
      // on `beltFamily` in `BeltVariant`, so a null family renders no bar at all). Exercised
      // directly by `belt-swatch.test.tsx` ("null → neutral"), so the switch stays exhaustive.
      return { barColor: BAR_NEUTRAL, outline: false }
  }
}

// --- `belt` variant geometry (operator-locked, viewBox 0 0 148 20 — aspect 7.4:1) ---
const BELT_W = 148
const BELT_H = 20
const TIP_WIDTH = 14 // belt-color segment shown past the bar
const BAR_END = BELT_W - TIP_WIDTH // = 134 — the bar's RIGHT edge, constant for every belt
const BAR_W_FULL = 62 // coral/red (7–10 degrees) keep full length
const BAR_W_SHORT = 46.5 // white → 6th-degree black: ¾ length, right-anchored to the tip
const MARK_INSET = 4.5 // horizontal inset of the mark region from the bar's tip edge
const MARK_MAX = 10 // up to 10 full-height tape marks stay countable
const MARK_WIDTH = 2.9 // "athletic tape" band width
const MARK_REGION_RIGHT = BAR_END - MARK_INSET // = 129.5 — marks right-anchored from the tip
const MARK_PITCH = MARK_WIDTH * 2 // = 5.8 — equal mark : gap (1:1 tape-to-gap)
const SEAM_WIDTH = 0.8 // coral/red flush vertical seams (bar top/bottom = belt edges)
/** Alternating-panel count for two-color belts (coral) across the full belt body. */
const PANEL_COUNT = 8
const PANEL_WIDTH = (BELT_W - 2) / PANEL_COUNT
/** Hairline neutral border — a mid-gray that reads on both light + dark themes so a
 * `#000000` black belt keeps a visible silhouette (SESSION_0493 Desi P0). */
const BODY_STROKE = "rgba(150,150,150,0.5)"
/** Beltless fallback fill — a fixed mid-gray for a rank with no `colorHex`. Explicit (not
 * theme-following `currentColor`) so an empty belt reads the SAME on light + dark, never
 * near-white on the always-dark cinematic lineage card (WL-P3-41). */
const BELTLESS_FILL = "#6B7280"

/** `belt`-variant size presets — set WIDTH only; height auto-follows the 7.4:1 aspect.
 * The SVG width governs the rendered belt size, so we never emit a fighting `h-*`. */
const SIZE_WIDTH = {
  sm: "w-28", // 112px — compact (filter chips)
  md: "w-36", // 144px — default
  lg: "w-48", // 192px — prestige surfaces (hero, drawer, timeline)
  full: "w-full", // roster rows (name-above-belt stack)
} as const

export function BeltSwatch({
  colorHex,
  className,
  variant = "dot",
  size = "md",
  degree = null,
  secondaryColorHex = null,
  beltFamily = null,
}: {
  colorHex?: string | null
  className?: string
  variant?: "dot" | "belt"
  /** Width preset for the `belt` variant (height auto-follows the aspect); ignored by `dot`. */
  size?: keyof typeof SIZE_WIDTH
  /** Grade marks on the `belt` variant (0–10); null → no marks. Ignored by `dot`. */
  degree?: number | null
  /** Second panel color for alternating belts (coral) on the `belt` variant; null = solid. */
  secondaryColorHex?: string | null
  /** Belt family driving the rank-bar treatment on the `belt` variant; null → NO bar (belt-color
   * body only — a non-BJJ / unseeded rank never renders a jarring neutral bar). */
  beltFamily?: BeltFamily | null
}) {
  // Unique per instance — several belts render on one page (an ancestry chain), so the
  // clipPath ids must not collide. Resolved HERE (not in `BeltVariant`) so the id stays
  // byte-stable across the variant-dispatch extraction (SESSION_0540 code-quality pass).
  const clipId = useId()

  if (variant === "belt") {
    return (
      <BeltVariant
        clipId={clipId}
        colorHex={colorHex}
        className={className}
        size={size}
        degree={degree}
        secondaryColorHex={secondaryColorHex}
        beltFamily={beltFamily}
      />
    )
  }

  // dot (default — aria-hidden, adjacent text carries meaning)
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 12 12"
      className={cx("size-3 shrink-0", className)}
    >
      <circle cx="6" cy="6" r="5" fill={colorHex ?? BELTLESS_FILL} className="stroke-border" />
    </svg>
  )
}

/**
 * The `belt`-variant SVG render — the refined BJJ rank-bar belt (operator-locked geometry:
 * body + inset rank bar + belt-color tip + full-height wrapped-tape degree marks + coral/red
 * flush seams). Split out of `BeltSwatch` so the top-level component reads as a thin variant
 * dispatch (SESSION_0540); the render is byte-identical to the pre-extraction inline SVG. The
 * `clipId` is resolved in the parent so it stays collision-free AND stable across the split.
 */
function BeltVariant({
  clipId,
  colorHex,
  className,
  size,
  degree,
  secondaryColorHex,
  beltFamily,
}: {
  clipId: string
  colorHex?: string | null
  className?: string
  // `BeltSwatch` always forwards these with its own defaults applied, so they arrive
  // resolved (never `undefined`) — required here so `beltBarTreatment` stays `| null`-clean.
  size: keyof typeof SIZE_WIDTH
  degree: number | null
  secondaryColorHex: string | null
  beltFamily: BeltFamily | null
}) {
  const fill = colorHex ?? BELTLESS_FILL
  const { barColor, outline } = beltBarTreatment(beltFamily)
  // Bar length varies by family, right-anchored to the constant tip edge: coral/red keep full
  // length, white → 6th-degree black are 3/4.
  const isLongBar = beltFamily === "CORAL" || beltFamily === "RED"
  const barWidth = isLongBar ? BAR_W_FULL : BAR_W_SHORT
  const barX = BAR_END - barWidth
  const markCount = beltFamily ? Math.min(Math.max(degree ?? 0, 0), MARK_MAX) : 0
  const panelClipId = `${clipId}-panel`
  const barClipId = `${clipId}-bar`
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${BELT_W} ${BELT_H}`}
      className={cx("h-auto shrink-0", SIZE_WIDTH[size], className)}
    >
      {/* belt body — data-driven color, hairline neutral border */}
      <rect
        x="1"
        y="1"
        width={BELT_W - 2}
        height={BELT_H - 2}
        rx="3"
        fill={fill}
        stroke={BODY_STROKE}
        strokeWidth="0.5"
      />
      {/* alternating second-color panels — coral red/black · red/white (clipped to the body) */}
      {secondaryColorHex && (
        <g>
          <clipPath id={panelClipId}>
            <rect x="1" y="1" width={BELT_W - 2} height={BELT_H - 2} rx="3" />
          </clipPath>
          <g clipPath={`url(#${panelClipId})`}>
            {Array.from({ length: Math.floor(PANEL_COUNT / 2) }, (_, index) => (
              <rect
                // eslint-disable-next-line react/no-array-index-key -- panels are positional by definition
                key={index}
                x={1 + PANEL_WIDTH * (index * 2 + 1)}
                y="1"
                width={PANEL_WIDTH}
                height={BELT_H - 2}
                fill={secondaryColorHex}
              />
            ))}
          </g>
          {/* re-stroke the border over the panels so the silhouette stays unbroken */}
          <rect
            x="1"
            y="1"
            width={BELT_W - 2}
            height={BELT_H - 2}
            rx="3"
            fill="none"
            stroke={BODY_STROKE}
            strokeWidth="0.5"
          />
        </g>
      )}
      {/* rank bar renders ONLY for a known BJJ family — a null-family (non-BJJ / unseeded) rank
          shows just the belt-color body, no bar. Bar + full-height degree tapes + coral/red flush
          seams are wrapped edge-to-edge and clipped to the rounded body. */}
      {beltFamily && (
        <>
          <clipPath id={barClipId}>
            <rect x="1" y="1" width={BELT_W - 2} height={BELT_H - 2} rx="3" />
          </clipPath>
          <g clipPath={`url(#${barClipId})`}>
            <rect x={barX} y="1" width={barWidth} height={BELT_H - 2} fill={barColor} />
            {/* grade marks — full-height white bands, right-anchored (fill from the tip inward) */}
            {Array.from({ length: markCount }, (_, index) => (
              <rect
                // eslint-disable-next-line react/no-array-index-key -- marks are positional by definition
                key={index}
                x={MARK_REGION_RIGHT - MARK_WIDTH - index * MARK_PITCH}
                y="1"
                width={MARK_WIDTH}
                height={BELT_H - 2}
                fill="#FFFFFF"
              />
            ))}
            {/* coral/red: flush left + right vertical seams (bar top/bottom = the belt's own edges,
                no boxed-in outline) — keeps the red bar distinct from a red body. */}
            {outline && (
              <>
                <rect x={barX} y="1" width={SEAM_WIDTH} height={BELT_H - 2} fill={BAR_OUTLINE} />
                <rect
                  x={BAR_END - SEAM_WIDTH}
                  y="1"
                  width={SEAM_WIDTH}
                  height={BELT_H - 2}
                  fill={BAR_OUTLINE}
                />
              </>
            )}
          </g>
        </>
      )}
    </svg>
  )
}
