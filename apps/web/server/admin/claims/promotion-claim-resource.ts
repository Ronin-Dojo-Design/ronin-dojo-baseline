import type { LineageResource } from "~/server/orpc/resource-permissions"
import { buildLineageParentLookup } from "~/server/web/lineage/editor-graph"
import type { db as appDb } from "~/services/db"

/**
 * Derive the lineage resource(s) a RANK_PROMOTION claim is reviewed against
 * (petey-plan-0477 Slice V5; ADR 0035 Amendment 1, B1).
 *
 * A promotion claim carries NO tree/node context — submit records only the
 * member's own Passport + the asserted belt. The review-time scope is therefore
 * derived from the member: `LineageNode.passportId` is `@unique`, so the
 * Passport resolves to at most one node, and each of that node's
 * `LineageTreeMember` rows yields one `LineageResource` (a node can sit in more
 * than one tree; a `claim.review` grant on ANY of them authorizes).
 *
 * `branchRootMemberIds` is pre-resolved per `resource-permissions.ts`'s
 * contract: the member's own id plus its ancestor chain up the visual-parent
 * graph — the same upward walk `editor-graph.isLineageMemberInBranch` performs,
 * inverted into a set so the pure matcher stays DB-free. A `BRANCH_EDITOR`
 * grant rooted at any id in that set covers the member.
 *
 * Returns `null` when the member has no node or no tree membership — nothing to
 * scope an instructor grant against (the caller falls back to admin-only).
 */

type AppDb = typeof appDb

export async function resolvePromotionClaimResources(
  db: AppDb,
  passportId: string,
): Promise<LineageResource[] | null> {
  const node = await db.lineageNode.findUnique({
    where: { passportId },
    select: { id: true, treeMembers: { select: { id: true, treeId: true } } },
  })
  if (!node || node.treeMembers.length === 0) {
    return null
  }

  const resources: LineageResource[] = []
  for (const membership of node.treeMembers) {
    const members = await db.lineageTreeMember.findMany({
      where: { treeId: membership.treeId },
      select: { id: true, primaryVisualParentMemberId: true },
    })
    const parentById = buildLineageParentLookup(members)

    // The member itself roots the smallest covering branch; every ancestor roots
    // a larger one. Cycle-guarded like `isLineageMemberInBranch`.
    const branchRootMemberIds: string[] = [membership.id]
    const visited = new Set<string>([membership.id])
    let cursor = parentById.get(membership.id) ?? null
    while (cursor && !visited.has(cursor)) {
      branchRootMemberIds.push(cursor)
      visited.add(cursor)
      cursor = parentById.get(cursor) ?? null
    }

    resources.push({
      treeId: membership.treeId,
      nodeId: node.id,
      memberId: membership.id,
      branchRootMemberIds,
    })
  }

  return resources
}
