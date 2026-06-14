"use client"

/**
 * DEV-ONLY smoke component — SESSION_0381 TASK_03 (slice 0379-1).
 *
 * Proves the vendored donatso/family-chart engine compiles and renders the
 * materialized public payload. Minimal mapping: no belt cards, no drawer,
 * no secondary overlay. Those come in slices 0379-2/0379-3.
 *
 * Remove or replace with the real View A island in slice 0379-3.
 */

import { useEffect, useRef } from "react"
import { createChart } from "~/lib/lineage/family-chart/index"
import type { Datum } from "~/lib/lineage/family-chart/types/data"
import type { LineageTreeMemberRow } from "~/server/web/lineage/payloads"

interface Props {
  members: LineageTreeMemberRow[]
  defaultRootMemberId?: string | null
}

/** Minimal mapping: member → Datum (smoke-only; full adapter is slice 0379-2). */
function membersToData(members: LineageTreeMemberRow[]): Datum[] {
  const datums: Datum[] = members.map((m): Datum => ({
    id: m.id,
    data: {
      gender: "M" as const,
      label:
        m.node.user?.passport?.displayName ??
        m.node.user?.name ??
        "Unknown",
    },
    rels: {
      parents: m.primaryVisualParentMemberId ? [m.primaryVisualParentMemberId] : [],
      spouses: [],
      children: [],
    },
  }))

  // formatData() doesn't derive children from parents — do it here.
  const byId = new Map(datums.map(d => [d.id, d]))
  for (const d of datums) {
    for (const parentId of d.rels.parents) {
      const parent = byId.get(parentId)
      if (parent && !parent.rels.children.includes(d.id)) {
        parent.rels.children.push(d.id)
      }
    }
  }
  return datums
}

export function LineageFamilyChartSmoke({ members, defaultRootMemberId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cont = containerRef.current
    if (!cont) return

    const data = membersToData(members)
    if (data.length === 0) return

    const main_id = defaultRootMemberId ?? data[0]!.id

    const chart = createChart(cont, data)

    chart.setCardSvg()
      .setCardDisplay([(d: { data: { label?: string } }) => d.data.label ?? ""])

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
        🔬 DEV SMOKE — family-chart engine (slice 0379-1) · {members.length} members · remove in 0379-3
      </div>
      <div
        ref={containerRef}
        id="FamilyChartSmoke"
        style={{ width: "100%", height: 600, position: "relative", border: "1px solid #e2e8f0", borderRadius: 8 }}
      />
    </div>
  )
}
