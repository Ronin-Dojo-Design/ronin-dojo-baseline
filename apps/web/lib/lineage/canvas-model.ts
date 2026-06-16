import { passportDisplayName } from "~/lib/identity/passport-display"
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
  sortOrder?: number | null
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
  isCollapsedDefault: boolean
  selectedRank?: SelectedRank | null
}

export type ChildGroup = {
  id: string
  group: LineageVisualGroupRow | null
  members: CanvasMember[]
}

export function nodeDisplayName(node: LineageNodeRow): string {
  return passportDisplayName(node.passport) ?? node.slug ?? node.id
}

/**
 * Public avatar source for a member — passport avatar first, then the attached
 * account image (the role-agnostic Passport-avatar rule, SESSION_0326). Null →
 * render the `memberInitials` fallback. Shared so every member surface resolves
 * it identically instead of re-inlining the `?? image` fallback.
 */
export function memberAvatarSrc(node: LineageNodeRow): string | null {
  return node.passport?.avatarUrl ?? node.passport?.user?.image ?? null
}

/**
 * Belt color hex for the member's *shown* rank — the tree-member's selected
 * rank award wins, else the person's latest overall award. Null → no swatch.
 */
export function memberBeltColor(
  node: LineageNodeRow,
  selectedRank?: SelectedRank | null,
): string | null {
  return selectedRank?.colorHex ?? node.passport?.rankAwardsEarned?.[0]?.rank.colorHex ?? null
}

/**
 * Rank label ("Black Belt · Brazilian Jiu-Jitsu") for the member's *shown*
 * rank — selected rank award first, else latest overall award. Null → no rank.
 */
export function memberRankLabel(
  node: LineageNodeRow,
  selectedRank?: SelectedRank | null,
): string | null {
  if (selectedRank) {
    return `${selectedRank.name}${
      selectedRank.disciplineName ? ` · ${selectedRank.disciplineName}` : ""
    }`
  }

  const latestRankAward = node.passport?.rankAwardsEarned?.[0]
  if (!latestRankAward?.rank) return null

  return `${latestRankAward.rank.name}${
    latestRankAward.rank.rankSystem?.discipline?.name
      ? ` · ${latestRankAward.rank.rankSystem.discipline.name}`
      : ""
  }`
}

/**
 * Current-school label for the member. Reads the canonical **Affiliation** axis first
 * (linked org name, else free-text school), falling back to the latest Baseline Membership
 * org during the Passport-consolidation transition (D-023). Null → unaffiliated / not shown.
 * Affiliation is a separate display axis from promotion lineage (passport-and-shells.md).
 */
export function memberSchoolLabel(node: LineageNodeRow): string | null {
  const affiliation = node.passport?.affiliations?.[0]
  return (
    affiliation?.organization?.name ??
    affiliation?.schoolName ??
    node.passport?.user?.memberships?.[0]?.organization?.name ??
    null
  )
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
 * Total descendant count per member (whole subtree below them, excluding self),
 * computed once from the children map. Powers the board's count badges so a
 * collapsed node shows how many people are hidden under it. Cycle-safe (a
 * `seen` set on each path) so malformed/cyclic display data can't infinite-loop;
 * results are memoized for an O(n) forest.
 */
export function buildDescendantCounts(
  childrenByParentId: Map<string | null, CanvasMember[]>,
): Map<string, number> {
  const counts = new Map<string, number>()

  function count(memberId: string, seen: Set<string>): number {
    if (seen.has(memberId)) return 0
    const cached = counts.get(memberId)
    if (cached !== undefined) return cached

    const nextSeen = new Set(seen).add(memberId)
    const children = childrenByParentId.get(memberId) ?? []
    let total = children.length
    for (const child of children) total += count(child.id, nextSeen)

    counts.set(memberId, total)
    return total
  }

  for (const children of childrenByParentId.values()) {
    for (const child of children) count(child.id, new Set())
  }

  return counts
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
