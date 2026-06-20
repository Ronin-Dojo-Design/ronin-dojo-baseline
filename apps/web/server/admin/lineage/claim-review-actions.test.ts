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

// `applyLineageClaimReview` schedules the claim-approved email via after() (through
// scheduleClaimApprovedEmail). bun's mock.module is process-global, so this test used to
// free-ride on another file's next/server mock depending on run order; mock it here so
// the after() callback runs (fire-and-forget) instead of throwing "outside a request
// scope" when this file runs first. Mirrors capture-email.test.ts (SESSION_0420).
mock.module("next/server", () => ({
  after: (fn: () => void | Promise<void>) => {
    void Promise.resolve().then(() => fn())
  },
}))

const TEST_BRAND = "BASELINE_MARTIAL_ARTS" as const
mock.module("~/lib/brand-context", () => ({
  getRequestBrand: () => Promise.resolve(TEST_BRAND),
}))

const mockSession: { user: { id: string; role: string } } | null = null
mock.module("~/lib/auth", () => ({
  getServerSession: () => Promise.resolve(mockSession),
}))

// Spy on the post-commit lifecycle-email schedulers so the DB test stays hermetic (the real
// modules use next/server `after()` + Resend). Each fixture has a unique nodeId, so filtering by
// nodeId is safe even though the arrays are shared across tests. (SESSION_0420)
const approvedEmailCalls: { userId: string; nodeId: string }[] = []
const rejectedEmailCalls: { userId: string; nodeId: string; reviewerNote?: string | null }[] = []
mock.module("~/server/web/lineage/claim-approved-email", () => ({
  scheduleClaimApprovedEmail: (args: { userId: string; nodeId: string }) =>
    approvedEmailCalls.push(args),
}))
mock.module("~/server/web/lineage/claim-rejected-email", () => ({
  scheduleClaimRejectedEmail: (args: {
    userId: string
    nodeId: string
    reviewerNote?: string | null
  }) => rejectedEmailCalls.push(args),
}))

import type { Brand, LineageClaimStatus } from "~/.generated/prisma/client"
import {
  LINEAGE_ELITE_ENTITLEMENT_KEY,
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
} from "~/lib/entitlements/lineage-comp"
import { applyLineageClaimReview } from "~/server/admin/lineage/claim-review-actions"
import { CLAIM_REVIEW_ERROR } from "~/server/admin/lineage/claim-review-errors"
import { db } from "~/services/db"

const TS = Date.now()
const PREFIX = `session-0186-${TS}`
const tag = (name: string) => `${PREFIX}-${name}`

type ClaimFixture = {
  treeId: string
  nodeId: string
  nodePassportId: string
  memberId: string
  claimId: string
  claimantUserId: string
  placeholderUserId: string
}

let adminUserId: string | null = null
const createdEntitlementIds: string[] = []

async function ensureEntitlement(key: string, name: string) {
  const existing = await db.entitlement.findUnique({
    where: { brand_key: { brand: TEST_BRAND, key } },
  })
  if (existing) return existing

  const entitlement = await db.entitlement.create({
    data: { brand: TEST_BRAND, key, name },
  })
  createdEntitlementIds.push(entitlement.id)
  return entitlement
}

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
        passport: {
          connectOrCreate: {
            where: { userId: claimant.id },
            create: { userId: claimant.id },
          },
        },
        slug: tag(`${name}-claimant-existing-node`),
        visibility: "PUBLIC",
        verificationStatus: "PENDING",
      },
    })
  }

  // Phase 3c (SOT-ADR D1): the claimed node is Passport-rooted. A placeholder owner = an accountless
  // Passport (claimable); otherwise the Passport links the prior account. Approving the claim attaches
  // the claimant account to THIS passport (the node never moves).
  const nodePassport = await db.passport.create({
    data: placeholderOwner ? { displayName: name } : { userId: placeholder.id, displayName: name },
    select: { id: true },
  })

  const node = await db.lineageNode.create({
    data: {
      id: tag(`${name}-node`),
      passportId: nodePassport.id,
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
    nodePassportId: nodePassport.id,
    memberId: member.id,
    claimId: claim.id,
    claimantUserId: claimant.id,
    placeholderUserId: placeholder.id,
  }
}

beforeAll(async () => {
  const admin = await createUser("admin")
  adminUserId = admin.id
  await ensureEntitlement(LINEAGE_PREMIUM_ENTITLEMENT_KEY, "Lineage Premium")
  await ensureEntitlement(LINEAGE_ELITE_ENTITLEMENT_KEY, "Lineage Elite")
})

afterAll(async () => {
  await db.auditLog.deleteMany({
    where: {
      OR: [{ entityId: { startsWith: PREFIX } }, { userId: { startsWith: PREFIX } }],
    },
  })
  await db.userEntitlement.deleteMany({ where: { userId: { startsWith: PREFIX } } })
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
  await db.membership.deleteMany({ where: { userId: { startsWith: PREFIX } } })
  await db.organization.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.discipline.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.user.deleteMany({ where: { id: { startsWith: PREFIX } } })

  for (const entitlementId of createdEntitlementIds) {
    await db.entitlement.delete({ where: { id: entitlementId } })
  }
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

    const [claim, nodePassport, grant, audit, placeholderOwner, claimant] = await Promise.all([
      db.lineageClaimRequest.findUnique({ where: { id: fx.claimId } }),
      // Phase 3c (SOT-ADR D1): approving attaches the claimant account to the node's Passport.
      db.passport.findUnique({ where: { id: fx.nodePassportId } }),
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
    expect(nodePassport?.userId).toBe(fx.claimantUserId)
    expect(grant?.id).toBe(result.accessGrantId)
    expect(result.passportAccountAttached).toBe(true)
    expect(placeholderOwner?.isPlaceholder).toBe(true)
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
      passportAccountAttached: true,
      evidenceCount: 0,
    })
    expect(auditAfter?.passportAccountAttached).toBe(true)
    // The approve branch schedules the claim-approved email (and never the rejected one).
    expect(approvedEmailCalls.some(call => call.nodeId === fx.nodeId)).toBe(true)
    expect(rejectedEmailCalls.some(call => call.nodeId === fx.nodeId)).toBe(false)
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

    const [claim, nodePassport, grants, audit, placeholderOwner] = await Promise.all([
      db.lineageClaimRequest.findUnique({ where: { id: fx.claimId } }),
      db.passport.findUnique({ where: { id: fx.nodePassportId } }),
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
    expect(result.passportAccountAttached).toBe(false)
    expect(claim?.status).toBe("NEEDS_INFO")
    // Node Passport unchanged — still accountless (no account attached on a non-approval).
    expect(nodePassport?.userId).toBeNull()
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
      passportAccountAttached: false,
      evidenceCount: 0,
    })
    // NEEDS_INFO is not a terminal decision — no claimant email fires.
    expect(approvedEmailCalls.some(call => call.nodeId === fx.nodeId)).toBe(false)
    expect(rejectedEmailCalls.some(call => call.nodeId === fx.nodeId)).toBe(false)
  })

  it("denies a claim: no grant, no ownership change, audit written, and schedules the rejected email", async () => {
    const fx = await createClaimFixture({ name: "deny" })

    const result = await applyLineageClaimReview({
      db,
      brand: TEST_BRAND,
      reviewerUserId: adminUserId!,
      input: {
        claimId: fx.claimId,
        decision: "DENIED",
        reviewerNote: "Insufficient evidence.",
      },
    })

    const [claim, nodePassport, grants, audit] = await Promise.all([
      db.lineageClaimRequest.findUnique({ where: { id: fx.claimId } }),
      db.passport.findUnique({ where: { id: fx.nodePassportId } }),
      db.lineageTreeAccess.findMany({ where: { treeId: fx.treeId } }),
      db.auditLog.findFirst({
        where: {
          entityType: "LineageClaimRequest",
          entityId: fx.claimId,
          action: "lineage.claim.reviewed",
        },
      }),
    ])

    // No grant on deny.
    expect(result.status).toBe("DENIED")
    expect(result.accessGrantId).toBeNull()
    expect(result.compGrantIds).toHaveLength(0)
    expect(result.ownershipTransferred).toBe(false)
    expect(result.passportAccountAttached).toBe(false)
    expect(claim?.status).toBe("DENIED")
    expect(claim?.reviewedById).toBe(adminUserId)
    expect(claim?.reviewerNote).toBe("Insufficient evidence.")
    expect(nodePassport?.userId).toBeNull()
    expect(grants).toHaveLength(0)
    // Audit written for the denial.
    expect(audit?.after).toMatchObject({
      claimId: fx.claimId,
      nodeId: fx.nodeId,
      claimantUserId: fx.claimantUserId,
      status: "DENIED",
      reviewerUserId: adminUserId,
      accessGrantId: null,
      ownershipTransferred: false,
    })
    // The deny branch schedules the claim-rejected notice (carrying the reviewer note) and never
    // the approved one. (SESSION_0420 — closing the "email on every decision" gap.)
    const rejectedCall = rejectedEmailCalls.find(
      call => call.nodeId === fx.nodeId && call.userId === fx.claimantUserId,
    )
    expect(rejectedCall).toBeTruthy()
    expect(rejectedCall?.reviewerNote).toBe("Insufficient evidence.")
    expect(approvedEmailCalls.some(call => call.nodeId === fx.nodeId)).toBe(false)
  })

  it("approves when the claimant already has a signup Passport — merges by superseding it", async () => {
    // SESSION_0392: every real signed-up user has a Passport (signup identity shell). Claiming a
    // placeholder must NOT fail with CLAIMANT_HAS_PASSPORT — the claimant's empty signup Passport is
    // superseded by the claimed identity. This is the production scenario the e2e exercises.
    const fx = await createClaimFixture({ name: "claimant-has-passport" })
    const claimantSignupPassport = await db.passport.create({
      data: { userId: fx.claimantUserId, displayName: "Claimant Signup Identity" },
      select: { id: true },
    })

    const result = await applyLineageClaimReview({
      db,
      brand: TEST_BRAND,
      reviewerUserId: adminUserId!,
      input: { claimId: fx.claimId, decision: "APPROVED", reviewerNote: "Merge approve." },
    })

    const [nodePassport, supersededPassport] = await Promise.all([
      db.passport.findUnique({ where: { id: fx.nodePassportId } }),
      db.passport.findUnique({ where: { id: claimantSignupPassport.id } }),
    ])

    expect(result.status).toBe("APPROVED")
    expect(result.passportAccountAttached).toBe(true)
    // The claimed (placeholder) Passport now belongs to the claimant account…
    expect(nodePassport?.userId).toBe(fx.claimantUserId)
    // …and the claimant's prior signup Passport was superseded (deleted) to free the unique account link.
    expect(supersededPassport).toBeNull()
  })

  it("approves a claim with a server-reviewed elite comp grant and does not mutate Membership", async () => {
    const fx = await createClaimFixture({ name: "approve-with-comp" })
    const org = await db.organization.create({
      data: {
        id: tag("approve-with-comp-org"),
        brand: TEST_BRAND,
        type: "DOJO",
        name: tag("approve-with-comp-org"),
        slug: tag("approve-with-comp-org"),
      },
    })
    const discipline = await db.discipline.create({
      data: {
        id: tag("approve-with-comp-discipline"),
        brand: TEST_BRAND,
        name: tag("approve-with-comp-discipline"),
        slug: tag("approve-with-comp-discipline"),
      },
    })
    const membership = await db.membership.create({
      data: {
        brand: TEST_BRAND,
        status: "ACTIVE",
        userId: fx.claimantUserId,
        organizationId: org.id,
        disciplineId: discipline.id,
        joinedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    })

    const result = await applyLineageClaimReview({
      db,
      brand: TEST_BRAND,
      reviewerUserId: adminUserId!,
      input: {
        claimId: fx.claimId,
        decision: "APPROVED",
        reviewerNote: "Verified identity and comped elite.",
        comp: { tier: LINEAGE_ELITE_ENTITLEMENT_KEY, termDays: 365 },
      },
    })

    const [grants, compAudits, claimAudit, unchangedMembership] = await Promise.all([
      db.userEntitlement.findMany({
        where: {
          userId: fx.claimantUserId,
          sourceType: "MANUAL_GRANT",
          sourceId: `grant:${adminUserId}:lineage-claim-${fx.claimId}`,
          status: "ACTIVE",
        },
        include: { entitlement: { select: { key: true } } },
      }),
      db.auditLog.findMany({
        where: {
          brand: TEST_BRAND,
          action: "entitlement.comp.granted",
          userId: adminUserId!,
          entityId: { contains: fx.claimantUserId },
        },
      }),
      db.auditLog.findFirst({
        where: {
          entityType: "LineageClaimRequest",
          entityId: fx.claimId,
          action: "lineage.claim.reviewed",
        },
      }),
      db.membership.findUnique({ where: { id: membership.id } }),
    ])
    const claimAuditAfter = claimAudit?.after as Record<string, unknown> | null

    expect(result.status).toBe("APPROVED")
    expect(result.compGrantIds).toHaveLength(2)
    expect(grants).toHaveLength(2)
    expect(grants.map(grant => grant.entitlement.key).sort()).toEqual([
      LINEAGE_ELITE_ENTITLEMENT_KEY,
      LINEAGE_PREMIUM_ENTITLEMENT_KEY,
    ])
    for (const grant of grants) {
      expect(result.compGrantIds).toContain(grant.id)
      expect(grant.endsAt).toBeInstanceOf(Date)
    }
    expect(compAudits).toHaveLength(2)
    expect(claimAuditAfter?.compGrantIds).toEqual(result.compGrantIds)
    expect(unchangedMembership?.status).toBe("ACTIVE")
    expect(unchangedMembership?.version).toBe(0)
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
    expect(result.passportAccountAttached).toBe(true)
    expect(priorOwner?.isPlaceholder).toBe(false)
    expect(priorOwner?.archivedAt).toBeNull()
    expect(audit?.after).toMatchObject({
      status: "APPROVED",
      passportAccountAttached: true,
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

  it("allows only one concurrent approval for competing claims on the same node", async () => {
    const fx = await createClaimFixture({ name: "concurrent-approval" })
    const competingClaimant = await createUser("concurrent-approval-competitor")
    const competingClaim = await db.lineageClaimRequest.create({
      data: {
        id: tag("concurrent-approval-competing-claim"),
        treeId: fx.treeId,
        nodeId: fx.nodeId,
        claimantUserId: competingClaimant.id,
        status: "PENDING",
      },
    })

    const outcomes = await Promise.allSettled([
      applyLineageClaimReview({
        db,
        brand: TEST_BRAND,
        reviewerUserId: adminUserId!,
        input: { claimId: fx.claimId, decision: "APPROVED" },
      }),
      applyLineageClaimReview({
        db,
        brand: TEST_BRAND,
        reviewerUserId: adminUserId!,
        input: { claimId: competingClaim.id, decision: "APPROVED" },
      }),
    ])
    const approvedCount = await db.lineageClaimRequest.count({
      where: { treeId: fx.treeId, nodeId: fx.nodeId, status: "APPROVED" },
    })

    expect(outcomes.filter(outcome => outcome.status === "fulfilled")).toHaveLength(1)
    expect(outcomes.filter(outcome => outcome.status === "rejected")).toHaveLength(1)
    expect(approvedCount).toBe(1)
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
