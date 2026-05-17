/**
 * SESSION_0184 TASK_03 — approved-claim lineage node profile tests.
 *
 * Run: cd apps/web && bun test server/web/lineage/node-profile-actions.test.ts
 *
 * The server action itself is wrapped in next-safe-action middleware that
 * requires live Next request state. These DB-backed tests exercise the
 * exported helper used by the action plus the claimant-scoped read query.
 *
 * Author: Cody / SESSION_0184 TASK_03.
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
// imports getRequestBrand for the safe-action wrapper.
const TEST_BRAND = "BASELINE_MARTIAL_ARTS" as const
mock.module("~/lib/brand-context", () => ({
  getRequestBrand: () => Promise.resolve(TEST_BRAND),
}))

// Mock auth — not used by the helper tests, but required by userActionClient.
let mockSession: { user: { id: string; role: string } } | null = null
mock.module("~/lib/auth", () => ({
  getServerSession: () => Promise.resolve(mockSession),
}))

import type { Brand } from "~/.generated/prisma/client"
import {
  LINEAGE_NODE_PROFILE_ERROR,
  applyLineageNodeProfileUpdate,
} from "~/server/web/lineage/node-profile-actions"
import { getEditableLineageNodeProfile } from "~/server/web/lineage/node-profile-queries"
import { db } from "~/services/db"

const TS = Date.now()
const tag = (name: string) => `session-0184-${TS}-${name}`

type Fixtures = {
  treeId: string
  treeSlug: string
  nodeId: string
  orphanNodeId: string
  memberId: string
  rankAwardId: string
  disciplineId: string
  rankSystemId: string
  rankId: string
  approvedClaimantUserId: string
  pendingClaimantUserId: string
  userIds: string[]
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

beforeAll(async () => {
  const approvedClaimant = await db.user.create({
    data: {
      id: tag("approved-claimant"),
      name: tag("Approved Claimant"),
      email: `${tag("approved-claimant")}@test.local`,
    },
  })

  const pendingClaimant = await db.user.create({
    data: {
      id: tag("pending-claimant"),
      name: tag("Pending Claimant"),
      email: `${tag("pending-claimant")}@test.local`,
    },
  })

  const orphanUser = await db.user.create({
    data: {
      id: tag("orphan-user"),
      name: tag("Orphan User"),
      email: `${tag("orphan-user")}@test.local`,
    },
  })

  await db.passport.create({
    data: {
      userId: approvedClaimant.id,
      displayName: "Original Display Name",
      avatarUrl: "https://example.com/original-avatar.jpg",
    },
  })

  const discipline = await db.discipline.create({
    data: {
      id: tag("discipline"),
      brand: TEST_BRAND,
      name: tag("Discipline"),
      slug: tag("discipline"),
      code: tag("DISC").slice(0, 16),
    },
  })

  const rankSystem = await db.rankSystem.create({
    data: {
      id: tag("rank-system"),
      brand: TEST_BRAND,
      name: tag("Rank System"),
      disciplineId: discipline.id,
    },
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
  })

  const rankAward = await db.rankAward.create({
    data: {
      id: tag("rank-award"),
      userId: approvedClaimant.id,
      rankId: rank.id,
      awardedAt: new Date(Date.UTC(2020, 0, 1)),
    },
  })

  const node = await db.lineageNode.create({
    data: {
      id: tag("node"),
      userId: approvedClaimant.id,
      slug: tag("node-slug"),
      bio: "Original lineage bio",
      visibility: "PUBLIC",
      verificationStatus: "PENDING",
    },
  })

  const orphanNode = await db.lineageNode.create({
    data: {
      id: tag("orphan-node"),
      userId: orphanUser.id,
      slug: tag("orphan-node-slug"),
      visibility: "PUBLIC",
      verificationStatus: "PENDING",
    },
  })

  const tree = await db.lineageTree.create({
    data: {
      id: tag("tree"),
      brand: TEST_BRAND,
      slug: tag("tree-slug"),
      name: tag("Test Lineage Tree"),
      visibility: "PUBLIC",
      isPublished: true,
      scopeType: "DISCIPLINE",
    },
  })

  const member = await db.lineageTreeMember.create({
    data: {
      id: tag("member"),
      treeId: tree.id,
      nodeId: node.id,
      rankAwardId: rankAward.id,
      visualSortOrder: 0,
    },
  })

  await db.lineageClaimRequest.create({
    data: {
      id: tag("claim-approved"),
      treeId: tree.id,
      nodeId: node.id,
      claimantUserId: approvedClaimant.id,
      status: "APPROVED",
      reviewedAt: new Date(),
    },
  })

  await db.lineageClaimRequest.create({
    data: {
      id: tag("claim-pending"),
      treeId: tree.id,
      nodeId: node.id,
      claimantUserId: pendingClaimant.id,
      status: "PENDING",
    },
  })

  await db.lineageClaimRequest.create({
    data: {
      id: tag("claim-orphan-approved"),
      treeId: tree.id,
      nodeId: orphanNode.id,
      claimantUserId: approvedClaimant.id,
      status: "APPROVED",
      reviewedAt: new Date(),
    },
  })

  fx = {
    treeId: tree.id,
    treeSlug: tree.slug,
    nodeId: node.id,
    orphanNodeId: orphanNode.id,
    memberId: member.id,
    rankAwardId: rankAward.id,
    disciplineId: discipline.id,
    rankSystemId: rankSystem.id,
    rankId: rank.id,
    approvedClaimantUserId: approvedClaimant.id,
    pendingClaimantUserId: pendingClaimant.id,
    userIds: [approvedClaimant.id, pendingClaimant.id, orphanUser.id],
  }
})

afterAll(async () => {
  if (!fx) return

  await db.lineageClaimEvidence.deleteMany({
    where: { claimRequest: { treeId: fx.treeId } },
  })
  await db.lineageClaimRequest.deleteMany({ where: { treeId: fx.treeId } })
  await db.lineageTreeMember.deleteMany({ where: { treeId: fx.treeId } })
  await db.lineageTree.deleteMany({ where: { id: fx.treeId } })
  await db.lineageNode.deleteMany({
    where: { id: { in: [fx.nodeId, fx.orphanNodeId] } },
  })
  await db.rankAward.deleteMany({ where: { id: fx.rankAwardId } })
  await db.rank.deleteMany({ where: { id: fx.rankId } })
  await db.rankSystem.deleteMany({ where: { id: fx.rankSystemId } })
  await db.discipline.deleteMany({ where: { id: fx.disciplineId } })
  await db.passport.deleteMany({ where: { userId: { in: fx.userIds } } })
  await db.user.deleteMany({ where: { id: { in: fx.userIds } } })
})

describe("lineage node profile editing — logic", () => {
  it("returns editable data and updates fields for an APPROVED claimant", async () => {
    const editable = await getEditableLineageNodeProfile({
      brand: TEST_BRAND,
      treeSlug: fx!.treeSlug,
      nodeId: fx!.nodeId,
      userId: fx!.approvedClaimantUserId,
    })

    expect(editable?.tree.id).toBe(fx!.treeId)
    expect(editable?.node.id).toBe(fx!.nodeId)
    expect(editable?.node.user.passport?.displayName).toBe("Original Display Name")
    expect(editable?.member.id).toBe(fx!.memberId)
    expect(editable?.member.selectedRankAward?.awardedAt?.toISOString()).toBe(
      new Date(Date.UTC(2020, 0, 1)).toISOString(),
    )

    const promotionDate = new Date(Date.UTC(2024, 4, 17))
    const result = await applyLineageNodeProfileUpdate({
      db,
      brand: TEST_BRAND,
      userId: fx!.approvedClaimantUserId,
      input: {
        treeId: fx!.treeId,
        nodeId: fx!.nodeId,
        displayName: "Updated Display Name",
        bio: "Updated lineage bio",
        avatarUrl: "https://example.com/updated-avatar.jpg",
        promotionDate,
      },
    })

    expect(result).toEqual({
      treeId: fx!.treeId,
      treeSlug: fx!.treeSlug,
      nodeId: fx!.nodeId,
      memberId: fx!.memberId,
    })

    const [passport, node, rankAward] = await Promise.all([
      db.passport.findUnique({
        where: { userId: fx!.approvedClaimantUserId },
      }),
      db.lineageNode.findUnique({ where: { id: fx!.nodeId } }),
      db.rankAward.findUnique({ where: { id: fx!.rankAwardId } }),
    ])

    expect(passport?.displayName).toBe("Updated Display Name")
    expect(passport?.avatarUrl).toBe("https://example.com/updated-avatar.jpg")
    expect(node?.bio).toBe("Updated lineage bio")
    expect(rankAward?.awardedAt?.toISOString()).toBe(promotionDate.toISOString())
  })

  it("denies update when the claimant only has a PENDING claim", async () => {
    await expectRejectsWithMessage(
      applyLineageNodeProfileUpdate({
        db,
        brand: TEST_BRAND,
        userId: fx!.pendingClaimantUserId,
        input: {
          treeId: fx!.treeId,
          nodeId: fx!.nodeId,
          displayName: "Pending Claimant",
          bio: "Should not update",
          avatarUrl: "https://example.com/pending-avatar.jpg",
        },
      }),
      LINEAGE_NODE_PROFILE_ERROR.APPROVED_CLAIM_REQUIRED,
    )

    const editable = await getEditableLineageNodeProfile({
      brand: TEST_BRAND,
      treeSlug: fx!.treeSlug,
      nodeId: fx!.nodeId,
      userId: fx!.pendingClaimantUserId,
    })
    expect(editable).toBeNull()
  })

  it("denies update when the tree brand does not match the request brand", async () => {
    await expectRejectsWithMessage(
      applyLineageNodeProfileUpdate({
        db,
        brand: "RONIN_DOJO_DESIGN" as Brand,
        userId: fx!.approvedClaimantUserId,
        input: {
          treeId: fx!.treeId,
          nodeId: fx!.nodeId,
          displayName: "Wrong Brand",
          bio: "Should not update",
          avatarUrl: "https://example.com/wrong-brand-avatar.jpg",
        },
      }),
      LINEAGE_NODE_PROFILE_ERROR.TREE_NOT_FOUND,
    )

    const editable = await getEditableLineageNodeProfile({
      brand: "RONIN_DOJO_DESIGN" as Brand,
      treeSlug: fx!.treeSlug,
      nodeId: fx!.nodeId,
      userId: fx!.approvedClaimantUserId,
    })
    expect(editable).toBeNull()
  })

  it("denies update when the node is not a member of the tree", async () => {
    await expectRejectsWithMessage(
      applyLineageNodeProfileUpdate({
        db,
        brand: TEST_BRAND,
        userId: fx!.approvedClaimantUserId,
        input: {
          treeId: fx!.treeId,
          nodeId: fx!.orphanNodeId,
          displayName: "Orphan Node",
          bio: "Should not update",
          avatarUrl: "https://example.com/orphan-avatar.jpg",
        },
      }),
      LINEAGE_NODE_PROFILE_ERROR.NODE_NOT_IN_TREE,
    )

    const editable = await getEditableLineageNodeProfile({
      brand: TEST_BRAND,
      treeSlug: fx!.treeSlug,
      nodeId: fx!.orphanNodeId,
      userId: fx!.approvedClaimantUserId,
    })
    expect(editable).toBeNull()
  })
})
