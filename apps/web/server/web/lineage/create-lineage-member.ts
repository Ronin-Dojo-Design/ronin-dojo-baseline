import type { Brand } from "~/.generated/prisma/client"
import type { db as appDb } from "~/services/db"

type AppDb = typeof appDb

export const CREATE_LINEAGE_MEMBER_ERROR = {
  TREE_NOT_FOUND: "LINEAGE_TREE_NOT_FOUND",
  PARENT_NOT_FOUND: "LINEAGE_PARENT_NOT_FOUND",
  MEMBER_EXISTS: "LINEAGE_MEMBER_EXISTS",
} as const

export type CreateLineageMemberInput = {
  /** Prisma client — pass the transaction client (`tx as AppDb`) to run inside an existing tx. */
  db: AppDb
  brand: Brand
  /** The admin performing the action (for the audit trail). */
  actorUserId: string
  /** The person being placed (their Passport id — SOT-ADR D1; placeholders are accountless Passports). */
  memberPassportId: string
  treeId: string
  /** Optional visual + promotion parent (an existing member of the tree). */
  parentMemberId?: string | null
  /** The RankAward to tie to the PROMOTED_BY edge (`LineageRelationship.rankAwardId`,
   *  the canonical promotion fact, ADR 0016). Does not drive the member's shown belt —
   *  that is awarded truth (ADR 0035). */
  rankAwardId?: string | null
}

export type CreateLineageMemberResult = {
  treeId: string
  memberId: string
  nodeId: string
  relationshipId: string | null
}

/**
 * The FIRST runtime path that adds a brand-new person to a lineage tree.
 *
 * Before SESSION_0358, `LineageNode` / `LineageTreeMember` were created only by seeds + test
 * fixtures; the lineage editor only *updates* members that already exist (it throws MEMBER_NOT_FOUND
 * otherwise). This helper fills that gap: it upserts the person's `LineageNode` (userId is unique),
 * creates a `LineageTreeMember` (a visual parent, appended after existing siblings), and — when a
 * parent is given — records the canonical `PROMOTED_BY` `LineageRelationship` referencing the stated
 * award (ADR 0016: RankAward is the canonical promotion fact).
 *
 * Designed to run INSIDE an existing transaction (pass the tx client) so add-person stays ONE action.
 * Admin authority is assumed (callers are `adminActionClient`); brand-ownership of the tree is
 * enforced here, and a chosen parent must already be a member of the same tree.
 *
 * @added SESSION_0358 (TASK_02). Reusable later by the lineage editor's own "add member" affordance.
 */
export const createLineageMember = async ({
  db,
  brand,
  actorUserId,
  memberPassportId,
  treeId,
  parentMemberId,
  rankAwardId,
}: CreateLineageMemberInput): Promise<CreateLineageMemberResult> => {
  // 1. Tree must exist and belong to the current brand (lineage visibility is brand-scoped).
  const tree = await db.lineageTree.findFirst({
    where: { id: treeId, brand },
    select: { id: true },
  })
  if (!tree) {
    throw new Error(CREATE_LINEAGE_MEMBER_ERROR.TREE_NOT_FOUND)
  }

  // 2. A chosen parent must be an existing member of THIS tree.
  let parent: { id: string; nodeId: string } | null = null
  if (parentMemberId) {
    parent = await db.lineageTreeMember.findFirst({
      where: { id: parentMemberId, treeId },
      select: { id: true, nodeId: true },
    })
    if (!parent) {
      throw new Error(CREATE_LINEAGE_MEMBER_ERROR.PARENT_NOT_FOUND)
    }
  }

  // 3. One LineageNode per person (passportId is unique, SOT-ADR D1) — upsert so re-placing reuses
  //    the same node.
  const node = await db.lineageNode.upsert({
    where: { passportId: memberPassportId },
    update: {},
    create: { passportId: memberPassportId },
    select: { id: true },
  })

  // A node may appear only once per tree (@@unique [treeId, nodeId]).
  const existingMember = await db.lineageTreeMember.findFirst({
    where: { treeId, nodeId: node.id },
    select: { id: true },
  })
  if (existingMember) {
    throw new Error(CREATE_LINEAGE_MEMBER_ERROR.MEMBER_EXISTS)
  }

  // 4. Append after existing siblings under the same visual parent.
  const lastSibling = await db.lineageTreeMember.findFirst({
    where: { treeId, primaryVisualParentMemberId: parentMemberId ?? null },
    orderBy: { visualSortOrder: "desc" },
    select: { visualSortOrder: true },
  })
  const visualSortOrder = (lastSibling?.visualSortOrder ?? -1) + 1

  // 5. Create the tree member. The shown belt comes from awarded truth (the passport's
  //    highest RankAward, ADR 0035) — the member row carries no rank pointer of its own.
  const member = await db.lineageTreeMember.create({
    data: {
      treeId,
      nodeId: node.id,
      primaryVisualParentMemberId: parentMemberId ?? null,
      visualSortOrder,
    },
    select: { id: true, nodeId: true },
  })

  // 6. When promoted by a parent, record the canonical promotion edge (unverified — admin-stated).
  let relationshipId: string | null = null
  if (parent) {
    const relationship = await db.lineageRelationship.create({
      data: {
        type: "PROMOTED_BY",
        fromNodeId: parent.nodeId,
        toNodeId: member.nodeId,
        isVerified: false,
        verificationStatus: "PENDING",
        ...(rankAwardId ? { rankAwardId } : {}),
      },
      select: { id: true },
    })
    relationshipId = relationship.id
  }

  // 7. Audit.
  await db.auditLog.create({
    data: {
      brand,
      action: "lineage.member.created",
      entityType: "LineageTreeMember",
      entityId: member.id,
      userId: actorUserId,
      after: {
        treeId,
        nodeId: node.id,
        memberId: member.id,
        parentMemberId: parentMemberId ?? null,
        rankAwardId: rankAwardId ?? null,
        relationshipId,
      },
    },
  })

  return { treeId, memberId: member.id, nodeId: member.nodeId, relationshipId }
}
