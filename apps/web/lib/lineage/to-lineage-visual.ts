import type { LineageRelationshipRow, LineageTreeMemberRow } from "~/server/web/lineage/payloads"
import {
  memberAvatarSrc,
  memberBeltColor,
  memberRankLabel,
  memberSchoolLabel,
  nodeDisplayName,
  type SelectedRank,
} from "~/lib/lineage/canvas-model"
import {
  type LineageTrustStatus,
  pickLineageClaimStatus,
  resolveLineageClaimBadgeStatus,
  resolveLineageTrustStatus,
} from "~/lib/lineage/trust-status"

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
}

export type LineageSecondaryLink = {
  fromMemberId: string
  toMemberId: string
  rankLabel: string | null
  colorHex: string | null
}

function adaptSelectedRank(
  selectedRankAward: LineageTreeMemberRow["selectedRankAward"],
): SelectedRank | null {
  if (!selectedRankAward) return null
  return {
    id: selectedRankAward.rank.id,
    name: selectedRankAward.rank.name,
    shortName: selectedRankAward.rank.shortName,
    colorHex: selectedRankAward.rank.colorHex,
    sortOrder: selectedRankAward.rank.sortOrder,
    disciplineName: selectedRankAward.rank.rankSystem?.discipline?.name ?? null,
  }
}

export function toLineageVisual(
  members: LineageTreeMemberRow[],
  options: {
    mainMemberId?: string | null
    relationships?: Pick<LineageRelationshipRow, "fromNodeId" | "toNodeId" | "type">[]
  } = {},
): { nodes: LineageVisualNode[]; secondaryLinks: LineageSecondaryLink[] } {
  const { mainMemberId, relationships = [] } = options

  const nodes: LineageVisualNode[] = members.map(member => {
    const { node } = member
    const selectedRank = adaptSelectedRank(member.selectedRankAward)
    const claimStatus = pickLineageClaimStatus(node.claimRequests ?? [])
    const trustStatus = resolveLineageTrustStatus({
      verificationStatus: node.verificationStatus,
      isVerified: node.isVerified,
      isPlaceholder: node.passport?.user == null,
      claimStatus,
    })
    const claimable =
      resolveLineageClaimBadgeStatus({
        isClaimable: member.isClaimable ?? false,
        claimStatus,
      }) === "claimable"

    return {
      id: member.id,
      nodeId: node.id,
      displayName: nodeDisplayName(node),
      slug: node.slug,
      avatar: memberAvatarSrc(node),
      colorHex: memberBeltColor(node, selectedRank),
      rankLabel: memberRankLabel(node, selectedRank),
      schoolLabel: memberSchoolLabel(node),
      trustStatus,
      isFocal: member.id === mainMemberId,
      claimable,
      primaryVisualParentMemberId: member.primaryVisualParentMemberId,
      visualGroupId: member.visualGroupId,
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

    const fromSelectedRank = adaptSelectedRank(fromMember.selectedRankAward)
    secondaryLinks.push({
      fromMemberId: fromMember.id,
      toMemberId: toMember.id,
      rankLabel: memberRankLabel(fromMember.node, fromSelectedRank),
      colorHex: memberBeltColor(fromMember.node, fromSelectedRank),
    })
  }

  return { nodes, secondaryLinks }
}
