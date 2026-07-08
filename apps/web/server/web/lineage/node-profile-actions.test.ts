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

// The helper under test receives `brand` directly as a parameter, so no
// brand-context mock is needed (production code inlines Brand.BBL post brand-prune).
const TEST_BRAND = "BASELINE_MARTIAL_ARTS" as const

// Mock auth — not used by the helper tests, but required by userActionClient.
const mockSession: { user: { id: string; role: string } } | null = null
mock.module("~/lib/auth", () => ({
  getServerSession: () => Promise.resolve(mockSession),
}))

import type { Brand } from "~/.generated/prisma/client"
import { applyLineageNodeProfileUpdate } from "~/server/web/lineage/node-profile-actions"
import { LINEAGE_NODE_PROFILE_ERROR } from "~/server/web/lineage/node-profile-errors"
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
  noAccessClaimantUserId: string
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

  const noAccessClaimant = await db.user.create({
    data: {
      id: tag("no-access-claimant"),
      name: tag("No Access Claimant"),
      email: `${tag("no-access-claimant")}@test.local`,
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
      passport: {
        connectOrCreate: {
          where: { userId: approvedClaimant.id },
          create: { userId: approvedClaimant.id },
        },
      },
      rank: { connect: { id: rank.id } },
      awardedAt: new Date(Date.UTC(2020, 0, 1)),
    },
  })

  const node = await db.lineageNode.create({
    data: {
      id: tag("node"),
      passport: {
        connectOrCreate: {
          where: { userId: approvedClaimant.id },
          create: { userId: approvedClaimant.id },
        },
      },
      slug: tag("node-slug"),
      bio: "Original lineage bio",
      visibility: "PUBLIC",
      verificationStatus: "PENDING",
    },
  })

  const orphanNode = await db.lineageNode.create({
    data: {
      id: tag("orphan-node"),
      passport: {
        connectOrCreate: { where: { userId: orphanUser.id }, create: { userId: orphanUser.id } },
      },
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
      visualSortOrder: 0,
    },
  })

  await db.lineageTreeAccess.create({
    data: {
      id: tag("node-editor-grant"),
      treeId: tree.id,
      userId: approvedClaimant.id,
      role: "NODE_EDITOR",
      nodeId: node.id,
      memberId: member.id,
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
      id: tag("claim-approved-no-access"),
      treeId: tree.id,
      nodeId: node.id,
      claimantUserId: noAccessClaimant.id,
      status: "APPROVED",
      reviewedAt: new Date(),
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
    noAccessClaimantUserId: noAccessClaimant.id,
    userIds: [approvedClaimant.id, noAccessClaimant.id, orphanUser.id],
  }
})

afterAll(async () => {
  if (!fx) return

  await db.lineageClaimEvidence.deleteMany({
    where: { claimRequest: { treeId: fx.treeId } },
  })
  await db.lineageTreeAccess.deleteMany({ where: { treeId: fx.treeId } })
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
    expect(editable?.node.passport?.displayName).toBe("Original Display Name")
    expect(editable?.member.id).toBe(fx!.memberId)
    expect(editable?.member.currentRankAward?.awardedAt?.toISOString()).toBe(
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

    const [passport, rankAward] = await Promise.all([
      db.passport.findUnique({
        where: { userId: fx!.approvedClaimantUserId },
      }),
      db.rankAward.findUnique({ where: { id: fx!.rankAwardId } }),
    ])

    expect(passport?.displayName).toBe("Updated Display Name")
    expect(passport?.avatarUrl).toBe("https://example.com/updated-avatar.jpg")
    // Bio Slice A (SESSION_0510 TASK_04): bio is folded onto the Passport — the writer no
    // longer touches `LineageNode.bio`. Assert bio landed on the Passport (the SoT).
    expect(passport?.bio).toBe("Updated lineage bio")
    expect(rankAward?.awardedAt?.toISOString()).toBe(promotionDate.toISOString())
  })

  // SESSION_0496 TASK_06 — the DirectoryProfile country upsert. The CREATE branch must pin
  // visibility HIDDEN + slug null (the schema default MEMBERS_ONLY would leak the steward
  // stub into member-facing directory listings); the UPDATE branch must set ONLY the
  // country — never clobber an owner's visibility/slug.
  it("locationCountry upsert: create pins HIDDEN + null slug; update touches only the country", async () => {
    const passport = await db.passport.findUnique({
      where: { userId: fx!.approvedClaimantUserId },
      select: { id: true },
    })
    expect(passport).not.toBeNull()

    // Pin the skip semantics first: every earlier update omitted locationCountry
    // (undefined), so no profile stub may exist yet.
    const before = await db.directoryProfile.findUnique({ where: { passportId: passport!.id } })
    expect(before).toBeNull()

    const baseInput = {
      treeId: fx!.treeId,
      nodeId: fx!.nodeId,
      displayName: "Updated Display Name",
      bio: "Updated lineage bio",
      avatarUrl: "https://example.com/updated-avatar.jpg",
    }

    // CREATE branch: no profile exists → the upsert creates the HIDDEN, slug-less stub.
    await applyLineageNodeProfileUpdate({
      db,
      brand: TEST_BRAND,
      userId: fx!.approvedClaimantUserId,
      input: { ...baseInput, locationCountry: "BR" },
    })

    const created = await db.directoryProfile.findUnique({ where: { passportId: passport!.id } })
    expect(created?.locationCountry).toBe("BR")
    expect(created?.visibility).toBe("HIDDEN")
    expect(created?.slug).toBeNull()

    // Simulate an owner-configured profile, then prove the UPDATE branch leaves it alone.
    await db.directoryProfile.update({
      where: { passportId: passport!.id },
      data: { visibility: "PUBLIC", slug: tag("owner-slug") },
    })

    await applyLineageNodeProfileUpdate({
      db,
      brand: TEST_BRAND,
      userId: fx!.approvedClaimantUserId,
      input: { ...baseInput, locationCountry: "US" },
    })

    const updated = await db.directoryProfile.findUnique({ where: { passportId: passport!.id } })
    expect(updated?.locationCountry).toBe("US")
    expect(updated?.visibility).toBe("PUBLIC")
    expect(updated?.slug).toBe(tag("owner-slug"))

    // null clears the column without touching anything else.
    await applyLineageNodeProfileUpdate({
      db,
      brand: TEST_BRAND,
      userId: fx!.approvedClaimantUserId,
      input: { ...baseInput, locationCountry: null },
    })
    const cleared = await db.directoryProfile.findUnique({ where: { passportId: passport!.id } })
    expect(cleared?.locationCountry).toBeNull()
    expect(cleared?.visibility).toBe("PUBLIC")
  })

  it("denies update when the claimant has an APPROVED claim but no access grant", async () => {
    await expectRejectsWithMessage(
      applyLineageNodeProfileUpdate({
        db,
        brand: TEST_BRAND,
        userId: fx!.noAccessClaimantUserId,
        input: {
          treeId: fx!.treeId,
          nodeId: fx!.nodeId,
          displayName: "No Access Claimant",
          bio: "Should not update",
          avatarUrl: "https://example.com/no-access-avatar.jpg",
        },
      }),
      LINEAGE_NODE_PROFILE_ERROR.ACCESS_GRANT_REQUIRED,
    )

    const editable = await getEditableLineageNodeProfile({
      brand: TEST_BRAND,
      treeSlug: fx!.treeSlug,
      nodeId: fx!.nodeId,
      userId: fx!.noAccessClaimantUserId,
    })
    expect(editable).toBeNull()
  })

  it("ignores revoked NODE_EDITOR grants", async () => {
    await db.lineageTreeAccess.create({
      data: {
        id: tag("revoked-node-editor-grant"),
        treeId: fx!.treeId,
        userId: fx!.noAccessClaimantUserId,
        role: "NODE_EDITOR",
        nodeId: fx!.nodeId,
        memberId: fx!.memberId,
        revokedAt: new Date(),
      },
    })

    await expectRejectsWithMessage(
      applyLineageNodeProfileUpdate({
        db,
        brand: TEST_BRAND,
        userId: fx!.noAccessClaimantUserId,
        input: {
          treeId: fx!.treeId,
          nodeId: fx!.nodeId,
          displayName: "Revoked Grant",
          bio: "Should not update",
          avatarUrl: "https://example.com/revoked-avatar.jpg",
        },
      }),
      LINEAGE_NODE_PROFILE_ERROR.ACCESS_GRANT_REQUIRED,
    )
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
