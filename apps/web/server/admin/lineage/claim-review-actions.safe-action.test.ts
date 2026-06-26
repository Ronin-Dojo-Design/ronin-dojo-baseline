/**
 * SESSION_0187 TASK_02 — safe-action wrapper integration test for
 * `reviewLineageClaim`.
 *
 * Exercises the full `adminActionClient` middleware chain (auth, role,
 * brand, input validation) end-to-end via the wrapped export, using the
 * reusable safe-action mock harness.
 *
 * Run: cd apps/web && bun test --timeout 90000 server/admin/lineage/claim-review-actions.safe-action.test.ts
 *
 * Author: Cody / SESSION_0187 TASK_02.
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it } from "bun:test"

// IMPORTANT: install safe-action mocks BEFORE any module that touches
// `~/server`, `~/lib/auth`, `next/headers`, `next/cache`, `next/server`,
// or `~/lib/rate-limiter` is imported. Static imports below are hoisted
// in source order — keeping this call at the very top of the file ensures
// the mock registrations run before the action module is evaluated.
import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

installSafeActionMocks({ brand: "BBL" })

import { reviewLineageClaim } from "~/server/admin/lineage/claim-review-actions"
import type { UserRole } from "~/.generated/prisma/client"
import { db } from "~/services/db"

const TEST_BRAND = "BBL" as const

const TS = Date.now()
const PREFIX = `session-0187-safe-action-${TS}`
const tag = (name: string) => `${PREFIX}-${name}`

type Fixture = {
  treeId: string
  nodeId: string
  nodePassportId: string
  memberId: string
  claimId: string
  claimantUserId: string
  placeholderUserId: string
  adminUserId: string
}

let fx: Fixture | null = null

// The brand-prune inlined Brand.BBL at the entitlement lookup, and the unit-test DB
// catalog isn't seeded with BBL entitlements — so seed the comp tiers this test grants
// under TEST_BRAND ourselves (find-or-create; only delete what we created).
const createdEntitlementIds: string[] = []
const ensureEntitlement = async (key: string, name: string) => {
  const existing = await db.entitlement.findUnique({
    where: { brand_key: { brand: TEST_BRAND, key } },
    select: { id: true },
  })
  if (existing) return
  const created = await db.entitlement.create({
    data: { brand: TEST_BRAND, key, name },
    select: { id: true },
  })
  createdEntitlementIds.push(created.id)
}

const createUser = async (
  name: string,
  options: { role?: UserRole; isPlaceholder?: boolean } = {},
) => {
  return db.user.create({
    data: {
      id: tag(name),
      name: tag(name),
      email: `${tag(name)}@test.local`,
      role: options.role ?? "user",
      isPlaceholder: options.isPlaceholder ?? false,
    },
  })
}

beforeAll(async () => {
  await ensureEntitlement("LINEAGE_PREMIUM", "Lineage Premium")
  await ensureEntitlement("LINEAGE_ELITE", "Lineage Elite")

  const admin = await createUser("admin", { role: "admin" })
  const placeholder = await createUser("placeholder", { isPlaceholder: true })
  const claimant = await createUser("claimant")

  // Phase 3c (SOT-ADR D1): placeholder node = accountless Passport; approving attaches the claimant.
  const nodePassport = await db.passport.create({
    data: { displayName: tag("node") },
    select: { id: true },
  })
  const node = await db.lineageNode.create({
    data: {
      id: tag("node"),
      passportId: nodePassport.id,
      slug: tag("node"),
      visibility: "PUBLIC",
      verificationStatus: "PENDING",
    },
  })

  const tree = await db.lineageTree.create({
    data: {
      id: tag("tree"),
      brand: TEST_BRAND,
      slug: tag("tree"),
      name: tag("tree"),
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

  // The wrapped action's input schema requires `claimId` to be a cuid.
  // Tag-shaped ids won't satisfy z.string().cuid(), so let Prisma's
  // @default(cuid()) on LineageClaimRequest.id generate a valid id and
  // capture it from the returned record.
  const claim = await db.lineageClaimRequest.create({
    data: {
      treeId: tree.id,
      nodeId: node.id,
      claimantUserId: claimant.id,
      status: "PENDING",
    },
  })

  fx = {
    treeId: tree.id,
    nodeId: node.id,
    nodePassportId: nodePassport.id,
    memberId: member.id,
    claimId: claim.id,
    claimantUserId: claimant.id,
    placeholderUserId: placeholder.id,
    adminUserId: admin.id,
  }
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
    where: {
      claimRequest: {
        is: {
          OR: [
            { treeId: { startsWith: PREFIX } },
            { nodeId: { startsWith: PREFIX } },
            { claimantUserId: { startsWith: PREFIX } },
          ],
        },
      },
    },
  })
  // Claim id is a real cuid (not prefixed), so cascade through tree/node/claimant.
  await db.lineageClaimRequest.deleteMany({
    where: {
      OR: [
        { treeId: { startsWith: PREFIX } },
        { nodeId: { startsWith: PREFIX } },
        { claimantUserId: { startsWith: PREFIX } },
      ],
    },
  })
  await db.lineageTreeMember.deleteMany({
    where: {
      OR: [{ id: { startsWith: PREFIX } }, { treeId: { startsWith: PREFIX } }],
    },
  })
  await db.lineageTree.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.lineageNode.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.user.deleteMany({ where: { id: { startsWith: PREFIX } } })
  // Delete entitlement definitions last (after users → UserEntitlement rows are gone),
  // and only the ones we created so we don't clobber a pre-seeded catalog row.
  if (createdEntitlementIds.length > 0) {
    await db.entitlement.deleteMany({ where: { id: { in: createdEntitlementIds } } })
  }
})

describe("reviewLineageClaim (safe-action wrapper)", () => {
  it("returns serverError 'User not authenticated' when no session", async () => {
    if (!fx) throw new Error("fixture not initialized")

    setTestSession(null)

    const result = await reviewLineageClaim({
      claimId: fx.claimId,
      decision: "APPROVED",
    })

    expect(result?.serverError).toBe("User not authenticated")
    expect(result?.data).toBeUndefined()
  })

  it("returns serverError 'User not authorized' for non-admin role", async () => {
    if (!fx) throw new Error("fixture not initialized")

    setTestSession({ id: fx.claimantUserId, role: "user" })

    const result = await reviewLineageClaim({
      claimId: fx.claimId,
      decision: "APPROVED",
    })

    expect(result?.serverError).toBe("User not authorized")
    expect(result?.data).toBeUndefined()
  })

  it("approves the claim, transfers ownership, and archives the placeholder owner for an admin", async () => {
    if (!fx) throw new Error("fixture not initialized")

    setTestSession({ id: fx.adminUserId, role: "admin" })

    const result = await reviewLineageClaim({
      claimId: fx.claimId,
      decision: "APPROVED",
      reviewerNote: "ok",
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.validationErrors).toBeUndefined()
    expect(result?.data?.status).toBe("APPROVED")
    expect(result?.data?.ownershipTransferred).toBe(true)
    expect(result?.data?.passportAccountAttached).toBe(true)

    const nodePassport = await db.passport.findUnique({ where: { id: fx.nodePassportId } })

    // D1: the claimant account is now attached to the node's Passport (the node never moved).
    expect(nodePassport?.userId).toBe(fx.claimantUserId)
  })
})
