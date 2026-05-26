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
  applyLineageVisualGroupUpdate,
} from "~/server/web/lineage/editor-actions"
import { LINEAGE_EDITOR_ERROR } from "~/server/web/lineage/editor-errors"
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
  treeAdminUserId: string
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
  const treeAdmin = await createUser("tree-admin")
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
        id: tag("tree-admin-grant"),
        treeId: tree.id,
        userId: treeAdmin.id,
        role: "TREE_ADMIN",
      },
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
    treeAdminUserId: treeAdmin.id,
    treeEditorUserId: treeEditor.id,
    branchEditorUserId: branchEditor.id,
    nodeEditorUserId: nodeEditor.id,
    noAccessUserId: noAccess.id,
    userIds: [
      rootUser.id,
      childAUser.id,
      childBUser.id,
      grandchildUser.id,
      treeAdmin.id,
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

  await db.lineageVisualGroup.update({
    where: { id: fx.visualGroupId },
    data: {
      label: "Test promotion cohort",
      showPublicLabel: true,
      isCollapsedDefault: false,
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

describe("lineage visual group editor actions", () => {
  it("allows TREE_ADMIN to update visual group label and public toggles", async () => {
    const result = await applyLineageVisualGroupUpdate({
      db,
      brand: TEST_BRAND,
      userId: fx!.treeAdminUserId,
      input: {
        treeId: fx!.treeId,
        groupId: fx!.visualGroupId,
        label: "Updated promotion cohort",
        showPublicLabel: false,
        collapseByDefault: true,
        auditNote: "Update visual group display settings for hardening test.",
      },
    })

    expect(result.groupId).toBe(fx!.visualGroupId)

    const group = await db.lineageVisualGroup.findUnique({ where: { id: fx!.visualGroupId } })
    expect(group?.label).toBe("Updated promotion cohort")
    expect(group?.showPublicLabel).toBe(false)
    expect(group?.isCollapsedDefault).toBe(true)

    const audit = await db.auditLog.findFirst({
      where: {
        action: "lineage.visual_group.updated",
        entityType: "LineageVisualGroup",
        entityId: fx!.visualGroupId,
        userId: fx!.treeAdminUserId,
      },
    })
    expect(audit).not.toBeNull()
  })

  it("blocks TREE_EDITOR from managing visual groups", async () => {
    await expectRejectsWithMessage(
      applyLineageVisualGroupUpdate({
        db,
        brand: TEST_BRAND,
        userId: fx!.treeEditorUserId,
        input: {
          treeId: fx!.treeId,
          groupId: fx!.visualGroupId,
          label: "Tree editor should not rename group",
          auditNote: "Tree editor attempts to manage visual group settings.",
        },
      }),
      LINEAGE_EDITOR_ERROR.EDITOR_ACCESS_REQUIRED,
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
        verificationStatus: "VERIFIED",
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
    expect(relationship?.verificationStatus).toBe("VERIFIED")
    expect(relationship?.isVerified).toBe(true)

    const audit = await db.auditLog.findFirst({
      where: {
        action: "lineage.relationship.promoter.updated",
        entityType: "LineageRelationship",
        userId: fx!.treeEditorUserId,
      },
    })
    expect(audit).not.toBeNull()
  })

  it("rejects a rank award that is not attached to the edited member", async () => {
    await expectRejectsWithMessage(
      applyLineagePromotionRelationshipUpdate({
        db,
        brand: TEST_BRAND,
        userId: fx!.treeEditorUserId,
        input: {
          treeId: fx!.treeId,
          memberId: fx!.childBMemberId,
          promoterMemberId: fx!.rootMemberId,
          rankAwardId: tag("not-this-members-rank-award"),
          auditNote: "Attempt to attach an unrelated rank award.",
        },
      }),
      LINEAGE_EDITOR_ERROR.RANK_AWARD_NOT_FOUND,
    )
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

type PromotionRegressionFixtures = {
  editorUserId: string
  studentNodeId: string
  rankedPromoterNodeId: string
  newPromoterNodeId: string
  studentMemberId: string
  newPromoterMemberId: string
  treeId: string
  rankAwardId: string
  rankId: string
  rankSystemId: string
  disciplineId: string
  relationshipId: string
  userIds: string[]
}

describe("lineage promoter relationship ranked-regression guard", () => {
  let regressionFx: PromotionRegressionFixtures | null = null
  const regressionTag = (name: string) => `editor-actions-${TS}-${name}`

  beforeAll(async () => {
    const editorUser = await db.user.create({
      data: {
        id: regressionTag("editor-user"),
        name: regressionTag("Editor User"),
        email: `${regressionTag("editor-user")}@test.local`,
      },
      select: { id: true },
    })

    const [studentUser, rankedPromoterUser, newPromoterUser] = await Promise.all([
      db.user.create({
        data: {
          id: regressionTag("student-user"),
          name: regressionTag("Student User"),
          email: `${regressionTag("student-user")}@test.local`,
        },
        select: { id: true },
      }),
      db.user.create({
        data: {
          id: regressionTag("ranked-promoter-user"),
          name: regressionTag("Ranked Promoter"),
          email: `${regressionTag("ranked-promoter-user")}@test.local`,
        },
        select: { id: true },
      }),
      db.user.create({
        data: {
          id: regressionTag("new-promoter-user"),
          name: regressionTag("New Promoter"),
          email: `${regressionTag("new-promoter-user")}@test.local`,
        },
        select: { id: true },
      }),
    ])

    const discipline = await db.discipline.create({
      data: {
        id: regressionTag("discipline"),
        brand: TEST_BRAND,
        name: regressionTag("Discipline"),
        slug: regressionTag("discipline"),
        code: regressionTag("DISC").slice(0, 16),
      },
      select: { id: true },
    })

    const rankSystem = await db.rankSystem.create({
      data: {
        id: regressionTag("rank-system"),
        brand: TEST_BRAND,
        name: regressionTag("Rank System"),
        disciplineId: discipline.id,
      },
      select: { id: true },
    })

    const rank = await db.rank.create({
      data: {
        id: regressionTag("rank"),
        brand: TEST_BRAND,
        rankSystemId: rankSystem.id,
        sortOrder: 1,
        name: regressionTag("Black Belt"),
        shortName: "BB",
      },
      select: { id: true },
    })

    const rankAward = await db.rankAward.create({
      data: {
        id: regressionTag("rank-award"),
        userId: studentUser.id,
        rankId: rank.id,
        awardedAt: new Date(Date.UTC(2020, 0, 1)),
      },
      select: { id: true },
    })

    const [studentNode, rankedPromoterNode, newPromoterNode] = await Promise.all([
      db.lineageNode.create({
        data: {
          id: regressionTag("student-node"),
          userId: studentUser.id,
          slug: regressionTag("student-node-slug"),
          visibility: "PUBLIC",
          verificationStatus: "PENDING",
        },
        select: { id: true },
      }),
      db.lineageNode.create({
        data: {
          id: regressionTag("ranked-promoter-node"),
          userId: rankedPromoterUser.id,
          slug: regressionTag("ranked-promoter-node-slug"),
          visibility: "PUBLIC",
          verificationStatus: "PENDING",
        },
        select: { id: true },
      }),
      db.lineageNode.create({
        data: {
          id: regressionTag("new-promoter-node"),
          userId: newPromoterUser.id,
          slug: regressionTag("new-promoter-node-slug"),
          visibility: "PUBLIC",
          verificationStatus: "PENDING",
        },
        select: { id: true },
      }),
    ])

    const tree = await db.lineageTree.create({
      data: {
        id: regressionTag("tree"),
        brand: TEST_BRAND,
        slug: regressionTag("tree-slug"),
        name: regressionTag("Test Lineage Tree"),
        visibility: "PUBLIC",
        isPublished: true,
        scopeType: "DISCIPLINE",
        disciplineId: discipline.id,
      },
      select: { id: true },
    })

    const [studentMember, , newPromoterMember] = await Promise.all([
      db.lineageTreeMember.create({
        data: {
          id: regressionTag("student-member"),
          treeId: tree.id,
          nodeId: studentNode.id,
          rankAwardId: null,
          visualSortOrder: 0,
        },
        select: { id: true },
      }),
      db.lineageTreeMember.create({
        data: {
          id: regressionTag("ranked-promoter-member"),
          treeId: tree.id,
          nodeId: rankedPromoterNode.id,
          rankAwardId: null,
          visualSortOrder: 1,
        },
        select: { id: true },
      }),
      db.lineageTreeMember.create({
        data: {
          id: regressionTag("new-promoter-member"),
          treeId: tree.id,
          nodeId: newPromoterNode.id,
          rankAwardId: null,
          visualSortOrder: 2,
        },
        select: { id: true },
      }),
    ])

    await db.lineageTreeAccess.create({
      data: {
        id: regressionTag("tree-access"),
        treeId: tree.id,
        userId: editorUser.id,
        role: "TREE_EDITOR",
      },
      select: { id: true },
    })

    const relationship = await db.lineageRelationship.create({
      data: {
        id: regressionTag("ranked-promotion"),
        type: "PROMOTED_BY",
        fromNodeId: rankedPromoterNode.id,
        toNodeId: studentNode.id,
        rankAwardId: rankAward.id,
        endedAt: null,
        isVerified: false,
        verificationStatus: "PENDING",
      },
      select: { id: true },
    })

    regressionFx = {
      editorUserId: editorUser.id,
      studentNodeId: studentNode.id,
      rankedPromoterNodeId: rankedPromoterNode.id,
      newPromoterNodeId: newPromoterNode.id,
      studentMemberId: studentMember.id,
      newPromoterMemberId: newPromoterMember.id,
      treeId: tree.id,
      rankAwardId: rankAward.id,
      rankId: rank.id,
      rankSystemId: rankSystem.id,
      disciplineId: discipline.id,
      relationshipId: relationship.id,
      userIds: [editorUser.id, studentUser.id, rankedPromoterUser.id, newPromoterUser.id],
    }
  })

  afterAll(async () => {
    if (!regressionFx) return

    await db.auditLog.deleteMany({ where: { userId: regressionFx.editorUserId } })
    await db.lineageTreeAccess.deleteMany({ where: { treeId: regressionFx.treeId } })
    await db.lineageTreeMember.deleteMany({ where: { treeId: regressionFx.treeId } })
    await db.lineageTree.deleteMany({ where: { id: regressionFx.treeId } })
    await db.lineageRelationship.deleteMany({
      where: {
        OR: [{ rankAwardId: regressionFx.rankAwardId }, { toNodeId: regressionFx.studentNodeId }],
      },
    })
    await db.lineageNode.deleteMany({
      where: {
        id: {
          in: [
            regressionFx.studentNodeId,
            regressionFx.rankedPromoterNodeId,
            regressionFx.newPromoterNodeId,
          ],
        },
      },
    })
    await db.rankAward.deleteMany({ where: { id: regressionFx.rankAwardId } })
    await db.rank.deleteMany({ where: { id: regressionFx.rankId } })
    await db.rankSystem.deleteMany({ where: { id: regressionFx.rankSystemId } })
    await db.discipline.deleteMany({ where: { id: regressionFx.disciplineId } })
    await db.user.deleteMany({ where: { id: { in: regressionFx.userIds } } })
  })

  it("creates a null-rank PROMOTED_BY relationship without touching ranked promotions", async () => {
    const result = await applyLineagePromotionRelationshipUpdate({
      db,
      brand: TEST_BRAND as Brand,
      userId: regressionFx!.editorUserId,
      input: {
        treeId: regressionFx!.treeId,
        memberId: regressionFx!.studentMemberId,
        promoterMemberId: regressionFx!.newPromoterMemberId,
        auditNote: "Update promoter for an unranked tree member.",
      },
    })

    expect(result.relationshipId).not.toBeNull()

    const rankedRelationship = await db.lineageRelationship.findUnique({
      where: { id: regressionFx!.relationshipId },
      select: { fromNodeId: true, rankAwardId: true },
    })

    expect(rankedRelationship?.rankAwardId).toBe(regressionFx!.rankAwardId)
    expect(rankedRelationship?.fromNodeId).toBe(regressionFx!.rankedPromoterNodeId)

    const unrankedRelationship = await db.lineageRelationship.findUnique({
      where: { id: result.relationshipId! },
      select: { fromNodeId: true, toNodeId: true, rankAwardId: true, endedAt: true },
    })

    expect(unrankedRelationship?.toNodeId).toBe(regressionFx!.studentNodeId)
    expect(unrankedRelationship?.fromNodeId).toBe(regressionFx!.newPromoterNodeId)
    expect(unrankedRelationship?.rankAwardId).toBeNull()
    expect(unrankedRelationship?.endedAt).toBeNull()
  })
})
