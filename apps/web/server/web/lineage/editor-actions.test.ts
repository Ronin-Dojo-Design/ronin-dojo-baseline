/**
 * Lineage editor action hardening tests.
 *
 * Run: cd apps/web && bun test server/web/lineage/editor-actions.test.ts
 *
 * Proves the high-risk lineage editor invariants:
 * - tree editors can mutate placement/promoter state
 * - node editors cannot rewrite lineage truth
 * - branch editors are scope-limited
 * - parent cycles and self-promotion are blocked
 * - brand isolation is enforced
 * - successful lineage-truth mutations write audit logs
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, beforeEach, describe, expect, it, mock } from "bun:test"

mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  revalidatePath: () => {},
  revalidateTag: () => {},
  updateTag: () => {},
}))

const TEST_BRAND = "BASELINE_MARTIAL_ARTS" as const
mock.module("~/lib/brand-context", () => ({
  getRequestBrand: () => Promise.resolve(TEST_BRAND),
}))

const mockSession: { user: { id: string; role: string } } | null = null
mock.module("~/lib/auth", () => ({
  getServerSession: () => Promise.resolve(mockSession),
}))

import type { Brand } from "~/.generated/prisma/client"
import {
  applyLineageMemberPlacementUpdate,
  applyLineagePromotionRelationshipUpdate,
  LINEAGE_EDITOR_ERROR,
} from "~/server/web/lineage/editor-actions"
import { db } from "~/services/db"

const TS = Date.now()
const tag = (name: string) => `session-lineage-hardening-${TS}-${name}`

type Fixtures = {
  treeId: string
  treeSlug: string
  rootMemberId: string
  childAMemberId: string
  childBMemberId: string
  grandchildMemberId: string
  visualGroupId: string
  rootNodeId: string
  childANodeId: string
  childBNodeId: string
  grandchildNodeId: string
  treeEditorUserId: string
  branchEditorUserId: string
  nodeEditorUserId: string
  noAccessUserId: string
  userIds: string[]
  nodeIds: string[]
}

let fx: Fixtures | null = null

const expectRejectsWithMessage = async (promise: Promise<unknown>, message: string) => {
  try {
    await promise
    throw new Error("Expected promise to reject")
  } catch (error) {
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe(message)
  }
}

async function createUser(label: string) {
  return db.user.create({
    data: {
      id: tag(label),
      name: tag(label),
      email: `${tag(label)}@test.local`,
    },
  })
}

beforeAll(async () => {
  const rootUser = await createUser("root-user")
  const childAUser = await createUser("child-a-user")
  const childBUser = await createUser("child-b-user")
  const grandchildUser = await createUser("grandchild-user")
  const treeEditor = await createUser("tree-editor")
  const branchEditor = await createUser("branch-editor")
  const nodeEditor = await createUser("node-editor")
  const noAccess = await createUser("no-access")

  const rootNode = await db.lineageNode.create({
    data: {
      id: tag("root-node"),
      userId: rootUser.id,
      slug: tag("root-node-slug"),
      visibility: "PUBLIC",
      verificationStatus: "VERIFIED",
      isVerified: true,
    },
  })

  const childANode = await db.lineageNode.create({
    data: {
      id: tag("child-a-node"),
      userId: childAUser.id,
      slug: tag("child-a-node-slug"),
      visibility: "PUBLIC",
      verificationStatus: "VERIFIED",
      isVerified: true,
    },
  })

  const childBNode = await db.lineageNode.create({
    data: {
      id: tag("child-b-node"),
      userId: childBUser.id,
      slug: tag("child-b-node-slug"),
      visibility: "PUBLIC",
      verificationStatus: "VERIFIED",
      isVerified: true,
    },
  })

  const grandchildNode = await db.lineageNode.create({
    data: {
      id: tag("grandchild-node"),
      userId: grandchildUser.id,
      slug: tag("grandchild-node-slug"),
      visibility: "PUBLIC",
      verificationStatus: "VERIFIED",
      isVerified: true,
    },
  })

  const tree = await db.lineageTree.create({
    data: {
      id: tag("tree"),
      brand: TEST_BRAND,
      slug: tag("tree-slug"),
      name: tag("Hardening Test Tree"),
      visibility: "PUBLIC",
      isPublished: true,
      scopeType: "DISCIPLINE",
    },
  })

  const rootMember = await db.lineageTreeMember.create({
    data: {
      id: tag("root-member"),
      treeId: tree.id,
      nodeId: rootNode.id,
      visualSortOrder: 0,
    },
  })

  const childAMember = await db.lineageTreeMember.create({
    data: {
      id: tag("child-a-member"),
      treeId: tree.id,
      nodeId: childANode.id,
      primaryVisualParentMemberId: rootMember.id,
      visualSortOrder: 1,
    },
  })

  const childBMember = await db.lineageTreeMember.create({
    data: {
      id: tag("child-b-member"),
      treeId: tree.id,
      nodeId: childBNode.id,
      primaryVisualParentMemberId: rootMember.id,
      visualSortOrder: 2,
    },
  })

  const grandchildMember = await db.lineageTreeMember.create({
    data: {
      id: tag("grandchild-member"),
      treeId: tree.id,
      nodeId: grandchildNode.id,
      primaryVisualParentMemberId: childAMember.id,
      visualSortOrder: 3,
    },
  })

  const visualGroup = await db.lineageVisualGroup.create({
    data: {
      id: tag("promotion-group"),
      treeId: tree.id,
      parentMemberId: rootMember.id,
      label: "Test promotion cohort",
      groupType: "CUSTOM",
      sortOrder: 1,
      showPublicLabel: true,
    },
  })

  await db.lineageTree.update({
    where: { id: tree.id },
    data: { defaultRootMemberId: rootMember.id },
  })

  await db.lineageTreeAccess.createMany({
    data: [
      {
        id: tag("tree-editor-grant"),
        treeId: tree.id,
        userId: treeEditor.id,
        role: "TREE_EDITOR",
      },
      {
        id: tag("branch-editor-grant"),
        treeId: tree.id,
        userId: branchEditor.id,
        role: "BRANCH_EDITOR",
        rootMemberId: childAMember.id,
      },
      {
        id: tag("node-editor-grant"),
        treeId: tree.id,
        userId: nodeEditor.id,
        role: "NODE_EDITOR",
        memberId: childBMember.id,
        nodeId: childBNode.id,
      },
    ],
  })

  fx = {
    treeId: tree.id,
    treeSlug: tree.slug,
    rootMemberId: rootMember.id,
    childAMemberId: childAMember.id,
    childBMemberId: childBMember.id,
    grandchildMemberId: grandchildMember.id,
    visualGroupId: visualGroup.id,
    rootNodeId: rootNode.id,
    childANodeId: childANode.id,
    childBNodeId: childBNode.id,
    grandchildNodeId: grandchildNode.id,
    treeEditorUserId: treeEditor.id,
    branchEditorUserId: branchEditor.id,
    nodeEditorUserId: nodeEditor.id,
    noAccessUserId: noAccess.id,
    userIds: [
      rootUser.id,
      childAUser.id,
      childBUser.id,
      grandchildUser.id,
      treeEditor.id,
      branchEditor.id,
      nodeEditor.id,
      noAccess.id,
    ],
    nodeIds: [rootNode.id, childANode.id, childBNode.id, grandchildNode.id],
  }
})

beforeEach(async () => {
  if (!fx) return

  await db.lineageTreeMember.update({
    where: { id: fx.childAMemberId },
    data: {
      primaryVisualParentMemberId: fx.rootMemberId,
      visualGroupId: null,
      visualSortOrder: 1,
    },
  })

  await db.lineageTreeMember.update({
    where: { id: fx.childBMemberId },
    data: {
      primaryVisualParentMemberId: fx.rootMemberId,
      visualGroupId: null,
      visualSortOrder: 2,
    },
  })

  await db.lineageTreeMember.update({
    where: { id: fx.grandchildMemberId },
    data: {
      primaryVisualParentMemberId: fx.childAMemberId,
      visualGroupId: null,
      visualSortOrder: 3,
    },
  })

  await db.lineageRelationship.deleteMany({
    where: {
      OR: [{ fromNodeId: { in: fx.nodeIds } }, { toNodeId: { in: fx.nodeIds } }],
    },
  })

  await db.auditLog.deleteMany({
    where: {
      userId: { in: fx.userIds },
    },
  })
})

afterAll(async () => {
  if (!fx) return

  await db.auditLog.deleteMany({ where: { userId: { in: fx.userIds } } })
  await db.lineageRelationship.deleteMany({
    where: {
      OR: [{ fromNodeId: { in: fx.nodeIds } }, { toNodeId: { in: fx.nodeIds } }],
    },
  })
  await db.lineageTreeAccess.deleteMany({ where: { treeId: fx.treeId } })
  await db.lineageVisualGroup.deleteMany({ where: { treeId: fx.treeId } })
  await db.lineageTreeMember.deleteMany({ where: { treeId: fx.treeId } })
  await db.lineageTree.deleteMany({ where: { id: fx.treeId } })
  await db.lineageNode.deleteMany({ where: { id: { in: fx.nodeIds } } })
  await db.user.deleteMany({ where: { id: { in: fx.userIds } } })
})

describe("lineage editor placement actions", () => {
  it("allows a TREE_EDITOR to move a member and writes an audit log", async () => {
    const result = await applyLineageMemberPlacementUpdate({
      db,
      brand: TEST_BRAND,
      userId: fx!.treeEditorUserId,
      input: {
        treeId: fx!.treeId,
        memberId: fx!.childBMemberId,
        parentMemberId: fx!.childAMemberId,
        visualGroupId: null,
        visualSortOrder: 11,
        auditNote: "Move child B under child A for lineage hardening test.",
      },
    })

    expect(result).toEqual({
      treeId: fx!.treeId,
      treeSlug: fx!.treeSlug,
      memberId: fx!.childBMemberId,
      nodeId: fx!.childBNodeId,
    })

    const member = await db.lineageTreeMember.findUnique({ where: { id: fx!.childBMemberId } })
    expect(member?.primaryVisualParentMemberId).toBe(fx!.childAMemberId)
    expect(member?.visualSortOrder).toBe(11)

    const audit = await db.auditLog.findFirst({
      where: {
        action: "lineage.member.placement.updated",
        entityType: "LineageTreeMember",
        entityId: fx!.childBMemberId,
        userId: fx!.treeEditorUserId,
      },
    })
    expect(audit).not.toBeNull()
  })

  it("assigns a member to a compatible visual group", async () => {
    const result = await applyLineageMemberPlacementUpdate({
      db,
      brand: TEST_BRAND,
      userId: fx!.treeEditorUserId,
      input: {
        treeId: fx!.treeId,
        memberId: fx!.childBMemberId,
        parentMemberId: fx!.rootMemberId,
        visualGroupId: fx!.visualGroupId,
        visualSortOrder: 6,
        auditNote: "Assign child B to the test promotion cohort row.",
      },
    })

    expect(result.memberId).toBe(fx!.childBMemberId)
    const member = await db.lineageTreeMember.findUnique({ where: { id: fx!.childBMemberId } })
    expect(member?.visualGroupId).toBe(fx!.visualGroupId)
  })

  it("blocks NODE_EDITOR from moving a member", async () => {
    await expectRejectsWithMessage(
      applyLineageMemberPlacementUpdate({
        db,
        brand: TEST_BRAND,
        userId: fx!.nodeEditorUserId,
        input: {
          treeId: fx!.treeId,
          memberId: fx!.childBMemberId,
          parentMemberId: fx!.rootMemberId,
          visualGroupId: null,
          visualSortOrder: 1,
          auditNote: "Node editor attempts to rewrite lineage placement.",
        },
      }),
      LINEAGE_EDITOR_ERROR.NODE_EDITOR_CANNOT_REPARENT,
    )
  })

  it("blocks no-access users from moving a member", async () => {
    await expectRejectsWithMessage(
      applyLineageMemberPlacementUpdate({
        db,
        brand: TEST_BRAND,
        userId: fx!.noAccessUserId,
        input: {
          treeId: fx!.treeId,
          memberId: fx!.childBMemberId,
          parentMemberId: fx!.rootMemberId,
          visualGroupId: null,
          visualSortOrder: 1,
          auditNote: "No-access user attempts to rewrite lineage placement.",
        },
      }),
      LINEAGE_EDITOR_ERROR.EDITOR_ACCESS_REQUIRED,
    )
  })

  it("allows BRANCH_EDITOR to reorder inside their branch", async () => {
    const result = await applyLineageMemberPlacementUpdate({
      db,
      brand: TEST_BRAND,
      userId: fx!.branchEditorUserId,
      input: {
        treeId: fx!.treeId,
        memberId: fx!.grandchildMemberId,
        parentMemberId: fx!.childAMemberId,
        visualGroupId: null,
        visualSortOrder: 7,
        auditNote: "Branch editor reorders a descendant inside assigned branch.",
      },
    })

    expect(result.memberId).toBe(fx!.grandchildMemberId)
    const member = await db.lineageTreeMember.findUnique({ where: { id: fx!.grandchildMemberId } })
    expect(member?.visualSortOrder).toBe(7)
  })

  it("blocks BRANCH_EDITOR from moving a member outside assigned branch", async () => {
    await expectRejectsWithMessage(
      applyLineageMemberPlacementUpdate({
        db,
        brand: TEST_BRAND,
        userId: fx!.branchEditorUserId,
        input: {
          treeId: fx!.treeId,
          memberId: fx!.childBMemberId,
          parentMemberId: fx!.childAMemberId,
          visualGroupId: null,
          visualSortOrder: 4,
          auditNote: "Branch editor attempts to move sibling into assigned branch.",
        },
      }),
      LINEAGE_EDITOR_ERROR.BRANCH_SCOPE_REQUIRED,
    )
  })

  it("blocks cycle-producing placement changes", async () => {
    await expectRejectsWithMessage(
      applyLineageMemberPlacementUpdate({
        db,
        brand: TEST_BRAND,
        userId: fx!.treeEditorUserId,
        input: {
          treeId: fx!.treeId,
          memberId: fx!.childAMemberId,
          parentMemberId: fx!.grandchildMemberId,
          visualGroupId: null,
          visualSortOrder: 5,
          auditNote: "Tree editor attempts to create an impossible parent cycle.",
        },
      }),
      LINEAGE_EDITOR_ERROR.PARENT_CYCLE,
    )
  })

  it("blocks cross-brand placement access", async () => {
    await expectRejectsWithMessage(
      applyLineageMemberPlacementUpdate({
        db,
        brand: "RONIN_DOJO_DESIGN" as Brand,
        userId: fx!.treeEditorUserId,
        input: {
          treeId: fx!.treeId,
          memberId: fx!.childBMemberId,
          parentMemberId: fx!.rootMemberId,
          visualGroupId: null,
          visualSortOrder: 1,
          auditNote: "Cross-brand request should never locate this tree.",
        },
      }),
      LINEAGE_EDITOR_ERROR.TREE_NOT_FOUND,
    )
  })
})

describe("lineage promoter relationship actions", () => {
  it("allows TREE_EDITOR to create a PROMOTED_BY relationship and writes audit", async () => {
    const result = await applyLineagePromotionRelationshipUpdate({
      db,
      brand: TEST_BRAND,
      userId: fx!.treeEditorUserId,
      input: {
        treeId: fx!.treeId,
        memberId: fx!.childBMemberId,
        promoterMemberId: fx!.rootMemberId,
        auditNote: "Set root as child B promoter for hardening test.",
      },
    })

    expect(result.memberId).toBe(fx!.childBMemberId)
    expect(result.relationshipId).not.toBeNull()

    const relationship = await db.lineageRelationship.findUnique({
      where: { id: result.relationshipId! },
    })
    expect(relationship?.type).toBe("PROMOTED_BY")
    expect(relationship?.fromNodeId).toBe(fx!.rootNodeId)
    expect(relationship?.toNodeId).toBe(fx!.childBNodeId)
    expect(relationship?.verificationStatus).toBe("PENDING")
    expect(relationship?.isVerified).toBe(false)

    const audit = await db.auditLog.findFirst({
      where: {
        action: "lineage.relationship.promoter.updated",
        entityType: "LineageRelationship",
        userId: fx!.treeEditorUserId,
      },
    })
    expect(audit).not.toBeNull()
  })

  it("updates an existing PROMOTED_BY relationship", async () => {
    const first = await applyLineagePromotionRelationshipUpdate({
      db,
      brand: TEST_BRAND,
      userId: fx!.treeEditorUserId,
      input: {
        treeId: fx!.treeId,
        memberId: fx!.childBMemberId,
        promoterMemberId: fx!.rootMemberId,
        auditNote: "Initial promoter assignment before update.",
      },
    })

    const second = await applyLineagePromotionRelationshipUpdate({
      db,
      brand: TEST_BRAND,
      userId: fx!.treeEditorUserId,
      input: {
        treeId: fx!.treeId,
        memberId: fx!.childBMemberId,
        promoterMemberId: fx!.childAMemberId,
        auditNote: "Update child B promoter to child A for hardening test.",
      },
    })

    expect(second.relationshipId).toBe(first.relationshipId)
    const relationship = await db.lineageRelationship.findUnique({
      where: { id: second.relationshipId! },
    })
    expect(relationship?.fromNodeId).toBe(fx!.childANodeId)
    expect(relationship?.verificationStatus).toBe("PENDING")
    expect(relationship?.isVerified).toBe(false)
  })

  it("blocks NODE_EDITOR from changing promoter", async () => {
    await expectRejectsWithMessage(
      applyLineagePromotionRelationshipUpdate({
        db,
        brand: TEST_BRAND,
        userId: fx!.nodeEditorUserId,
        input: {
          treeId: fx!.treeId,
          memberId: fx!.childBMemberId,
          promoterMemberId: fx!.childAMemberId,
          auditNote: "Node editor attempts to change promotion lineage.",
        },
      }),
      LINEAGE_EDITOR_ERROR.NODE_EDITOR_CANNOT_REPARENT,
    )
  })

  it("blocks self-promotion", async () => {
    await expectRejectsWithMessage(
      applyLineagePromotionRelationshipUpdate({
        db,
        brand: TEST_BRAND,
        userId: fx!.treeEditorUserId,
        input: {
          treeId: fx!.treeId,
          memberId: fx!.childAMemberId,
          promoterMemberId: fx!.childAMemberId,
          auditNote: "Self-promotion should be impossible.",
        },
      }),
      LINEAGE_EDITOR_ERROR.SELF_PROMOTION,
    )
  })

  it("blocks BRANCH_EDITOR from assigning an out-of-branch promoter", async () => {
    await expectRejectsWithMessage(
      applyLineagePromotionRelationshipUpdate({
        db,
        brand: TEST_BRAND,
        userId: fx!.branchEditorUserId,
        input: {
          treeId: fx!.treeId,
          memberId: fx!.grandchildMemberId,
          promoterMemberId: fx!.childBMemberId,
          auditNote: "Branch editor attempts to assign outside promoter.",
        },
      }),
      LINEAGE_EDITOR_ERROR.BRANCH_SCOPE_REQUIRED,
    )
  })
})
