/**
 * Regression: unranked promoter lookup must not match ranked promotions.
 *
 * Run: cd apps/web && bun test server/web/lineage/editor-actions.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"

// Mock next/cache (required by safe-actions import chain).
mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  revalidatePath: () => {},
  revalidateTag: () => {},
  updateTag: () => {},
}))

// Mock brand-context — the helper receives brand directly, but the action module
// imports getRequestBrand for the safe-action wrapper exports.
const TEST_BRAND = "BASELINE_MARTIAL_ARTS" as const
mock.module("~/lib/brand-context", () => ({
  getRequestBrand: () => Promise.resolve(TEST_BRAND),
}))

// Mock auth — not used by the helper tests, but required by userActionClient.
const mockSession: { user: { id: string; role: string } } | null = null
mock.module("~/lib/auth", () => ({
  getServerSession: () => Promise.resolve(mockSession),
}))

import type { Brand } from "~/.generated/prisma/client"
import { applyLineagePromotionRelationshipUpdate } from "~/server/web/lineage/editor-actions"
import { db } from "~/services/db"

const TS = Date.now()
const tag = (name: string) => `editor-actions-${TS}-${name}`

type Fixtures = {
  editorUserId: string
  studentUserId: string
  rankedPromoterUserId: string
  newPromoterUserId: string
  treeId: string
  studentNodeId: string
  rankedPromoterNodeId: string
  newPromoterNodeId: string
  studentMemberId: string
  rankedPromoterMemberId: string
  newPromoterMemberId: string
  rankAwardId: string
  rankId: string
  rankSystemId: string
  disciplineId: string
  relationshipId: string
  userIds: string[]
}

let fx: Fixtures | null = null

beforeAll(async () => {
  const editorUser = await db.user.create({
    data: {
      id: tag("editor-user"),
      name: tag("Editor User"),
      email: `${tag("editor-user")}@test.local`,
    },
    select: { id: true },
  })

  const [studentUser, rankedPromoterUser, newPromoterUser] = await Promise.all([
    db.user.create({
      data: {
        id: tag("student-user"),
        name: tag("Student User"),
        email: `${tag("student-user")}@test.local`,
      },
      select: { id: true },
    }),
    db.user.create({
      data: {
        id: tag("ranked-promoter-user"),
        name: tag("Ranked Promoter"),
        email: `${tag("ranked-promoter-user")}@test.local`,
      },
      select: { id: true },
    }),
    db.user.create({
      data: {
        id: tag("new-promoter-user"),
        name: tag("New Promoter"),
        email: `${tag("new-promoter-user")}@test.local`,
      },
      select: { id: true },
    }),
  ])

  const discipline = await db.discipline.create({
    data: {
      id: tag("discipline"),
      brand: TEST_BRAND,
      name: tag("Discipline"),
      slug: tag("discipline"),
      code: tag("DISC").slice(0, 16),
    },
    select: { id: true },
  })

  const rankSystem = await db.rankSystem.create({
    data: {
      id: tag("rank-system"),
      brand: TEST_BRAND,
      name: tag("Rank System"),
      disciplineId: discipline.id,
    },
    select: { id: true },
  })

  const rank = await db.rank.create({
    data: {
      id: tag("rank"),
      brand: TEST_BRAND,
      rankSystemId: rankSystem.id,
      sortOrder: 1,
      name: tag("Black Belt"),
      shortName: "BB",
    },
    select: { id: true },
  })

  const rankAward = await db.rankAward.create({
    data: {
      id: tag("rank-award"),
      userId: studentUser.id,
      rankId: rank.id,
      awardedAt: new Date(Date.UTC(2020, 0, 1)),
    },
    select: { id: true },
  })

  const [studentNode, rankedPromoterNode, newPromoterNode] = await Promise.all([
    db.lineageNode.create({
      data: {
        id: tag("student-node"),
        userId: studentUser.id,
        slug: tag("student-node-slug"),
        visibility: "PUBLIC",
        verificationStatus: "PENDING",
      },
      select: { id: true },
    }),
    db.lineageNode.create({
      data: {
        id: tag("ranked-promoter-node"),
        userId: rankedPromoterUser.id,
        slug: tag("ranked-promoter-node-slug"),
        visibility: "PUBLIC",
        verificationStatus: "PENDING",
      },
      select: { id: true },
    }),
    db.lineageNode.create({
      data: {
        id: tag("new-promoter-node"),
        userId: newPromoterUser.id,
        slug: tag("new-promoter-node-slug"),
        visibility: "PUBLIC",
        verificationStatus: "PENDING",
      },
      select: { id: true },
    }),
  ])

  const tree = await db.lineageTree.create({
    data: {
      id: tag("tree"),
      brand: TEST_BRAND,
      slug: tag("tree-slug"),
      name: tag("Test Lineage Tree"),
      visibility: "PUBLIC",
      isPublished: true,
      scopeType: "DISCIPLINE",
      disciplineId: discipline.id,
    },
    select: { id: true },
  })

  const [studentMember, rankedPromoterMember, newPromoterMember] = await Promise.all([
    db.lineageTreeMember.create({
      data: {
        id: tag("student-member"),
        treeId: tree.id,
        nodeId: studentNode.id,
        rankAwardId: null,
        visualSortOrder: 0,
      },
      select: { id: true },
    }),
    db.lineageTreeMember.create({
      data: {
        id: tag("ranked-promoter-member"),
        treeId: tree.id,
        nodeId: rankedPromoterNode.id,
        rankAwardId: null,
        visualSortOrder: 1,
      },
      select: { id: true },
    }),
    db.lineageTreeMember.create({
      data: {
        id: tag("new-promoter-member"),
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
      id: tag("tree-access"),
      treeId: tree.id,
      userId: editorUser.id,
      role: "TREE_EDITOR",
    },
    select: { id: true },
  })

  const relationship = await db.lineageRelationship.create({
    data: {
      id: tag("ranked-promotion"),
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

  fx = {
    editorUserId: editorUser.id,
    studentUserId: studentUser.id,
    rankedPromoterUserId: rankedPromoterUser.id,
    newPromoterUserId: newPromoterUser.id,
    treeId: tree.id,
    studentNodeId: studentNode.id,
    rankedPromoterNodeId: rankedPromoterNode.id,
    newPromoterNodeId: newPromoterNode.id,
    studentMemberId: studentMember.id,
    rankedPromoterMemberId: rankedPromoterMember.id,
    newPromoterMemberId: newPromoterMember.id,
    rankAwardId: rankAward.id,
    rankId: rank.id,
    rankSystemId: rankSystem.id,
    disciplineId: discipline.id,
    relationshipId: relationship.id,
    userIds: [editorUser.id, studentUser.id, rankedPromoterUser.id, newPromoterUser.id],
  }
})

afterAll(async () => {
  if (!fx) return

  await db.auditLog.deleteMany({ where: { userId: fx.editorUserId } })
  await db.lineageTreeAccess.deleteMany({ where: { treeId: fx.treeId } })
  await db.lineageTreeMember.deleteMany({ where: { treeId: fx.treeId } })
  await db.lineageTree.deleteMany({ where: { id: fx.treeId } })
  await db.lineageRelationship.deleteMany({
    where: {
      OR: [{ rankAwardId: fx.rankAwardId }, { toNodeId: fx.studentNodeId }],
    },
  })
  await db.lineageNode.deleteMany({
    where: { id: { in: [fx.studentNodeId, fx.rankedPromoterNodeId, fx.newPromoterNodeId] } },
  })
  await db.rankAward.deleteMany({ where: { id: fx.rankAwardId } })
  await db.rank.deleteMany({ where: { id: fx.rankId } })
  await db.rankSystem.deleteMany({ where: { id: fx.rankSystemId } })
  await db.discipline.deleteMany({ where: { id: fx.disciplineId } })
  await db.user.deleteMany({ where: { id: { in: fx.userIds } } })
})

describe("applyLineagePromotionRelationshipUpdate", () => {
  it("creates a null-rank PROMOTED_BY relationship without touching ranked promotions", async () => {
    const result = await applyLineagePromotionRelationshipUpdate({
      db,
      brand: TEST_BRAND as Brand,
      userId: fx!.editorUserId,
      input: {
        treeId: fx!.treeId,
        memberId: fx!.studentMemberId,
        promoterMemberId: fx!.newPromoterMemberId,
        auditNote: "Update promoter for an unranked tree member.",
      },
    })

    expect(result.relationshipId).not.toBeNull()

    const rankedRelationship = await db.lineageRelationship.findUnique({
      where: { id: fx!.relationshipId },
      select: { fromNodeId: true, rankAwardId: true },
    })

    expect(rankedRelationship?.rankAwardId).toBe(fx!.rankAwardId)
    expect(rankedRelationship?.fromNodeId).toBe(fx!.rankedPromoterNodeId)

    const unrankedRelationship = await db.lineageRelationship.findUnique({
      where: { id: result.relationshipId! },
      select: { fromNodeId: true, toNodeId: true, rankAwardId: true, endedAt: true },
    })

    expect(unrankedRelationship?.toNodeId).toBe(fx!.studentNodeId)
    expect(unrankedRelationship?.fromNodeId).toBe(fx!.newPromoterNodeId)
    expect(unrankedRelationship?.rankAwardId).toBeNull()
    expect(unrankedRelationship?.endedAt).toBeNull()
  })
})
