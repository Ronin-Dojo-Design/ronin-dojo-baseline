/**
 * Lineage tree layout — pure TS, no React.
 *
 * MVP per SESSION_0175 TASK_03: depth-bucket BFS from the root. Root sits at
 * depth 0; instructors sit at depth -1 (one row above the root); students of
 * the root sit at depth +1 (one row below). Each row is a bucket of nodes
 * sorted by display name.
 *
 * The walk follows INSTRUCTOR_STUDENT edges only:
 *   - `fromNode` is the INSTRUCTOR (one depth less than `toNode`)
 *   - `toNode`   is the STUDENT    (one depth greater than `fromNode`)
 *
 * Depth span is hard-clamped at ±2 for MVP — any nodes farther than that
 * are dropped from the layout (the BFS still visits them but they're not
 * emitted). This matches the Petey-ruled MVP scope: a small, browsable
 * card list, no zoom, no canvas.
 *
 * Author: Cody / SESSION_0175 TASK_03.
 * Refs:
 *   - docs/knowledge/wiki/component-porting/specs/lineage-family-tree-port-spec.md
 *   - apps/web/server/web/lineage/payloads.ts (LineageNodeRow, LineageRelationshipRow)
 */

import type { LineageNodeRow, LineageRelationshipRow } from "~/server/web/lineage/payloads"

/** Maximum absolute depth emitted by `bucketByDepth`. */
export const MAX_LAYOUT_DEPTH = 5

export type LineageRow = {
  depth: number
  nodes: LineageNodeRow[]
}

/**
 * Resolve a stable display name for a node so sorting + comparisons stay
 * deterministic when `user.name` is null.
 */
function nodeDisplayName(node: LineageNodeRow): string {
  return node.user.passport?.displayName ?? node.user.name ?? node.slug ?? node.id
}

/**
 * Bucket a flat node + edge set into rows keyed by depth from the root.
 *
 * Algorithm:
 *  1. Build a quick lookup of nodes by id.
 *  2. BFS from `root.id`, walking INSTRUCTOR_STUDENT edges in either
 *     direction (fromNode→toNode means root is the instructor → student is
 *     depth+1; toNode→fromNode means root is the student → instructor is
 *     depth-1).
 *  3. Record the first-seen depth for every node; later visits at greater
 *     distance are ignored (BFS guarantees the first visit is the shortest).
 *  4. Group nodes by depth and sort each bucket by display name.
 *  5. Return rows sorted by depth ascending (most-senior instructor row
 *     first, students last).
 *
 * Nodes outside ±`MAX_LAYOUT_DEPTH` are dropped from the output.
 */
export function bucketByDepth(
  root: LineageNodeRow,
  nodes: LineageNodeRow[],
  edges: LineageRelationshipRow[],
): LineageRow[] {
  const nodeById = new Map<string, LineageNodeRow>()
  for (const n of nodes) {
    nodeById.set(n.id, n)
  }
  nodeById.set(root.id, root)

  // Adjacency, INSTRUCTOR_STUDENT only. We track both directions to power
  // BFS so we can reach instructors (going "up") and students (going
  // "down") from the root in the same traversal.
  const instructorOf = new Map<string, string[]>() // student → instructors
  const studentsOf = new Map<string, string[]>() // instructor → students
  for (const e of edges) {
    if (e.type !== "INSTRUCTOR_STUDENT") continue
    const studentIns = instructorOf.get(e.toNodeId) ?? []
    studentIns.push(e.fromNodeId)
    instructorOf.set(e.toNodeId, studentIns)

    const insStudents = studentsOf.get(e.fromNodeId) ?? []
    insStudents.push(e.toNodeId)
    studentsOf.set(e.fromNodeId, insStudents)
  }

  // BFS — first-seen depth wins. Queue carries (nodeId, depth).
  const depthById = new Map<string, number>()
  depthById.set(root.id, 0)
  const queue: Array<{ id: string; depth: number }> = [{ id: root.id, depth: 0 }]

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!

    // Instructors of this node sit one depth higher (depth - 1).
    for (const insId of instructorOf.get(id) ?? []) {
      if (depthById.has(insId)) continue
      const insDepth = depth - 1
      depthById.set(insId, insDepth)
      queue.push({ id: insId, depth: insDepth })
    }

    // Students of this node sit one depth lower (depth + 1).
    for (const stuId of studentsOf.get(id) ?? []) {
      if (depthById.has(stuId)) continue
      const stuDepth = depth + 1
      depthById.set(stuId, stuDepth)
      queue.push({ id: stuId, depth: stuDepth })
    }
  }

  // Bucket the visited nodes within the ±MAX_LAYOUT_DEPTH window.
  const bucketed = new Map<number, LineageNodeRow[]>()
  for (const [nodeId, depth] of depthById) {
    if (Math.abs(depth) > MAX_LAYOUT_DEPTH) continue
    const node = nodeById.get(nodeId)
    if (!node) continue
    const bucket = bucketed.get(depth) ?? []
    bucket.push(node)
    bucketed.set(depth, bucket)
  }

  // Sort each bucket by display name and emit rows depth-ascending.
  const rows: LineageRow[] = []
  for (const [depth, bucketNodes] of bucketed) {
    bucketNodes.sort((a, b) => nodeDisplayName(a).localeCompare(nodeDisplayName(b)))
    rows.push({ depth, nodes: bucketNodes })
  }
  rows.sort((a, b) => a.depth - b.depth)
  return rows
}

/**
 * Human label for a depth row, used as the per-row heading.
 */
export function depthLabel(depth: number): string {
  if (depth === 0) return "Root"
  if (depth < 0) return depth === -1 ? "Instructor" : `Generation ${depth}`
  return depth === 1 ? "Student" : `Generation +${depth}`
}
