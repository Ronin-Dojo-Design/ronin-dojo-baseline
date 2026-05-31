import type { LineageNodeRow, LineageVisualGroupRow } from "~/server/web/lineage/payloads"

/**
 * Shared canvas model for the lineage tree.
 *
 * Pure, presentation-agnostic types + helpers consumed by both the vertical
 * `LineageTreeCanvas` (tree layout) and the `LineageCompactChildList` (board
 * layout). Lives outside the canvas component so the board list can recurse
 * without an import cycle back into the canvas.
 *
 * Extracted from `lineage-tree-canvas.tsx` at SESSION_0312 (Phase 3a).
 */

export type SelectedRank = {
  id: string
  name: string
  shortName: string | null
  colorHex: string | null
  disciplineName?: string | null
}

export type CanvasMember = {
  id: string
  nodeId: string
  node: LineageNodeRow
  visualSortOrder: number
  primaryVisualParentMemberId: string | null
  visualGroupId: string | null
  isClaimable?: boolean
  selectedRank?: SelectedRank | null
}

export type ChildGroup = {
  id: string
  group: LineageVisualGroupRow | null
  members: CanvasMember[]
}

export function nodeDisplayName(node: LineageNodeRow): string {
  return node.user.passport?.displayName ?? node.user.name ?? node.slug ?? node.id
}

export function sortMembers(a: CanvasMember, b: CanvasMember): number {
  if (a.visualSortOrder !== b.visualSortOrder) {
    return a.visualSortOrder - b.visualSortOrder
  }

  return nodeDisplayName(a.node).localeCompare(nodeDisplayName(b.node))
}

export function buildChildGroups({
  children,
  visualGroupById,
}: {
  children: CanvasMember[]
  visualGroupById: Map<string, LineageVisualGroupRow>
}): ChildGroup[] {
  const groupsByKey = new Map<string, ChildGroup>()

  for (const child of children) {
    const group = child.visualGroupId ? (visualGroupById.get(child.visualGroupId) ?? null) : null
    const key = group?.id ?? `ungrouped-${child.primaryVisualParentMemberId ?? "root"}`

    const existing = groupsByKey.get(key) ?? {
      id: key,
      group,
      members: [],
    }

    existing.members.push(child)
    groupsByKey.set(key, existing)
  }

  const groups = Array.from(groupsByKey.values())

  for (const group of groups) {
    group.members.sort(sortMembers)
  }

  groups.sort((a, b) => {
    const aSort = a.group?.sortOrder ?? Number.MAX_SAFE_INTEGER
    const bSort = b.group?.sortOrder ?? Number.MAX_SAFE_INTEGER

    if (aSort !== bSort) return aSort - bSort

    const aLabel = a.group?.label ?? ""
    const bLabel = b.group?.label ?? ""

    return aLabel.localeCompare(bLabel)
  })

  return groups
}

/**
 * Display initials for a name string — mirrors the avatar fallback used by
 * `LineageNodeCard`, kept here so compact rows don't reach into the card.
 */
export function memberInitials(name: string | null | undefined): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
}
