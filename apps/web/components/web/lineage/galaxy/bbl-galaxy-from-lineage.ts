import { memberTopRankAward, memberTrustStatus } from "~/lib/lineage/canvas-model"
import { projectPublicPassport } from "~/server/web/passport/public-projection"
import type { LineageTreePublicResult } from "~/server/web/lineage/payloads"
import type {
  BblGalaxyEdge,
  BblGalaxyGraph,
  BblGalaxyGroup,
  BblGalaxyNode,
  BblGalaxyRole,
} from "./bbl-galaxy-types"

type MemberRow = LineageTreePublicResult["members"][number]

/**
 * Public-safe projection: turn a published BBL lineage tree (already visibility-filtered
 * to PUBLIC + verified by the query layer) into the galaxy graph DTO. Pure + deterministic
 * so it's unit-testable without a DB and produces repeatable layouts (BBL-Galaxy-spec.md).
 *
 * The galaxy never receives private data — it only reads the public payload fields the
 * lineage query already exposes (display name, slug, public avatar, public rank label,
 * visual placement, public group labels).
 *
 * Identity derivation delegates to `projectPublicPassport` (showRanks: true) so the
 * displayName, avatarUrl, and rankLabel fields are computed by the canonical projector
 * rather than manual field chains. (TASK_06 — passport DTO surface migration.)
 */

const ROLE_BY_GENERATION: BblGalaxyRole[] = [
  "ROOT_STAR", // 0 — the anchor
  "LEGEND_STAR", // 1 — Dirty Dozen / legends around the root
  "INSTRUCTOR_PLANET", // 2 — instructors
]

const roleForGeneration = (generation: number): BblGalaxyRole =>
  ROLE_BY_GENERATION[generation] ?? "STUDENT_MOON"

const initialsOf = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "•"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

/** Depth from the visual root via primaryVisualParentMemberId, guarding cycles/orphans. */
const computeGenerations = (members: MemberRow[]): Map<string, number> => {
  const byId = new Map(members.map(member => [member.id, member]))
  const depthCache = new Map<string, number>()

  const depthOf = (member: MemberRow, seen: Set<string>): number => {
    const cached = depthCache.get(member.id)
    if (cached !== undefined) return cached

    const parentId = member.primaryVisualParentMemberId
    const parent = parentId && parentId !== member.id ? byId.get(parentId) : undefined
    const depth = !parent || seen.has(member.id) ? 0 : 1 + depthOf(parent, seen.add(member.id))

    depthCache.set(member.id, depth)
    return depth
  }

  for (const member of members) depthOf(member, new Set())
  return depthCache
}

export const lineageTreeToGalaxyGraph = (result: LineageTreePublicResult): BblGalaxyGraph => {
  const { visualGroups } = result
  // The galaxy is a discipline-scoped surface (this BBL tree = BJJ); scope the timeline
  // year to the member's shown rank IN THIS DISCIPLINE (ADR 0035 §3).
  const disciplineId = result.tree.disciplineId

  // Verified-only galaxy (spec security rule: no disputed/unverified public stars). The
  // query already scopes to PUBLIC; this drops any member whose current rank isn't VERIFIED so
  // `verifiedStatus` is truthful by construction, and edges to dropped nodes fall away below.
  // Trust now sources from the top non-PENDING RankEntry (`memberTrustStatus`, LR 0008) —
  // discipline-scoped to this BJJ tree — not the retired node-level `isVerified` flag.
  const members = result.members.filter(
    member => memberTrustStatus(member.node, disciplineId) === "VERIFIED",
  )
  const generationByMemberId = computeGenerations(members)
  const nodeIdByMemberId = new Map(members.map(member => [member.id, member.nodeId]))

  // Orbit slotting: index each member within its generation band (stable by visualSortOrder).
  const membersByGeneration = new Map<number, MemberRow[]>()
  for (const member of members) {
    const generation = generationByMemberId.get(member.id) ?? 0
    const band = membersByGeneration.get(generation) ?? []
    band.push(member)
    membersByGeneration.set(generation, band)
  }
  for (const band of membersByGeneration.values()) {
    band.sort((a, b) => a.visualSortOrder - b.visualSortOrder)
  }

  const groupLabelById = new Map(
    visualGroups
      .filter(group => group.showPublicLabel !== false)
      .map(group => [group.id, group.label]),
  )

  const nodes: BblGalaxyNode[] = members.map(member => {
    const generation = generationByMemberId.get(member.id) ?? 0
    const band = membersByGeneration.get(generation) ?? [member]
    const orbitIndex = band.findIndex(candidate => candidate.id === member.id)
    const passport = member.node.passport
    const groupId = member.visualGroupId ?? undefined
    // Timeline year = the awardedAt of the member's shown (top awarded) rank (ADR 0035).
    const awardedAt = memberTopRankAward(member.node, disciplineId)?.awardedAt

    // Delegate identity to the canonical public passport projector (showRanks: true for
    // the public lineage galaxy view). `LineageNodeRow.passport` is a structural superset
    // of `PublicPassportRow` after PR #144 spread `publicPassportPayload`, so it is
    // directly compatible as the argument to `projectPublicPassport`.
    const passportDto = passport ? projectPublicPassport(passport, { showRanks: true }) : null
    const displayName = passportDto?.displayName ?? "Unknown lineage holder"
    const photoUrl = passportDto?.avatarUrl ?? undefined

    return {
      id: member.nodeId,
      displayName,
      initials: initialsOf(displayName),
      slug: member.node.slug ?? member.nodeId,
      role: roleForGeneration(generation),
      discipline: "BJJ",
      rankLabel: passportDto?.rankLabel ?? undefined,
      photoUrl,
      verifiedStatus: "VERIFIED",
      generation,
      orbitIndex: orbitIndex < 0 ? 0 : orbitIndex,
      orbitTotal: band.length,
      groupId: groupId && groupLabelById.has(groupId) ? groupId : undefined,
      groupLabel: groupId ? groupLabelById.get(groupId) : undefined,
      timelineYear: awardedAt ? new Date(awardedAt).getUTCFullYear() : undefined,
    }
  })

  // Primary-lineage edges from the visual parent pointer (parent member → this member).
  const edges: BblGalaxyEdge[] = []
  for (const member of members) {
    const parentId = member.primaryVisualParentMemberId
    if (!parentId || parentId === member.id) continue
    const sourceNodeId = nodeIdByMemberId.get(parentId)
    if (!sourceNodeId) continue
    edges.push({
      id: `${sourceNodeId}__${member.nodeId}`,
      sourceId: sourceNodeId,
      targetId: member.nodeId,
      relationshipType: "PRIMARY_LINEAGE",
      verifiedStatus: "VERIFIED",
      groupId: member.visualGroupId ?? undefined,
    })
  }

  const groups: BblGalaxyGroup[] = visualGroups
    .filter(group => group.showPublicLabel !== false)
    .map(group => ({
      id: group.id,
      label: group.label,
      kind: "PROMOTION_COHORT",
      generation: 0,
      color: "#d7a74c",
    }))

  return { nodes, edges, groups }
}
