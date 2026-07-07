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
  /** The "listed under" tree parent (an existing member of the tree). When supplied this is the
   *  member's structural placement: it seeds `primaryVisualParentMemberId` AND writes the canonical
   *  `INSTRUCTOR_STUDENT` edge (parent → member) that the canvas + ancestry timeline walk
   *  (`lib/lineage/tree-layout.ts`, `canvas-data.ts`). Exactly one such edge per (parent, member).
   *  (SESSION_0508: previously this wrote a `PROMOTED_BY` edge and NO `INSTRUCTOR_STUDENT`, so an
   *  admin-added person was invisible to the genealogy walk.) */
  parentMemberId?: string | null
  /** The RankAward to tie to a SEPARATE, OPTIONAL `PROMOTED_BY` edge (`LineageRelationship.rankAwardId`,
   *  the canonical promotion fact, ADR 0016) — "who awarded this rank at this time". Only recorded when
   *  present AND a parent is supplied (the parent is the promoter). The tree structure is the
   *  `INSTRUCTOR_STUDENT` edge above; `PROMOTED_BY` is NOT the tree structure. Does not drive the
   *  member's shown belt — that is awarded truth (ADR 0035). */
  rankAwardId?: string | null
}

export type CreateLineageMemberResult = {
  treeId: string
  memberId: string
  nodeId: string
  /** The `PROMOTED_BY` edge id, or null when no rank promotion was recorded. */
  relationshipId: string | null
  /** The `INSTRUCTOR_STUDENT` (tree-placement) edge id, or null when placed at root (no parent). */
  trainedUnderRelationshipId: string | null
}

/**
 * The FIRST runtime path that adds a brand-new person to a lineage tree.
 *
 * Before SESSION_0358, `LineageNode` / `LineageTreeMember` were created only by seeds + test
 * fixtures; the lineage editor only *updates* members that already exist (it throws MEMBER_NOT_FOUND
 * otherwise). This helper fills that gap: it upserts the person's `LineageNode` (userId is unique),
 * creates a `LineageTreeMember` (appended after existing siblings), and — when a parent is given —
 * writes the canonical `INSTRUCTOR_STUDENT` "listed under" edge (parent → member; the tree structure
 * the canvas + ancestry timeline walk) plus, ONLY when a `rankAwardId` is also supplied, a SEPARATE
 * optional `PROMOTED_BY` edge referencing the stated award (ADR 0016: RankAward is the canonical
 * promotion fact — "who awarded this rank when", NOT the tree structure).
 *
 * Both relationship writes are idempotent (find-first before create, mirroring `materializeTrainedUnder`)
 * so this helper is safe to compose with the claim/place-lead materializers — running both against the
 * same (parent, member) yields exactly ONE `INSTRUCTOR_STUDENT` edge.
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

  // 6. When a "listed under" parent is given, write the tree-placement edge — the canonical
  //    `INSTRUCTOR_STUDENT` relationship (parent → member) that the canvas + ancestry timeline walk.
  //    Idempotent (find-first before create) so composing this with `materializeTrainedUnder`
  //    (place-lead / claim-finalize) never double-writes. A rank promotion, if stated, is a SEPARATE
  //    optional `PROMOTED_BY` edge — the tree structure is the INSTRUCTOR_STUDENT edge, not this.
  let trainedUnderRelationshipId: string | null = null
  let relationshipId: string | null = null
  if (parent && parent.nodeId !== member.nodeId) {
    const existingTrainedUnder = await db.lineageRelationship.findFirst({
      where: {
        type: "INSTRUCTOR_STUDENT",
        fromNodeId: parent.nodeId,
        toNodeId: member.nodeId,
      },
      select: { id: true },
    })
    if (existingTrainedUnder) {
      trainedUnderRelationshipId = existingTrainedUnder.id
    } else {
      const trainedUnder = await db.lineageRelationship.create({
        data: {
          type: "INSTRUCTOR_STUDENT",
          fromNodeId: parent.nodeId,
          toNodeId: member.nodeId,
          // Admin-stated placement — unverified until a steward verifies (mirrors the member's
          // Unverified default). The claim/place-lead path materializes a VERIFIED edge on approval.
          isVerified: false,
          verificationStatus: "PENDING",
        },
        select: { id: true },
      })
      trainedUnderRelationshipId = trainedUnder.id
    }

    // OPTIONAL, SEPARATE promotion fact — only when an explicit rank promoter is being recorded
    // (a `rankAwardId` is passed). A parent that is purely the "listed under" instructor with no
    // rank-promotion intent gets NO `PROMOTED_BY` edge. Idempotent on (from, to, rankAward).
    if (rankAwardId) {
      const existingPromotedBy = await db.lineageRelationship.findFirst({
        where: {
          type: "PROMOTED_BY",
          fromNodeId: parent.nodeId,
          toNodeId: member.nodeId,
          rankAwardId,
        },
        select: { id: true },
      })
      relationshipId =
        existingPromotedBy?.id ??
        (
          await db.lineageRelationship.create({
            data: {
              type: "PROMOTED_BY",
              fromNodeId: parent.nodeId,
              toNodeId: member.nodeId,
              isVerified: false,
              verificationStatus: "PENDING",
              rankAwardId,
            },
            select: { id: true },
          })
        ).id
    }
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
        trainedUnderRelationshipId,
      },
    },
  })

  return {
    treeId,
    memberId: member.id,
    nodeId: member.nodeId,
    relationshipId,
    trainedUnderRelationshipId,
  }
}
