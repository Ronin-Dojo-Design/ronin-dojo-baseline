/**
 * SESSION_0432 FI-006 — claim→award rank lifecycle integration tests.
 *
 * Verifies that:
 *   1. Approving a claim with a claimedRankId creates a VERIFIED RankAward on the node Passport.
 *   2. Approving without a claimedRankId creates no RankAward (backwards-compat).
 *   3. Approving a claim where the rank is already awarded does NOT overwrite the existing award
 *      (idempotent upsert — keeps the pre-existing award row).
 *   4. The audit log includes rankAwardId in the after snapshot.
 *   5. DENIED / NEEDS_INFO decisions never create a RankAward.
 *
 * Run: cd apps/web && bun test server/admin/lineage/claim-rank-lifecycle.test.ts
 *
 * Author: Cody / SESSION_0432 FI-006.
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"

mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  revalidateTag: () => {},
}))

mock.module("next/server", () => ({
  after: (fn: () => void | Promise<void>) => {
    void Promise.resolve().then(() => fn())
  },
}))

const TEST_BRAND = "BASELINE_MARTIAL_ARTS" as const

const mockSession: { user: { id: string; role: string } } | null = null
mock.module("~/lib/auth", () => ({
  getServerSession: () => Promise.resolve(mockSession),
}))

mock.module("~/server/web/lineage/claim-approved-email", () => ({
  scheduleClaimApprovedEmail: () => {},
}))
mock.module("~/server/web/lineage/claim-rejected-email", () => ({
  scheduleClaimRejectedEmail: () => {},
}))

import type { Brand } from "~/.generated/prisma/client"
import {
  LINEAGE_ELITE_ENTITLEMENT_KEY,
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
} from "~/lib/entitlements/lineage-comp"
import { applyLineageClaimReview } from "~/server/admin/lineage/claim-review-actions"
import { db } from "~/services/db"

const TS = Date.now()
const PREFIX = `fi006-${TS}`
const tag = (name: string) => `${PREFIX}-${name}`

let adminUserId: string | null = null
let testRankId: string | null = null
const createdEntitlementIds: string[] = []

async function ensureEntitlement(key: string, name: string) {
  const existing = await db.entitlement.findUnique({
    where: { brand_key: { brand: TEST_BRAND, key } },
  })
  if (existing) {
    return existing
  }
  const entitlement = await db.entitlement.create({
    data: { brand: TEST_BRAND, key, name },
  })
  createdEntitlementIds.push(entitlement.id)
  return entitlement
}

async function createUser(name: string) {
  return db.user.create({
    data: {
      id: tag(name),
      name: tag(name),
      email: `${tag(name)}@test.local`,
      role: name.includes("admin") ? "admin" : "user",
    },
  })
}

type ClaimFixture = {
  treeId: string
  nodeId: string
  nodePassportId: string
  memberId: string
  claimId: string
  claimantUserId: string
}

async function createClaimFixture(
  name: string,
  claimedRankId?: string,
): Promise<ClaimFixture> {
  const claimant = await createUser(`${name}-claimant`)

  const nodePassport = await db.passport.create({
    data: { displayName: tag(name) },
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
      brand: TEST_BRAND,
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
      status: "PENDING",
      claimedRankId: claimedRankId ?? null,
    },
  })

  return {
    treeId: tree.id,
    nodeId: node.id,
    nodePassportId: nodePassport.id,
    memberId: member.id,
    claimId: claim.id,
    claimantUserId: claimant.id,
  }
}

beforeAll(async () => {
  const admin = await createUser("admin")
  adminUserId = admin.id
  await ensureEntitlement(LINEAGE_PREMIUM_ENTITLEMENT_KEY, "Lineage Premium")
  await ensureEntitlement(LINEAGE_ELITE_ENTITLEMENT_KEY, "Lineage Elite")

  // Use a real RankSystem + Rank row if one exists; otherwise create a minimal test fixture.
  const existingRank = await db.rank.findFirst({ select: { id: true } })
  if (existingRank) {
    testRankId = existingRank.id
  } else {
    const rs = await db.rankSystem.create({
      data: {
        id: tag("rank-system"),
        name: tag("rank-system"),
        discipline: {
          create: {
            id: tag("discipline"),
            brand: TEST_BRAND,
            name: tag("discipline"),
            slug: tag("discipline"),
            code: "test-bjj",
          },
        },
      },
      select: { id: true },
    })
    const r = await db.rank.create({
      data: {
        id: tag("rank"),
        rankSystemId: rs.id,
        name: "Test Black Belt",
        shortName: "TBK",
        sortOrder: 1,
      },
      select: { id: true },
    })
    testRankId = r.id
  }
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
  await db.rankAward.deleteMany({ where: { passport: { displayName: { startsWith: PREFIX } } } })
  await db.lineageClaimRequest.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.lineageTreeMember.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.lineageTree.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.lineageNode.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.user.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.passport.deleteMany({ where: { displayName: { startsWith: PREFIX } } })

  for (const entitlementId of createdEntitlementIds) {
    await db.entitlement.delete({ where: { id: entitlementId } })
  }
})

describe("FI-006 claim→award rank lifecycle", () => {
  it("approval with claimedRankId creates a VERIFIED RankAward on the node Passport", async () => {
    const fx = await createClaimFixture("with-rank", testRankId!)

    const result = await applyLineageClaimReview({
      db,
      brand: TEST_BRAND,
      reviewerUserId: adminUserId!,
      input: { claimId: fx.claimId, decision: "APPROVED" },
    })

    expect(result.status).toBe("APPROVED")
    expect(result.rankAwardId).toBeTruthy()

    const award = await db.rankAward.findUnique({ where: { id: result.rankAwardId! } })
    expect(award).not.toBeNull()
    expect(award?.passportId).toBe(fx.nodePassportId)
    expect(award?.rankId).toBe(testRankId)
    expect(award?.source).toBe("STATED")
    expect(award?.verificationStatus).toBe("VERIFIED")
  })

  it("approval without claimedRankId creates no RankAward (backwards-compat)", async () => {
    const fx = await createClaimFixture("no-rank")

    const result = await applyLineageClaimReview({
      db,
      brand: TEST_BRAND,
      reviewerUserId: adminUserId!,
      input: { claimId: fx.claimId, decision: "APPROVED" },
    })

    expect(result.status).toBe("APPROVED")
    expect(result.rankAwardId).toBeNull()
  })

  it("approval is idempotent when rank is already awarded — keeps existing RankAward", async () => {
    const fx = await createClaimFixture("already-awarded", testRankId!)

    // Pre-create the RankAward (simulates an admin having added it already).
    const preExisting = await db.rankAward.create({
      data: {
        passportId: fx.nodePassportId,
        rankId: testRankId!,
        source: "EARNED",
        verificationStatus: "VERIFIED",
        awardedAt: new Date("2020-01-01"),
      },
      select: { id: true },
    })

    const result = await applyLineageClaimReview({
      db,
      brand: TEST_BRAND,
      reviewerUserId: adminUserId!,
      input: { claimId: fx.claimId, decision: "APPROVED" },
    })

    // The finalize found the existing award and returned its id — did NOT create a second one.
    expect(result.rankAwardId).toBe(preExisting.id)
    const awards = await db.rankAward.findMany({
      where: { passportId: fx.nodePassportId, rankId: testRankId! },
    })
    expect(awards).toHaveLength(1)
    // The pre-existing EARNED award was NOT overwritten.
    expect(awards[0]?.source).toBe("EARNED")
  })

  it("audit log includes rankAwardId in the after snapshot on APPROVED", async () => {
    const fx = await createClaimFixture("audit-rank", testRankId!)

    const result = await applyLineageClaimReview({
      db,
      brand: TEST_BRAND,
      reviewerUserId: adminUserId!,
      input: { claimId: fx.claimId, decision: "APPROVED" },
    })

    const audit = await db.auditLog.findFirst({
      where: {
        entityType: "LineageClaimRequest",
        entityId: fx.claimId,
        action: "lineage.claim.reviewed",
      },
    })
    const after = audit?.after as Record<string, unknown> | null
    expect(after?.rankAwardId).toBe(result.rankAwardId)
  })

  it("DENIED decision never creates a RankAward", async () => {
    const fx = await createClaimFixture("denied-rank", testRankId!)

    const result = await applyLineageClaimReview({
      db,
      brand: TEST_BRAND,
      reviewerUserId: adminUserId!,
      input: { claimId: fx.claimId, decision: "DENIED" },
    })

    expect(result.status).toBe("DENIED")
    expect(result.rankAwardId).toBeNull()
    const awards = await db.rankAward.findMany({ where: { passportId: fx.nodePassportId } })
    expect(awards).toHaveLength(0)
  })

  it("NEEDS_INFO decision never creates a RankAward", async () => {
    const fx = await createClaimFixture("needs-info-rank", testRankId!)

    const result = await applyLineageClaimReview({
      db,
      brand: TEST_BRAND,
      reviewerUserId: adminUserId!,
      input: { claimId: fx.claimId, decision: "NEEDS_INFO" },
    })

    expect(result.status).toBe("NEEDS_INFO")
    expect(result.rankAwardId).toBeNull()
    const awards = await db.rankAward.findMany({ where: { passportId: fx.nodePassportId } })
    expect(awards).toHaveLength(0)
  })
})
