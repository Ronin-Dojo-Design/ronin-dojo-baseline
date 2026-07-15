import type { RankEntryStatus } from "~/.generated/prisma/client"
import type { BeltRenderData } from "~/components/common/belt-swatch"
import { nameInitials, passportDisplayName } from "~/lib/identity/passport-display"
import {
  type LineageClaimBadgeStatus,
  type LineageTrustStatus,
  type TrustRankAward,
  pickLineageClaimStatus,
  resolveLineageClaimBadgeStatus,
  resolveLineageTrustStatus,
  resolveMemberTrustStatus,
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

export type CanvasMember = {
  id: string
  nodeId: string
  node: LineageNodeRow
  visualSortOrder: number
  primaryVisualParentMemberId: string | null
  visualGroupId: string | null
  isClaimable?: boolean
  isCollapsedDefault: boolean
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
 * THE member's *shown* rank award. `rankAwardsEarned` is pre-ordered by Rank.sortOrder
 * desc, so `[0]` is the member's highest awarded belt overall.
 *
 * **Discipline-scoped (ADR 0035 §3).** "Highest by sortOrder" is meaningless ACROSS rank
 * systems (sortOrder is per-system), so a discipline-scoped surface — the lineage
 * tree/board/cards, which carry the tree's `disciplineId` — MUST pass that `disciplineId`
 * to get the highest belt *within that discipline* (e.g. a BJJ tree shows the BJJ rank, not
 * a TKD dan that happens to sort higher). The multi-discipline surfaces (drawer, directory)
 * pass nothing → highest awarded overall. The single awarded-truth source every surface
 * reads — both for "what belt are you" (`.rank`) and "when were you promoted" (`.awardedAt`).
 * Null → no (matching) award.
 */
export function memberTopRankAward(node: LineageNodeRow, disciplineId?: string | null) {
  const awards = node.passport?.rankAwardsEarned ?? []
  if (!disciplineId) return awards[0] ?? null
  // Pre-sorted by sortOrder desc → the first award in this discipline is its top belt.
  return awards.find(award => award.rank.rankSystem?.discipline?.id === disciplineId) ?? null
}

/**
 * THE member's *shown* rank = the rank of their top awarded belt (discipline-scoped when
 * a `disciplineId` is given — see `memberTopRankAward`). The single source for "what belt
 * are you" across every surface (card, rows, mobile, timeline, honor strip, canvas). Null
 * → no rank.
 */
export function memberTopRank(node: LineageNodeRow, disciplineId?: string | null) {
  return memberTopRankAward(node, disciplineId)?.rank ?? null
}

/**
 * THE member's *trust* status = the top non-PENDING `RankEntry.status` (belt-trust axis, LR 0008),
 * discipline-scoped exactly like `memberTopRank` (the tree/board/cards pass the tree's discipline;
 * the drawer/directory omit it for highest-overall). When the member is BELTLESS (no non-PENDING
 * entry), it falls back to the node's membership verification so a documented-but-beltless verified
 * lineage member still reads verified (WL-P2-46) — the RankEntry still WINS whenever it exists. This
 * is the ONE place "how verified is this member" is decided — every surface reads it. Null → no rank
 * AND no node verification. Thin node wrapper over `resolveMemberTrustStatus` (row + profile nodes).
 */
export function memberTrustStatus(
  node: {
    passport?: { rankAwardsEarned?: readonly TrustRankAward[] } | null
    isVerified?: boolean | null
    verificationStatus?: string | null
  },
  disciplineId?: string | null,
): RankEntryStatus | null {
  return resolveMemberTrustStatus(node.passport?.rankAwardsEarned ?? [], node, disciplineId)
}

/**
 * Belt color hex for the member's shown rank. Null → no swatch. Verification is a SEPARATE
 * axis (`memberTrustStatus`, the top non-PENDING RankEntry) and never filters which belt shows.
 */
export function memberBeltColor(node: LineageNodeRow, disciplineId?: string | null): string | null {
  return memberTopRank(node, disciplineId)?.colorHex ?? null
}

/**
 * The full belt render-model for the member's shown rank — the `{ colorHex,
 * secondaryColorHex, degree, beltFamily }` the refined `BeltSwatch` `belt` variant
 * needs (SESSION_0539). Always returns a shape (all-null when no rank) so surfaces can
 * spread it unconditionally; `BeltSwatch` degrades gracefully on null fields.
 */
export function memberBeltRender(
  node: LineageNodeRow,
  disciplineId?: string | null,
): BeltRenderData {
  const rank = memberTopRank(node, disciplineId)
  return {
    colorHex: rank?.colorHex ?? null,
    secondaryColorHex: rank?.secondaryColorHex ?? null,
    degree: rank?.degree ?? null,
    beltFamily: rank?.beltFamily ?? null,
  }
}

/**
 * Rank label ("Black Belt · Brazilian Jiu-Jitsu") for the member's shown rank.
 * Null → no rank. See `memberTopRank` (ADR 0035 awarded-truth, discipline-scoped).
 */
export function memberRankLabel(node: LineageNodeRow, disciplineId?: string | null): string | null {
  const rank = memberTopRank(node, disciplineId)
  if (!rank) return null

  return `${rank.name}${
    rank.rankSystem?.discipline?.name ? ` · ${rank.rankSystem.discipline.name}` : ""
  }`
}

/**
 * Current-school identity (name + logo) for the member — the SAME affiliation-first
 * resolution as `memberSchoolLabel` (linked org, else free-text school, else the latest
 * Baseline Membership org, D-023), returning the name AND logo from ONE org so a surface
 * never pairs school A's label with school B's logo (SESSION_0496). A free-text school
 * has no org → no logo. Null → unaffiliated / not shown.
 */
export function memberSchool(
  node: LineageNodeRow,
): { name: string; logoUrl: string | null } | null {
  const affiliation = node.passport?.affiliations?.[0]
  if (affiliation?.organization) {
    return { name: affiliation.organization.name, logoUrl: affiliation.organization.logoUrl }
  }
  // `!= null` (not truthiness) preserves the original `??` fallback semantics exactly.
  if (affiliation?.schoolName != null) {
    return { name: affiliation.schoolName, logoUrl: null }
  }
  const membershipOrg = node.passport?.user?.memberships?.[0]?.organization
  return membershipOrg ? { name: membershipOrg.name, logoUrl: membershipOrg.logoUrl } : null
}

/**
 * Current-school label for the member. Reads the canonical **Affiliation** axis first
 * (linked org name, else free-text school), falling back to the latest Baseline Membership
 * org during the Passport-consolidation transition (D-023). Null → unaffiliated / not shown.
 * Affiliation is a separate display axis from promotion lineage (passport-and-shells.md).
 * Thin view over `memberSchool` so name + logo share ONE resolution predicate.
 */
export function memberSchoolLabel(node: LineageNodeRow): string | null {
  return memberSchool(node)?.name ?? null
}

/**
 * The member presentation read-model — avatar, belt (highest awarded), school, the
 * single verification status, and the claim affordance — all in one shape.
 */
export type LineageMemberView = {
  displayName: string
  avatarSrc: string | null
  beltColor: string | null
  /** The refined-belt render-model (SESSION_0539) — `beltColor` is `belt.colorHex`
   * kept flat for the gradient/glow math consumers. */
  belt: BeltRenderData
  rankLabel: string | null
  schoolLabel: string | null
  /** The ONE trust axis: the top non-PENDING `RankEntry.status` (`memberTrustStatus`, LR 0008). */
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
 * Trust is the single `memberTrustStatus` axis — the top non-PENDING `RankEntry.status`
 * (LR 0008; the node-level `isVerified` / `verificationStatus` axis is retired from display).
 * Belt = highest awarded rank, scoped to `opts.disciplineId` on discipline-scoped surfaces (the
 * tree/board/cards pass the tree's discipline; drawer/directory omit it for multi-discipline
 * display). `isClaimable` is the per-viewer claim affordance — consumed only by surfaces that show it.
 */
export function resolveLineageMemberView(
  node: LineageNodeRow,
  opts: { isClaimable?: boolean | null; disciplineId?: string | null } = {},
): LineageMemberView {
  const claimStatus = pickLineageClaimStatus(node.claimRequests)
  return {
    displayName: nodeDisplayName(node),
    avatarSrc: memberAvatarSrc(node),
    beltColor: memberBeltColor(node, opts.disciplineId),
    belt: memberBeltRender(node, opts.disciplineId),
    rankLabel: memberRankLabel(node, opts.disciplineId),
    schoolLabel: memberSchoolLabel(node),
    trustStatus: resolveLineageTrustStatus({
      rankStatus: memberTrustStatus(node, opts.disciplineId),
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
