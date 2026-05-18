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

installSafeActionMocks({ brand: "BASELINE_MARTIAL_ARTS" })

import { reviewLineageClaim } from "~/server/admin/lineage/claim-review-actions"
import { db } from "~/services/db"

const TEST_BRAND = "BASELINE_MARTIAL_ARTS" as const

const TS = Date.now()
const PREFIX = `session-0187-safe-action-${TS}`
const tag = (name: string) => `${PREFIX}-${name}`

type Fixture = {
  treeId: string
  nodeId: string
  memberId: string
  claimId: string
  claimantUserId: string
  placeholderUserId: string
  adminUserId: string
}

let fx: Fixture | null = null

const createUser = async (
  name: string,
  options: { role?: string; isPlaceholder?: boolean } = {},
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
  const admin = await createUser("admin", { role: "admin" })
  const placeholder = await createUser("placeholder", { isPlaceholder: true })
  const claimant = await createUser("claimant")

  const node = await db.lineageNode.create({
    data: {
      id: tag("node"),
      userId: placeholder.id,
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
    expect(result?.data?.placeholderArchivedUserId).toBe(fx.placeholderUserId)
    expect(result?.data?.placeholderArchivedAt).toBeTruthy()

    const [node, placeholderUser] = await Promise.all([
      db.lineageNode.findUnique({ where: { id: fx.nodeId } }),
      db.user.findUnique({ where: { id: fx.placeholderUserId } }),
    ])

    expect(node?.userId).toBe(fx.claimantUserId)
    expect(placeholderUser?.archivedAt).not.toBeNull()
  })
})
