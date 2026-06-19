"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import type { ConnectorColumn } from "./cohort-timeline-types"

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect

type ConnectorLayout = {
  centerX: number
  targets: number[]
}

/**
 * Measures a parent box's branch-child columns into SVG connector coordinates.
 * Mirrors lineage-tree-canvas.tsx's LineageConnectorLayer: reads the rendered
 * `:scope > [data-lineage-conn-col]` offsets under the SVG's parent and re-measures
 * on resize. Returns the svg ref to attach + the measured layout (null until
 * measured / when there are no columns).
 */
export function useConnectorLayout(columns: ConnectorColumn[]) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [layout, setLayout] = useState<ConnectorLayout | null>(null)
  const remeasureKey = columns.map(col => col.id).join("|")

  useIsomorphicLayoutEffect(() => {
    const container = svgRef.current?.parentElement
    if (!container) return

    const measure = () => {
      const cols = container.querySelectorAll<HTMLElement>(":scope > [data-lineage-conn-col]")
      if (cols.length === 0) {
        setLayout(null)
        return
      }
      const centerX = container.clientWidth / 2
      const targets = Array.from(cols, col => col.offsetLeft + col.offsetWidth / 2)
      setLayout({ centerX, targets })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [remeasureKey])

  return { svgRef, layout }
}
