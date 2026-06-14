import type { Datum } from "~/lib/lineage/family-chart/types/data"
import type { LineageVisualNode } from "~/lib/lineage/to-lineage-visual"

export function toFamilyChartData(nodes: LineageVisualNode[]): Datum[] {
  const datums: Datum[] = nodes.map(
    (node): Datum => ({
      id: node.id,
      data: {
        gender: "M" as const,
        displayName: node.displayName,
        slug: node.slug,
        avatar: node.avatar,
        colorHex: node.colorHex,
        rankLabel: node.rankLabel,
        schoolLabel: node.schoolLabel,
        trustStatus: node.trustStatus,
        isFocal: node.isFocal,
        claimable: node.claimable,
      },
      rels: {
        parents: node.primaryVisualParentMemberId ? [node.primaryVisualParentMemberId] : [],
        spouses: [],
        children: [],
      },
    }),
  )

  // formatData() does NOT auto-derive rels.children from rels.parents —
  // build the inverse mapping in a second pass (SESSION_0381 grounding fix).
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
