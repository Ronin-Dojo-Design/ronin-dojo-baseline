import { nameInitials, passportDisplayName } from "~/lib/identity/passport-display"
import {
  type LineageClaimBadgeStatus,
  type LineageTrustStatus,
  pickLineageClaimStatus,
  resolveLineageClaimBadgeStatus,
  resolveLineageTrustStatus,
} from "~/lib/lineage/trust-status"
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
 * THE member's *shown* rank = their highest **awarded** belt (`rankAwardsEarned[0]`,
 * ordered by Rank.sortOrder desc; `take: 1` in the payload). The single source for
 * "what belt are you" across every surface (card, rows, mobile, timeline, honor strip,
 * canvas). Display = awarded truth, full stop (ADR 0035) — the deprecated
 * `selectedRankAward`/`selectedRank` pointer (stale WP-import data) must NEVER drive it.
 * Null → no rank.
 */
export function memberTopRank(node: LineageNodeRow) {
  return node.passport?.rankAwardsEarned?.[0]?.rank ?? null
}

/**
 * Belt color hex for the member's shown rank. Null → no swatch. Verification is a
 * SEPARATE axis (`node.isVerified`) and never filters which belt shows.
 *
 * @param selectedRank DEPRECATED for display (SESSION_0430) — kept only for caller
 * signature stability; the displayed belt is awarded truth (`memberTopRank`).
 */
export function memberBeltColor(
  node: LineageNodeRow,
  _selectedRank?: SelectedRank | null,
): string | null {
  return memberTopRank(node)?.colorHex ?? null
}

/**
 * Rank label ("Black Belt · Brazilian Jiu-Jitsu") for the member's shown rank.
 * Null → no rank. See `memberTopRank` (ADR 0035 awarded-truth).
 */
export function memberRankLabel(
  node: LineageNodeRow,
  _selectedRank?: SelectedRank | null,
): string | null {
  const rank = memberTopRank(node)
  if (!rank) return null

  return `${rank.name}${
    rank.rankSystem?.discipline?.name ? ` · ${rank.rankSystem.discipline.name}` : ""
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

/**
 * The member presentation read-model — avatar, belt (highest awarded), school, the
 * single verification status, and the claim affordance — all in one shape.
 */
export type LineageMemberView = {
  displayName: string
  avatarSrc: string | null
  beltColor: string | null
  rankLabel: string | null
  schoolLabel: string | null
  /** The ONE verification axis: `node.isVerified` (ADR 0035). NOT per-award. */
  trustStatus: LineageTrustStatus
  /** Claim affordance — surfaced ONLY on the drawer + directory, never on the tree. */
  claimBadgeStatus: LineageClaimBadgeStatus | null
}

/**
 * THE single source of truth for how one lineage member renders. Every surface —
 * board card, compact rows, mobile list, View A timeline, drawer — derives its
 * presentation from this one function, so a person looks identical everywhere and
 * there is exactly one place to change the rules.
 *
 * Verification is the single `node.isVerified` axis (ADR 0035 §5; `RankAward.
 * verificationStatus` is vestigial and never drives display). Belt = highest awarded
 * rank by sortOrder. `isClaimable` is the per-viewer claim affordance from the tree
 * payload — consumed only by surfaces that show it (drawer/directory).
 */
export function resolveLineageMemberView(
  node: LineageNodeRow,
  opts: { isClaimable?: boolean | null } = {},
): LineageMemberView {
  const claimStatus = pickLineageClaimStatus(node.claimRequests)
  return {
    displayName: nodeDisplayName(node),
    avatarSrc: memberAvatarSrc(node),
    beltColor: memberBeltColor(node),
    rankLabel: memberRankLabel(node),
    schoolLabel: memberSchoolLabel(node),
    trustStatus: resolveLineageTrustStatus({
      verificationStatus: node.verificationStatus,
      isVerified: node.isVerified,
      isPlaceholder: node.passport?.user == null,
      claimStatus,
    }),
    claimBadgeStatus: resolveLineageClaimBadgeStatus({
      isClaimable: opts.isClaimable ?? false,
      claimStatus,
    }),
  }
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
 * Display initials for a member's name (avatar fallback). Thin alias over the
 * canonical `nameInitials` identity seam so lineage callers keep one import.
 */
export const memberInitials = nameInitials
