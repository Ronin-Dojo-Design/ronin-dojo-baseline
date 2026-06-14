"use client"

/**
 * DEV-ONLY smoke component — SESSION_0381 TASK_03 (slice 0379-1), updated SESSION_0382.
 *
 * Proves the full 0379-2 adapter pipeline: toLineageVisual → toFamilyChartData →
 * donatso/family-chart engine. Belt cards, drawer, and secondary overlay come in 0379-3.
 *
 * Remove or replace with the real View A island in slice 0379-3.
 */

import { useEffect, useRef } from "react"
import { createChart } from "~/lib/lineage/family-chart/index"
import { toFamilyChartData } from "~/lib/lineage/to-family-chart-data"
import { toLineageVisual } from "~/lib/lineage/to-lineage-visual"
import type { LineageTreeMemberRow } from "~/server/web/lineage/payloads"

interface Props {
  members: LineageTreeMemberRow[]
  defaultRootMemberId?: string | null
}

export function LineageFamilyChartSmoke({ members, defaultRootMemberId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cont = containerRef.current
    if (!cont) return

    const { nodes } = toLineageVisual(members, { mainMemberId: defaultRootMemberId })
    const data = toFamilyChartData(nodes)
    if (data.length === 0) return

    const main_id = defaultRootMemberId ?? data[0]!.id

    const chart = createChart(cont, data)

    chart
      .setCardSvg()
      .setCardDisplay([(d: { data: { displayName?: string } }) => d.data.displayName ?? ""])

    chart.setSingleParentEmptyCard(false)
    chart.updateMainId(main_id)
    chart.updateTree({ initial: true, tree_position: "fit" })

    return () => {
      cont.innerHTML = ""
    }
  }, [members, defaultRootMemberId])

  return (
    <div>
      <div
        style={{
          padding: "8px 12px",
          background: "#fefce8",
          border: "1px solid #fde047",
          borderRadius: 6,
          fontSize: 13,
          marginBottom: 8,
        }}
      >
        🔬 DEV SMOKE — 0379-2 adapters (toLineageVisual → toFamilyChartData → donatso) ·{" "}
        {members.length} members · replace in 0379-3
      </div>
      <div
        ref={containerRef}
        id="FamilyChartSmoke"
        style={{
          width: "100%",
          height: 600,
          position: "relative",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
        }}
      />
    </div>
  )
}
