"use client"

import { connectorGrowDelay } from "~/lib/lineage/connector-geometry"
import type { ConnectorColumn } from "./cohort-timeline-types"
import { useConnectorLayout } from "./use-connector-layout"

// Connector band geometry (mirrors lineage-tree-canvas.tsx: the Balkan 90° idiom).
const CONNECTOR_BAND_PX = 40
const CONNECTOR_BUS_PX = CONNECTOR_BAND_PX / 2
const CONNECTOR_GROW_DURATION = 0.25

/**
 * Measured-SVG connector band: one parent box → its branch-child columns.
 * Adapted from lineage-tree-canvas.tsx's LineageConnectorLayer (the canvas's copy
 * is not exported); reuses the `:scope > [data-lineage-conn-col]` measurement
 * (via `use-connector-layout`) + connector-geometry timing. The stroke is the
 * neutral `--border` token; reduced-motion = full line, no draw animation.
 */
export function ConnectorBand({
  columns,
  generation,
  reduceMotion,
}: {
  /** One per branch-child column, in render order: stable id + promotion year label. */
  columns: ConnectorColumn[]
  generation: number
  reduceMotion: boolean
}) {
  const { svgRef, layout } = useConnectorLayout(columns)
  const growDelaySec = connectorGrowDelay(generation)

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      width="100%"
      height={CONNECTOR_BAND_PX}
      className="pointer-events-none absolute left-0 overflow-visible"
      style={{ top: -CONNECTOR_BAND_PX }}
    >
      {layout?.targets.map((targetX, index) => {
        const col = columns[index]
        if (!col) return null
        const d = `M ${layout.centerX} 0 L ${layout.centerX} ${CONNECTOR_BUS_PX} L ${targetX} ${CONNECTOR_BUS_PX} L ${targetX} ${CONNECTOR_BAND_PX}`
        return (
          <g key={col.id}>
            <path
              d={d}
              fill="none"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              className="stroke-border transition-colors duration-200"
              style={{
                strokeDasharray: reduceMotion ? undefined : 1,
                animation: reduceMotion
                  ? undefined
                  : `connector-draw ${CONNECTOR_GROW_DURATION}s var(--ease-snappy) ${growDelaySec}s both`,
              }}
            />
            {/* Promotion-year marker on the rail — the connector IS a dated timeline segment. */}
            {col.year && (
              <text
                x={targetX}
                y={CONNECTOR_BUS_PX - 3}
                textAnchor="middle"
                className="fill-white/40 text-[9px] font-semibold tabular-nums"
              >
                {col.year}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
