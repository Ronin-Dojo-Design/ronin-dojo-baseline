"use client"

import { useRef, useState } from "react"
import type { ConnectorEdge } from "~/lib/lineage/connector-geometry"
import { cx } from "~/lib/utils"
import { useIsomorphicLayoutEffect } from "./canvas-dom"
import {
  CONNECTOR_BAND_PX,
  CONNECTOR_BUS_PX,
  CONNECTOR_GROW_DURATION,
} from "./lineage-tree-canvas-constants"

// Measured SVG connector overlay for one parent → children band. Rendered as the first child of the
// children-row container (position: relative) and offset up into the gap above it. Re-measures
// child-column centres on mount, container resize (zoom/font), and structural change (collapse /
// reorder).
export function LineageConnectorLayer({
  edges,
  growDelaySec,
  reduceMotion,
}: {
  edges: ConnectorEdge[]
  growDelaySec: number
  reduceMotion: boolean
}) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [layout, setLayout] = useState<{ centerX: number; targets: number[] } | null>(null)
  // Re-measure when the set/order of child columns changes even if the container width does not
  // (e.g. drag-reorder), since ResizeObserver only fires on box-size changes.
  const remeasureKey = edges.map(edge => edge.id).join("|")

  // Measure off the svg's own parent (the children-row container). Reading this component's own ref
  // in its own layout effect is reliable; a *parent* ref passed down would still be null here,
  // because React attaches a parent's ref only after its children's layout effects run (bottom-up
  // commit). `:scope >` limits the match to this level's direct child columns — a bare
  // `[data-lineage-conn-col]` query is recursive and would also grab every nested descendant column.
  useIsomorphicLayoutEffect(() => {
    const container = svgRef.current?.parentElement
    if (!container) return

    const measure = () => {
      const columns = container.querySelectorAll<HTMLElement>(":scope > [data-lineage-conn-col]")
      if (columns.length === 0) {
        setLayout(null)
        return
      }
      const centerX = container.clientWidth / 2
      const targets = Array.from(columns, col => col.offsetLeft + col.offsetWidth / 2)
      setLayout({ centerX, targets })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [remeasureKey])

  // The svg always renders (so its ref — and thus the container — is available in the layout effect
  // above); the paths appear once measured.
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
        const edge = edges[index]
        if (!edge) return null
        // 90° bend: parent-centre drop → horizontal bus → child-centre drop. A single centred child
        // collapses to a straight vertical line (the bus segment has zero length).
        const d = `M ${layout.centerX} 0 L ${layout.centerX} ${CONNECTOR_BUS_PX} L ${targetX} ${CONNECTOR_BUS_PX} L ${targetX} ${CONNECTOR_BAND_PX}`
        return (
          <path
            key={edge.id}
            d={d}
            fill="none"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            // Normalised so one keyframe (connector-draw) draws any length; reduced-motion = full.
            pathLength={1}
            // Static stroke colour + transition live in Tailwind (same idiom as the old div
            // connectors: `bg-primary/60` / `transition-colors`); `transition-colors` covers stroke.
            className={cx(
              "transition-colors duration-200",
              edge.highlighted ? "stroke-primary/60" : "stroke-border",
            )}
            // Inline holds only the irreducibly per-edge runtime values: the path-trace cascade
            // delay (a float derived from tree depth) and the grow-in animation timing. These have
            // no static-class equivalent.
            style={{
              transitionDelay: edge.traceDelaySec > 0 ? `${edge.traceDelaySec}s` : undefined,
              strokeDasharray: reduceMotion ? undefined : 1,
              animation: reduceMotion
                ? undefined
                : `connector-draw ${CONNECTOR_GROW_DURATION}s var(--ease-snappy) ${growDelaySec}s both`,
            }}
          />
        )
      })}
    </svg>
  )
}
