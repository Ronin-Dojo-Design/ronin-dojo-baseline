import type {
  LineageRelationshipRow,
  LineageTreeMemberRow,
  LineageVisualGroupRow,
} from "~/server/web/lineage/payloads"
import {
  memberBeltColor,
  memberRankLabel,
  resolveLineageMemberView,
} from "~/lib/lineage/canvas-model"
import type { LineageTrustStatus } from "~/lib/lineage/trust-status"

export type LineageVisualNode = {
  id: string
  nodeId: string
  displayName: string
  slug: string | null
  avatar: string | null
  colorHex: string | null
  rankLabel: string | null
  schoolLabel: string | null
  trustStatus: LineageTrustStatus
  isFocal: boolean
  claimable: boolean
  primaryVisualParentMemberId: string | null
  visualGroupId: string | null
  /**
   * Promotion provenance (the lineage USP) — when this member was promoted to
   * their shown rank. ISO date string from the selected RankAward, or null when
   * the date is unknown. The timeline orders + dates the tree off this.
   */
  promotionDate: string | null
  /**
   * The cohort label from the member's `LineageVisualGroup` (e.g. "The Dirty
   * Dozen …") when assigned — drives the derived filter chip. Null otherwise.
   */
  visualGroupLabel: string | null
}

export type LineageSecondaryLink = {
  fromMemberId: string
  toMemberId: string
  rankLabel: string | null
  colorHex: string | null
}

export function toLineageVisual(
  members: LineageTreeMemberRow[],
  options: {
    mainMemberId?: string | null
    relationships?: Pick<LineageRelationshipRow, "fromNodeId" | "toNodeId" | "type">[]
    visualGroups?: Pick<LineageVisualGroupRow, "id" | "label">[]
  } = {},
): { nodes: LineageVisualNode[]; secondaryLinks: LineageSecondaryLink[] } {
  const { mainMemberId, relationships = [], visualGroups = [] } = options
  const groupLabelById = new Map(visualGroups.map(group => [group.id, group.label]))

  const nodes: LineageVisualNode[] = members.map(member => {
    const { node } = member
    // Same single resolver every other surface uses — one person, one ruleset.
    const view = resolveLineageMemberView(node, { isClaimable: member.isClaimable })

    return {
      id: member.id,
      nodeId: node.id,
      displayName: view.displayName,
      slug: node.slug,
      avatar: view.avatarSrc,
      colorHex: view.beltColor,
      rankLabel: view.rankLabel,
      schoolLabel: view.schoolLabel,
      trustStatus: view.trustStatus,
      isFocal: member.id === mainMemberId,
      claimable: view.claimBadgeStatus === "claimable",
      primaryVisualParentMemberId: member.primaryVisualParentMemberId,
      visualGroupId: member.visualGroupId,
      promotionDate: member.selectedRankAward?.awardedAt
        ? new Date(member.selectedRankAward.awardedAt).toISOString()
        : null,
      visualGroupLabel: member.visualGroupId
        ? (groupLabelById.get(member.visualGroupId) ?? null)
        : null,
    }
  })

  // Build secondary links from provided relationships.
  // A secondary link = a relationship where both endpoints exist as members in this
  // tree AND the from-member is NOT already the primary visual parent of the to-member.
  const nodeIdToMember = new Map(members.map(m => [m.nodeId, m]))

  const secondaryLinks: LineageSecondaryLink[] = []
  for (const rel of relationships) {
    if (rel.type !== "INSTRUCTOR_STUDENT") continue
    const fromMember = nodeIdToMember.get(rel.fromNodeId)
    const toMember = nodeIdToMember.get(rel.toNodeId)
    if (!fromMember || !toMember) continue
    if (toMember.primaryVisualParentMemberId === fromMember.id) continue

    secondaryLinks.push({
      fromMemberId: fromMember.id,
      toMemberId: toMember.id,
      rankLabel: memberRankLabel(fromMember.node),
      colorHex: memberBeltColor(fromMember.node),
    })
  }

  return { nodes, secondaryLinks }
}
