/**
 * SESSION_0185/0186 — durable lineage claim review integration tests.
 *
 * Run: cd apps/web && bun test server/admin/lineage/claim-review-actions.test.ts
 *
 * Author: Cody / SESSION_0185 TASK_01.
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"

mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  revalidateTag: () => {},
}))

const TEST_BRAND = "BASELINE_MARTIAL_ARTS" as const
mock.module("~/lib/brand-context", () => ({
  getRequestBrand: () => Promise.resolve(TEST_BRAND),
}))

const mockSession: { user: { id: string; role: string } } | null = null
mock.module("~/lib/auth", () => ({
  getServerSession: () => Promise.resolve(mockSession),
}))

import type { Brand, LineageClaimStatus } from "~/.generated/prisma/client"
import {
  applyLineageClaimReview,
  CLAIM_REVIEW_ERROR,
} from "~/server/admin/lineage/claim-review-actions"
import { db } from "~/services/db"

const TS = Date.now()
const PREFIX = `session-0186-${TS}`
const tag = (name: string) => `${PREFIX}-${name}`

type ClaimFixture = {
  treeId: string
  nodeId: string
  memberId: string
  claimId: string
  claimantUserId: string
  placeholderUserId: string
}

let adminUserId: string | null = null

const expectRejectsWithMessage = async (promise: Promise<unknown>, message: string) => {
  try {
    await promise
    throw new Error("Expected promise to reject")
  } catch (error) {
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe(message)
  }
}

const createUser = async (name: string, options: { isPlaceholder?: boolean } = {}) => {
  return db.user.create({
    data: {
      id: tag(name),
      name: tag(name),
      email: `${tag(name)}@test.local`,
      role: name.includes("admin") ? "admin" : "user",
      isPlaceholder: options.isPlaceholder ?? false,
    },
  })
}

const createClaimFixture = async ({
  name,
  status = "PENDING",
  brand = TEST_BRAND,
  claimantOwnsDifferentNode = false,
  placeholderOwner = true,
}: {
  name: string
  status?: LineageClaimStatus
  brand?: Brand
  claimantOwnsDifferentNode?: boolean
  placeholderOwner?: boolean
}): Promise<ClaimFixture> => {
  const placeholder = await createUser(`${name}-placeholder`, { isPlaceholder: placeholderOwner })
  const claimant = await createUser(`${name}-claimant`)

  if (claimantOwnsDifferentNode) {
    await db.lineageNode.create({
      data: {
        id: tag(`${name}-claimant-existing-node`),
        userId: claimant.id,
        slug: tag(`${name}-claimant-existing-node`),
        visibility: "PUBLIC",
        verificationStatus: "PENDING",
      },
    })
  }

  const node = await db.lineageNode.create({
    data: {
      id: tag(`${name}-node`),
      userId: placeholder.id,
      slug: tag(`${name}-node`),
      visibility: "PUBLIC",
      verificationStatus: "PENDING",
    },
  })

  const tree = await db.lineageTree.create({
    data: {
      id: tag(`${name}-tree`),
      brand,
      slug: tag(`${name}-tree`),
      name: tag(`${name}-tree`),
      visibility: "PUBLIC",
      isPublished: true,
      scopeType: "DISCIPLINE",
    },
  })

  const member = await db.lineageTreeMember.create({
    data: {
      id: tag(`${name}-member`),
      treeId: tree.id,
      nodeId: node.id,
      visualSortOrder: 0,
    },
  })

  const claim = await db.lineageClaimRequest.create({
    data: {
      id: tag(`${name}-claim`),
      treeId: tree.id,
      nodeId: node.id,
      claimantUserId: claimant.id,
      status,
    },
  })

  return {
    treeId: tree.id,
    nodeId: node.id,
    memberId: member.id,
    claimId: claim.id,
    claimantUserId: claimant.id,
    placeholderUserId: placeholder.id,
  }
}

beforeAll(async () => {
  const admin = await createUser("admin")
  adminUserId = admin.id
})

afterAll(async () => {
  await db.auditLog.deleteMany({
    where: {
      OR: [{ entityId: { startsWith: PREFIX } }, { userId: { startsWith: PREFIX } }],
    },
  })
  await db.lineageTreeAccess.deleteMany({
    where: {
      OR: [
        { treeId: { startsWith: PREFIX } },
        { userId: { startsWith: PREFIX } },
        { nodeId: { startsWith: PREFIX } },
        { memberId: { startsWith: PREFIX } },
      ],
    },
  })
  await db.lineageClaimEvidence.deleteMany({
    where: { claimRequest: { id: { startsWith: PREFIX } } },
  })
  await db.lineageClaimRequest.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.lineageTreeMember.deleteMany({
    where: {
      OR: [{ id: { startsWith: PREFIX } }, { treeId: { startsWith: PREFIX } }],
    },
  })
  await db.lineageTree.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.lineageNode.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.user.deleteMany({ where: { id: { startsWith: PREFIX } } })
})

describe("applyLineageClaimReview", () => {
  it("approves a claim, transfers node ownership, creates NODE_EDITOR access, and audits", async () => {
    const fx = await createClaimFixture({ name: "approve" })

    const result = await applyLineageClaimReview({
      db,
      brand: TEST_BRAND,
      reviewerUserId: adminUserId!,
      input: {
        claimId: fx.claimId,
        decision: "APPROVED",
        reviewerNote: "Verified identity.",
      },
    })

    expect(result.status).toBe("APPROVED")
    expect(result.nodeId).toBe(fx.nodeId)
    expect(result.ownershipTransferred).toBe(true)
    expect(result.accessGrantId).toBeTruthy()

    const [claim, node, grant, audit, placeholderOwner, claimant] = await Promise.all([
      db.lineageClaimRequest.findUnique({ where: { id: fx.claimId } }),
      db.lineageNode.findUnique({ where: { id: fx.nodeId } }),
      db.lineageTreeAccess.findFirst({
        where: {
          treeId: fx.treeId,
          userId: fx.claimantUserId,
          nodeId: fx.nodeId,
          memberId: fx.memberId,
          role: "NODE_EDITOR",
          revokedAt: null,
        },
      }),
      db.auditLog.findFirst({
        where: {
          entityType: "LineageClaimRequest",
          entityId: fx.claimId,
          action: "lineage.claim.reviewed",
        },
      }),
      db.user.findUnique({ where: { id: fx.placeholderUserId } }),
      db.user.findUnique({ where: { id: fx.claimantUserId } }),
    ])
    const auditAfter = audit?.after as Record<string, unknown> | null

    expect(claim?.status).toBe("APPROVED")
    expect(claim?.reviewedById).toBe(adminUserId)
    expect(claim?.reviewerNote).toBe("Verified identity.")
    expect(node?.userId).toBe(fx.claimantUserId)
    expect(grant?.id).toBe(result.accessGrantId)
    expect(result.placeholderArchivedUserId).toBe(fx.placeholderUserId)
    expect(result.placeholderArchivedAt).toBeInstanceOf(Date)
    expect(placeholderOwner?.isPlaceholder).toBe(true)
    expect(placeholderOwner?.archivedAt).toBeInstanceOf(Date)
    expect(placeholderOwner?.archivedAt?.toISOString()).toBe(
      result.placeholderArchivedAt?.toISOString(),
    )
    expect(claimant?.archivedAt).toBeNull()
    expect(audit?.userId).toBe(adminUserId)
    expect(audit?.after).toMatchObject({
      claimId: fx.claimId,
      treeId: fx.treeId,
      nodeId: fx.nodeId,
      claimantUserId: fx.claimantUserId,
      status: "APPROVED",
      reviewerUserId: adminUserId,
      accessGrantId: grant?.id,
      ownershipTransferred: true,
      placeholderArchivedUserId: fx.placeholderUserId,
      placeholderArchivedAt: result.placeholderArchivedAt?.toISOString(),
      evidenceCount: 0,
    })
    expect(auditAfter?.placeholderArchivedAt).toBe(result.placeholderArchivedAt?.toISOString())
  })

  it("keeps non-approved decisions as status-only review outcomes with audit", async () => {
    const fx = await createClaimFixture({ name: "needs-info" })

    const result = await applyLineageClaimReview({
      db,
      brand: TEST_BRAND,
      reviewerUserId: adminUserId!,
      input: {
        claimId: fx.claimId,
        decision: "NEEDS_INFO",
        reviewerNote: "Please add certificate evidence.",
      },
    })

    const [claim, node, grants, audit, placeholderOwner] = await Promise.all([
      db.lineageClaimRequest.findUnique({ where: { id: fx.claimId } }),
      db.lineageNode.findUnique({ where: { id: fx.nodeId } }),
      db.lineageTreeAccess.findMany({ where: { treeId: fx.treeId } }),
      db.auditLog.findFirst({
        where: {
          entityType: "LineageClaimRequest",
          entityId: fx.claimId,
          action: "lineage.claim.reviewed",
        },
      }),
      db.user.findUnique({ where: { id: fx.placeholderUserId } }),
    ])

    expect(result.status).toBe("NEEDS_INFO")
    expect(result.accessGrantId).toBeNull()
    expect(result.ownershipTransferred).toBe(false)
    expect(result.placeholderArchivedUserId).toBeNull()
    expect(result.placeholderArchivedAt).toBeNull()
    expect(claim?.status).toBe("NEEDS_INFO")
    expect(node?.userId).toBe(fx.placeholderUserId)
    expect(grants).toHaveLength(0)
    expect(placeholderOwner?.isPlaceholder).toBe(true)
    expect(placeholderOwner?.archivedAt).toBeNull()
    expect(audit?.after).toMatchObject({
      claimId: fx.claimId,
      treeId: fx.treeId,
      nodeId: fx.nodeId,
      claimantUserId: fx.claimantUserId,
      status: "NEEDS_INFO",
      reviewerUserId: adminUserId,
      accessGrantId: null,
      ownershipTransferred: false,
      placeholderArchivedUserId: null,
      placeholderArchivedAt: null,
      evidenceCount: 0,
    })
  })

  it("does not archive a prior real user when ownership transfers from a non-placeholder owner", async () => {
    const fx = await createClaimFixture({
      name: "real-owner",
      placeholderOwner: false,
    })

    const result = await applyLineageClaimReview({
      db,
      brand: TEST_BRAND,
      reviewerUserId: adminUserId!,
      input: {
        claimId: fx.claimId,
        decision: "APPROVED",
      },
    })

    const [priorOwner, audit] = await Promise.all([
      db.user.findUnique({ where: { id: fx.placeholderUserId } }),
      db.auditLog.findFirst({
        where: {
          entityType: "LineageClaimRequest",
          entityId: fx.claimId,
          action: "lineage.claim.reviewed",
        },
      }),
    ])

    expect(result.status).toBe("APPROVED")
    expect(result.ownershipTransferred).toBe(true)
    expect(result.placeholderArchivedUserId).toBeNull()
    expect(result.placeholderArchivedAt).toBeNull()
    expect(priorOwner?.isPlaceholder).toBe(false)
    expect(priorOwner?.archivedAt).toBeNull()
    expect(audit?.after).toMatchObject({
      status: "APPROVED",
      placeholderArchivedUserId: null,
      placeholderArchivedAt: null,
    })
  })

  it("rejects approval when a different claimant is already approved for the same tree and node", async () => {
    const fx = await createClaimFixture({ name: "duplicate-approved" })
    const otherClaimant = await createUser("duplicate-approved-other-claimant")

    await db.lineageClaimRequest.create({
      data: {
        id: tag("duplicate-approved-existing-claim"),
        treeId: fx.treeId,
        nodeId: fx.nodeId,
        claimantUserId: otherClaimant.id,
        status: "APPROVED",
        reviewedById: adminUserId!,
        reviewedAt: new Date(),
      },
    })

    await expectRejectsWithMessage(
      applyLineageClaimReview({
        db,
        brand: TEST_BRAND,
        reviewerUserId: adminUserId!,
        input: { claimId: fx.claimId, decision: "APPROVED" },
      }),
      CLAIM_REVIEW_ERROR.NODE_ALREADY_APPROVED,
    )
  })

  it("rejects approval when claimant already owns a different lineage node", async () => {
    const fx = await createClaimFixture({
      name: "claimant-has-node",
      claimantOwnsDifferentNode: true,
    })

    await expectRejectsWithMessage(
      applyLineageClaimReview({
        db,
        brand: TEST_BRAND,
        reviewerUserId: adminUserId!,
        input: { claimId: fx.claimId, decision: "APPROVED" },
      }),
      CLAIM_REVIEW_ERROR.CLAIMANT_HAS_NODE,
    )
  })

  it("rejects review of terminal claims", async () => {
    const fx = await createClaimFixture({ name: "terminal", status: "APPROVED" })

    await expectRejectsWithMessage(
      applyLineageClaimReview({
        db,
        brand: TEST_BRAND,
        reviewerUserId: adminUserId!,
        input: { claimId: fx.claimId, decision: "DENIED" },
      }),
      CLAIM_REVIEW_ERROR.NOT_REVIEWABLE,
    )
  })

  it("rejects review when claim belongs to another brand", async () => {
    const fx = await createClaimFixture({ name: "wrong-brand" })

    await expectRejectsWithMessage(
      applyLineageClaimReview({
        db,
        brand: "RONIN_DOJO_DESIGN" as Brand,
        reviewerUserId: adminUserId!,
        input: { claimId: fx.claimId, decision: "APPROVED" },
      }),
      CLAIM_REVIEW_ERROR.NOT_FOUND,
    )
  })
})
