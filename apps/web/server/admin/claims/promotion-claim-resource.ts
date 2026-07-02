import type { LineageResource } from "~/server/orpc/resource-permissions"
import { buildLineageParentLookup } from "~/server/web/lineage/editor-graph"
import type { db as appDb } from "~/services/db"

/**
 * Derive the lineage resource(s) a RANK_PROMOTION claim is reviewed against, FOR A
 * SPECIFIC REVIEWER (petey-plan-0477 Slice V5; ADR 0035 Amendment 1, B1;
 * grants-first inversion SESSION_0492).
 *
 * A promotion claim carries NO tree/node context — submit records only the
 * member's own Passport + the asserted belt. The review-time scope is therefore
 * derived from the member: `LineageNode.passportId` is `@unique`, so the Passport
 * resolves to at most one node, and each of that node's `LineageTreeMember` rows
 * lives in one tree.
 *
 * **Grants-first (authz-equivalent):** the caller then runs `canForResource(db,
 * reviewer, "claim.review", resource)` per returned resource and authorizes if ANY
 * passes. `canForResource` denies a tree on which the reviewer holds no active
 * `claim.review` grant, so a resource for such a tree can never authorize — we skip
 * it. And the expensive whole-tree ancestor walk that builds `branchRootMemberIds`
 * ONLY affects the `BRANCH_EDITOR` match, so we walk ancestors ONLY when the
 * reviewer actually holds a `BRANCH_EDITOR` grant on that tree. For every other
 * grant kind (`TREE_ADMIN` / `TREE_EDITOR` tree-wide; `NODE_EDITOR` on nodeId/
 * memberId — both always set) `branchRootMemberIds` is unused, so an empty set is
 * authz-identical. The resulting resource SET authorizes exactly the same reviewer
 * as loading every tree member did, at a fraction of the reads.
 *
 * `branchRootMemberIds` (when populated) is the member's own id plus its ancestor
 * chain up the visual-parent graph — the same upward walk
 * `editor-graph.isLineageMemberInBranch` performs, inverted into a set so the pure
 * matcher stays DB-free. A `BRANCH_EDITOR` grant rooted at any id in that set
 * covers the member.
 *
 * Returns `null` when the member has no node, no tree membership, or the reviewer
 * holds no `claim.review` grant on any of the member's trees — nothing to scope an
 * instructor grant against (the caller falls back to admin-only).
 */

type AppDb = typeof appDb

export async function resolvePromotionClaimResources(
  db: AppDb,
  passportId: string,
  reviewerUserId: string,
): Promise<LineageResource[] | null> {
  const node = await db.lineageNode.findUnique({
    where: { passportId },
    select: { id: true, treeMembers: { select: { id: true, treeId: true } } },
  })
  if (!node || node.treeMembers.length === 0) {
    return null
  }

  const treeIds = node.treeMembers.map(m => m.treeId)

  // Grants-first: the reviewer's active grants on the member's trees, up front. A
  // tree with no grant can never authorize this reviewer, so it is dropped below —
  // and only a BRANCH_EDITOR grant forces the ancestor walk.
  const grants = await db.lineageTreeAccess.findMany({
    where: { treeId: { in: treeIds }, userId: reviewerUserId, revokedAt: null },
    select: { treeId: true, role: true },
  })
  if (grants.length === 0) {
    return null
  }

  const grantedTreeIds = new Set(grants.map(g => g.treeId))
  const branchEditorTreeIds = new Set(
    grants.filter(g => g.role === "BRANCH_EDITOR").map(g => g.treeId),
  )

  const resources: LineageResource[] = []
  for (const membership of node.treeMembers) {
    // Skip trees the reviewer cannot review at all — the resource would never
    // authorize (authz-equivalent to keeping it: a denied resource is a no-op in
    // the caller's ANY-authorizes loop).
    if (!grantedTreeIds.has(membership.treeId)) {
      continue
    }

    // Only a BRANCH_EDITOR grant consults `branchRootMemberIds`; walk ancestors
    // solely in that case (kills the whole-tree member load otherwise).
    let branchRootMemberIds: string[] = [membership.id]
    if (branchEditorTreeIds.has(membership.treeId)) {
      const members = await db.lineageTreeMember.findMany({
        where: { treeId: membership.treeId },
        select: { id: true, primaryVisualParentMemberId: true },
      })
      const parentById = buildLineageParentLookup(members)

      // The member itself roots the smallest covering branch; every ancestor roots
      // a larger one. Cycle-guarded like `isLineageMemberInBranch`.
      const visited = new Set<string>([membership.id])
      let cursor = parentById.get(membership.id) ?? null
      while (cursor && !visited.has(cursor)) {
        branchRootMemberIds.push(cursor)
        visited.add(cursor)
        cursor = parentById.get(cursor) ?? null
      }
    }

    resources.push({
      treeId: membership.treeId,
      nodeId: node.id,
      memberId: membership.id,
      branchRootMemberIds,
    })
  }

  return resources.length > 0 ? resources : null
}
