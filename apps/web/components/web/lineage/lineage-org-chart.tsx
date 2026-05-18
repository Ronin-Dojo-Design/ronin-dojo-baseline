"use client"

import { OrgChart } from "d3-org-chart"
import { useEffect, useRef } from "react"
import type { LineageRow } from "~/lib/lineage/tree-layout"
import type { LineageNodeRow, LineageRelationshipRow } from "~/server/web/lineage/payloads"

/**
 * d3-org-chart wrapper for the lineage family tree.
 *
 * Renders a proper hierarchical org chart with SVG connectors, zoom/pan,
 * collapse/expand. Replaces the flat depth-bucketed card list from MVP.
 *
 * Author: Cody / SESSION_0176.
 */

type LineageOrgChartProps = {
  rows: LineageRow[]
  rootId: string
  edges: LineageRelationshipRow[]
  onSelect: (nodeId: string) => void
}

type ChartNode = {
  id: string
  parentId: string | ""
  name: string
  rank: string
  image: string | null
  isVerified: boolean
  school: string
}

/** Build parent-child data from edges. Instructor is parent, student is child. */
function buildChartData(
  rows: LineageRow[],
  rootId: string,
  edges: LineageRelationshipRow[],
): ChartNode[] {
  // Collect all nodes
  const allNodes = new Map<string, LineageNodeRow>()
  for (const row of rows) {
    for (const node of row.nodes) {
      allNodes.set(node.id, node)
    }
  }

  // Build instructor→student map from edges (fromNode=instructor=parent, toNode=student=child)
  // For d3-org-chart: each node needs exactly one parentId.
  // A node's parent is its instructor (the fromNode side of an INSTRUCTOR_STUDENT edge).
  const parentOf = new Map<string, string>()
  for (const edge of edges) {
    if (edge.type !== "INSTRUCTOR_STUDENT") continue
    // toNode (student) has fromNode (instructor) as parent
    // Only set if both nodes exist in our visible set
    if (allNodes.has(edge.fromNodeId) && allNodes.has(edge.toNodeId)) {
      // Don't overwrite — first edge wins (BFS already ordered correctly)
      if (!parentOf.has(edge.toNodeId)) {
        parentOf.set(edge.toNodeId, edge.fromNodeId)
      }
    }
  }

  // Find the chart root: the node with no parent (topmost instructor)
  const nodesWithParent = new Set(parentOf.keys())
  const chartRootCandidates = [...allNodes.keys()].filter(id => !nodesWithParent.has(id))
  // If multiple roots (e.g. non-BJJ instructors without their own lineage above),
  // pick the one that's an ancestor of the most nodes (likely Carlos Gracie Sr).
  // Simple heuristic: count descendants.
  const childrenOf = new Map<string, string[]>()
  for (const [childId, pid] of parentOf) {
    const kids = childrenOf.get(pid) ?? []
    kids.push(childId)
    childrenOf.set(pid, kids)
  }

  function countDescendants(id: string): number {
    const kids = childrenOf.get(id) ?? []
    return kids.length + kids.reduce((sum, k) => sum + countDescendants(k), 0)
  }

  let chartRootId = chartRootCandidates[0] ?? rootId
  let maxDesc = 0
  for (const cid of chartRootCandidates) {
    const desc = countDescendants(cid)
    if (desc > maxDesc) {
      maxDesc = desc
      chartRootId = cid
    }
  }

  // d3-org-chart requires exactly ONE root node. Only include nodes
  // reachable from the main chart root (the one with the most descendants,
  // i.e. Carlos Gracie Sr for the BJJ tree). Non-BJJ instructors that form
  // separate mini-trees are excluded from the chart for now.
  const reachable = new Set<string>()
  function markReachable(id: string) {
    reachable.add(id)
    for (const kid of childrenOf.get(id) ?? []) {
      if (!reachable.has(kid)) markReachable(kid)
    }
  }
  markReachable(chartRootId)

  const result: ChartNode[] = []
  for (const [nodeId, node] of allNodes) {
    if (!reachable.has(nodeId)) continue
    const displayName = node.user.passport?.displayName ?? node.user.name ?? node.slug ?? "Unknown"
    const rankAward = node.user.rankAwards[0]
    const rank = rankAward?.rank?.name ?? ""
    const school = node.user.memberships[0]?.organization?.name ?? ""

    result.push({
      id: nodeId,
      parentId: parentOf.get(nodeId) ?? "",
      name: displayName,
      rank,
      image: node.user.image,
      isVerified: node.isVerified,
      school,
    })
  }

  return result
}

function nodeContent(d: { data: ChartNode }): string {
  const node = d.data
  const avatarHtml = node.image
    ? `<img src="${node.image}" class="w-12 h-12 rounded-full object-cover border-2 border-background" alt="${node.name}" />`
    : `<div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground border-2 border-background">${node.name.slice(0, 2).toUpperCase()}</div>`

  const verifiedBadge = node.isVerified
    ? `<span class="inline-flex items-center gap-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded-full">✓ Verified</span>`
    : ""

  return `
    <div class="flex flex-col items-center gap-1 p-3 cursor-pointer hover:bg-accent/50 rounded-lg transition-colors" style="width:160px">
      ${avatarHtml}
      <span class="text-sm font-medium text-center leading-tight mt-1">${node.name}</span>
      ${node.rank ? `<span class="text-xs text-muted-foreground">${node.rank}</span>` : ""}
      ${node.school ? `<span class="text-xs text-muted-foreground text-center">${node.school}</span>` : ""}
      ${verifiedBadge}
    </div>
  `
}

export function LineageOrgChart({ rows, rootId, edges, onSelect }: LineageOrgChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<OrgChart<ChartNode> | null>(null)

  const data = buildChartData(rows, rootId, edges)

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return

    const chart = new OrgChart<ChartNode>()

    chart
      .container(containerRef.current as unknown as string)
      .data(data)
      .nodeWidth(() => 180)
      .nodeHeight(() => 140)
      .compactMarginBetween(() => 30)
      .childrenMargin(() => 60)
      .siblingsMargin(() => 30)
      .nodeContent((d: unknown) => nodeContent(d as { data: ChartNode }))
      .onNodeClick((d: unknown) => {
        onSelect((d as { data: ChartNode }).data.id)
      })
      .render()

    chartRef.current = chart

    // Fit to container
    chart.fit()

    return () => {
      // Cleanup: remove SVG content
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }
  }, [data, onSelect])

  if (data.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        This lineage has no recorded practitioners yet.
      </p>
    )
  }

  return (
    <div
      ref={containerRef}
      className="w-full min-h-100 h-[60vh] rounded-lg border bg-background overflow-hidden"
    />
  )
}
