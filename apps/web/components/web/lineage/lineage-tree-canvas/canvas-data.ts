import { type CanvasMember, sortMembers } from "~/lib/lineage/canvas-model"
import type { LineageRow } from "~/lib/lineage/tree-layout"
import type {
  LineageNodeRow,
  LineageRelationshipRow,
  LineageTreeMemberRow,
} from "~/server/web/lineage/payloads"
import type { DragMemberData, DropTargetData } from "./lineage-tree-canvas-types"

/**
 * Shared, presentation-agnostic data shaping for the lineage canvas.
 *
 * Normalization (v1 members vs. legacy rows+edges), the children/forest index,
 * root resolution, the next drop sort-order, and the dnd-kit payload type guards.
 * Pure — consumed by `use-canvas-model` and the editor/drop sites.
 */

export function normalizeMembers(members: LineageTreeMemberRow[] | undefined): CanvasMember[] {
  return (members ?? []).map(member => ({
    id: member.id,
    nodeId: member.nodeId,
    node: member.node,
    visualSortOrder: member.visualSortOrder,
    primaryVisualParentMemberId: member.primaryVisualParentMemberId,
    visualGroupId: member.visualGroupId,
    isClaimable: member.isClaimable,
    isCollapsedDefault: member.isCollapsedDefault,
    selectedRank: member.selectedRankAward?.rank
      ? {
          id: member.selectedRankAward.rank.id,
          name: member.selectedRankAward.rank.name,
          shortName: member.selectedRankAward.rank.shortName,
          colorHex: member.selectedRankAward.rank.colorHex,
          sortOrder: member.selectedRankAward.rank.sortOrder,
          disciplineName: member.selectedRankAward.rank.rankSystem?.discipline?.name ?? null,
        }
      : null,
  }))
}

export function normalizeLegacyRows({
  rows,
  rootId,
  edges,
}: {
  rows: LineageRow[] | undefined
  rootId: string | undefined
  edges: LineageRelationshipRow[] | undefined
}): CanvasMember[] {
  const orderByNodeId = new Map<string, number>()
  const nodesById = new Map<string, LineageNodeRow>()

  let order = 0
  for (const row of rows ?? []) {
    for (const node of row.nodes) {
      if (!nodesById.has(node.id)) {
        nodesById.set(node.id, node)
        orderByNodeId.set(node.id, order++)
      }
    }
  }

  const parentByNodeId = new Map<string, string>()

  for (const edge of edges ?? []) {
    if (edge.type !== "INSTRUCTOR_STUDENT") continue

    /**
     * Legacy edge contract:
     * - fromNodeId = instructor / parent
     * - toNodeId = student / child
     *
     * First parent wins to match the old D3 wrapper behavior, but this
     * normalization keeps the rule local to legacy fallback rendering only.
     */
    if (!parentByNodeId.has(edge.toNodeId)) {
      parentByNodeId.set(edge.toNodeId, edge.fromNodeId)
    }
  }

  return Array.from(nodesById.values()).map(node => ({
    id: node.id,
    nodeId: node.id,
    node,
    visualSortOrder: orderByNodeId.get(node.id) ?? 0,
    primaryVisualParentMemberId: node.id === rootId ? null : (parentByNodeId.get(node.id) ?? null),
    visualGroupId: null,
    isClaimable: undefined,
    isCollapsedDefault: false,
  }))
}

export function buildChildrenByParentId(members: CanvasMember[]) {
  const memberIds = new Set(members.map(member => member.id))
  const childrenByParentId = new Map<string | null, CanvasMember[]>()

  for (const member of members) {
    const parentId =
      member.primaryVisualParentMemberId &&
      member.primaryVisualParentMemberId !== member.id &&
      memberIds.has(member.primaryVisualParentMemberId)
        ? member.primaryVisualParentMemberId
        : null

    const children = childrenByParentId.get(parentId) ?? []
    children.push(member)
    childrenByParentId.set(parentId, children)
  }

  for (const [parentId, children] of childrenByParentId) {
    children.sort(sortMembers)
    childrenByParentId.set(parentId, children)
  }

  return childrenByParentId
}

export function buildRootMembers({
  members,
  childrenByParentId,
  defaultRootMemberId,
  rootId,
}: {
  members: CanvasMember[]
  childrenByParentId: Map<string | null, CanvasMember[]>
  defaultRootMemberId: string | null | undefined
  rootId: string | undefined
}) {
  const roots = [...(childrenByParentId.get(null) ?? [])]

  /**
   * If all members had valid parents because of malformed/cyclic data, keep
   * the view alive by falling back to the configured root or first member.
   */
  if (roots.length === 0 && members.length > 0) {
    const fallback =
      members.find(member => member.id === defaultRootMemberId) ??
      members.find(member => member.nodeId === rootId) ??
      members[0]

    if (fallback) roots.push(fallback)
  }

  roots.sort((a, b) => {
    if (defaultRootMemberId) {
      if (a.id === defaultRootMemberId) return -1
      if (b.id === defaultRootMemberId) return 1
    }

    if (rootId) {
      if (a.nodeId === rootId) return -1
      if (b.nodeId === rootId) return 1
    }

    return sortMembers(a, b)
  })

  return roots
}

export function nextSortOrder(members: CanvasMember[]): number {
  const maxSort = members.reduce(
    (max, member) => Math.max(max, member.visualSortOrder),
    members.length,
  )
  return maxSort + 1
}

export function isDragMemberData(value: unknown): value is DragMemberData {
  return Boolean(value && typeof value === "object" && "memberId" in value)
}

export function isDropTargetData(value: unknown): value is DropTargetData {
  return Boolean(value && typeof value === "object" && "targetType" in value)
}
