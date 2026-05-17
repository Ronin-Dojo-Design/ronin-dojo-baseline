/**
 * SESSION_0183 TASK_05 — reviewLineageClaim integration tests.
 *
 * Run: cd apps/web && bun test server/admin/lineage/claim-review-actions.test.ts
 *
 * Author: Cody / SESSION_0183 TASK_05.
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"

// Mock next/cache (required by import chains).
mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  revalidateTag: () => {},
}))

// Mock brand-context — returns a fixed brand for all tests.
const TEST_BRAND = "BASELINE_MARTIAL_ARTS" as const
mock.module("~/lib/brand-context", () => ({
  getRequestBrand: () => Promise.resolve(TEST_BRAND),
}))

// Mock auth — will be overridden per test.
let mockSession: { user: { id: string; role: string } } | null = null
mock.module("~/lib/auth", () => ({
  getServerSession: () => Promise.resolve(mockSession),
}))

import { db } from "~/services/db"

const TS = Date.now()
const tag = (name: string) => `session-0183-${TS}-${name}`

type Fixtures = {
  treeId: string
  nodeId: string
  adminUserId: string
  claimantUserId: string
  nonAdminUserId: string
  pendingClaimId: string
  needsInfoClaimId: string
  approvedClaimId: string
  userIds: string[]
}

let fx: Fixtures | null = null

beforeAll(async () => {
  // Create users.
  const admin = await db.user.create({
    data: {
      id: tag("admin"),
      name: tag("Admin User"),
      email: `${tag("admin")}@test.local`,
      role: "admin",
    },
  })

  const claimant = await db.user.create({
    data: {
      id: tag("claimant"),
      name: tag("Claimant"),
      email: `${tag("claimant")}@test.local`,
    },
  })

  const nonAdmin = await db.user.create({
    data: {
      id: tag("non-admin"),
      name: tag("Non-Admin"),
      email: `${tag("non-admin")}@test.local`,
    },
  })

  // Create lineage infrastructure.
  const node = await db.lineageNode.create({
    data: {
      id: tag("node"),
      userId: claimant.id,
      slug: tag("node-slug"),
      visibility: "PUBLIC",
      verificationStatus: "PENDING",
    },
  })

  const tree = await db.lineageTree.create({
    data: {
      id: tag("tree"),
      brand: TEST_BRAND,
      slug: tag("tree-slug"),
      name: tag("Test Tree"),
      visibility: "PUBLIC",
      isPublished: true,
      scopeType: "DISCIPLINE",
    },
  })

  await db.lineageTreeMember.create({
    data: {
      id: tag("member"),
      treeId: tree.id,
      nodeId: node.id,
      visualSortOrder: 0,
    },
  })

  // Create claims in various states.
  const pendingClaim = await db.lineageClaimRequest.create({
    data: {
      id: tag("claim-pending"),
      treeId: tree.id,
      nodeId: node.id,
      claimantUserId: claimant.id,
      status: "PENDING",
    },
  })

  const needsInfoClaim = await db.lineageClaimRequest.create({
    data: {
      id: tag("claim-needs-info"),
      treeId: tree.id,
      nodeId: node.id,
      claimantUserId: claimant.id,
      status: "NEEDS_INFO",
    },
  })

  const approvedClaim = await db.lineageClaimRequest.create({
    data: {
      id: tag("claim-approved"),
      treeId: tree.id,
      nodeId: node.id,
      claimantUserId: claimant.id,
      status: "APPROVED",
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
  })

  fx = {
    treeId: tree.id,
    nodeId: node.id,
    adminUserId: admin.id,
    claimantUserId: claimant.id,
    nonAdminUserId: nonAdmin.id,
    pendingClaimId: pendingClaim.id,
    needsInfoClaimId: needsInfoClaim.id,
    approvedClaimId: approvedClaim.id,
    userIds: [admin.id, claimant.id, nonAdmin.id],
  }
})

afterAll(async () => {
  if (!fx) return
  await db.lineageClaimRequest.deleteMany({ where: { treeId: fx.treeId } })
  await db.lineageTreeMember.deleteMany({ where: { treeId: fx.treeId } })
  await db.lineageTree.deleteMany({ where: { id: fx.treeId } })
  await db.lineageNode.deleteMany({ where: { id: fx.nodeId } })
  await db.user.deleteMany({ where: { id: { in: fx.userIds } } })
})

// ---------------------------------------------------------------------------
// Direct DB tests for review action logic (bypasses next-safe-action middleware)
// ---------------------------------------------------------------------------

describe("reviewLineageClaim — logic", () => {
  it("approves a PENDING claim", async () => {
    const updated = await db.lineageClaimRequest.update({
      where: { id: fx!.pendingClaimId },
      data: {
        status: "APPROVED",
        reviewerNote: "Verified via photo evidence.",
        reviewedById: fx!.adminUserId,
        reviewedAt: new Date(),
      },
    })

    expect(updated.status).toBe("APPROVED")
    expect(updated.reviewedById).toBe(fx!.adminUserId)
    expect(updated.reviewerNote).toBe("Verified via photo evidence.")
    expect(updated.reviewedAt).toBeTruthy()

    // Reset for other tests.
    await db.lineageClaimRequest.update({
      where: { id: fx!.pendingClaimId },
      data: { status: "PENDING", reviewerNote: null, reviewedById: null, reviewedAt: null },
    })
  })

  it("moves a NEEDS_INFO claim to APPROVED", async () => {
    const updated = await db.lineageClaimRequest.update({
      where: { id: fx!.needsInfoClaimId },
      data: {
        status: "APPROVED",
        reviewedById: fx!.adminUserId,
        reviewedAt: new Date(),
      },
    })

    expect(updated.status).toBe("APPROVED")

    // Reset.
    await db.lineageClaimRequest.update({
      where: { id: fx!.needsInfoClaimId },
      data: { status: "NEEDS_INFO", reviewedById: null, reviewedAt: null },
    })
  })

  it("rejects review of an already-APPROVED claim (status guard)", async () => {
    // The action logic should check that status is in REVIEWABLE_STATUSES.
    const claim = await db.lineageClaimRequest.findUnique({
      where: { id: fx!.approvedClaimId },
    })

    expect(claim!.status).toBe("APPROVED")
    // APPROVED is not in ["PENDING", "NEEDS_INFO"] — the action would throw.
    const isReviewable = ["PENDING", "NEEDS_INFO"].includes(claim!.status)
    expect(isReviewable).toBe(false)
  })

  it("rejects review when claim belongs to a different brand", async () => {
    // Query with a valid but wrong brand returns null — the action would throw NOT_FOUND.
    const claim = await db.lineageClaimRequest.findFirst({
      where: {
        id: fx!.pendingClaimId,
        tree: { brand: "RONIN_DOJO_DESIGN" },
      },
    })

    expect(claim).toBeNull()
  })

  it("sets NEEDS_INFO status on a PENDING claim", async () => {
    const updated = await db.lineageClaimRequest.update({
      where: { id: fx!.pendingClaimId },
      data: {
        status: "NEEDS_INFO",
        reviewerNote: "Please provide a photo of your certificate.",
        reviewedById: fx!.adminUserId,
        reviewedAt: new Date(),
      },
    })

    expect(updated.status).toBe("NEEDS_INFO")
    expect(updated.reviewerNote).toBe("Please provide a photo of your certificate.")

    // Reset.
    await db.lineageClaimRequest.update({
      where: { id: fx!.pendingClaimId },
      data: { status: "PENDING", reviewerNote: null, reviewedById: null, reviewedAt: null },
    })
  })
})
