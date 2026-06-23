/**
 * SESSION_0412 FIX #3 — acceptLineageClaimByToken integration tests.
 *
 * Exercises the BBL one-click token-bound claim accept through the full
 * `userActionClient` middleware chain (via `installSafeActionMocks`/`setTestSession`),
 * so the (a)-(d) security guards, the auto-approve + finalize side-effects, and
 * replay idempotency are all covered against a real DB.
 *
 * The accept action does NOT send email, so no Resend seam fires here — but we
 * pin the brand to BBL (the comp path) and never import the email modules.
 *
 * Run: cd apps/web && bun test --timeout 120000 \
 *        server/web/lineage/claim-accept-actions.test.ts
 */

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

// Install mocks BEFORE any import that touches the action / server modules. Brand=BBL
// so the auto-comp branch runs.
installSafeActionMocks({ brand: "BBL", host: "blackbeltlegacy.com" })

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it } from "bun:test"

import {
  LINEAGE_ELITE_ENTITLEMENT_KEY,
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
} from "~/lib/entitlements/lineage-comp"
import { acceptLineageClaimByToken } from "~/server/web/lineage/claim-accept-actions"
import { CLAIM_ACCEPT_ERROR } from "~/server/web/lineage/claim-accept-errors"
import { db } from "~/services/db"

const TEST_BRAND = "BBL" as const
const TS = Date.now()
const PREFIX = `session-0412-${TS}`
const tag = (name: string) => `${PREFIX}-${name}`

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

type ClaimFixture = {
  treeId: string
  nodeId: string
  nodePassportId: string
  claimantUserId: string
}

const createUser = async (name: string) =>
  db.user.create({
    data: { id: tag(name), name: tag(name), email: `${tag(name)}@test.local` },
  })

/**
 * A claimable node (accountless Passport) in a published+claimable BBL tree, plus
 * a fresh claimant account. `accountful` attaches the node Passport to a prior
 * account (the "already claimed" case); `treeClaimable`/`memberClaimable` flip the
 * (b) guard knobs.
 */
const createFixture = async ({
  name,
  accountful = false,
  treeClaimable = true,
  treePublished = true,
  memberClaimable = true,
  claimantOwnsOtherNode = false,
}: {
  name: string
  accountful?: boolean
  treeClaimable?: boolean
  treePublished?: boolean
  memberClaimable?: boolean
  claimantOwnsOtherNode?: boolean
}): Promise<ClaimFixture> => {
  const claimant = await createUser(`${name}-claimant`)
  const priorOwner = accountful ? await createUser(`${name}-prior-owner`) : null

  if (claimantOwnsOtherNode) {
    // The action validates `nodeId` as a real cuid, so test nodes can't use tagged ids —
    // let Prisma mint a cuid2 and tag the slug for cleanup instead.
    await db.lineageNode.create({
      data: {
        passport: {
          connectOrCreate: { where: { userId: claimant.id }, create: { userId: claimant.id } },
        },
        slug: tag(`${name}-claimant-existing-node`),
        visibility: "PUBLIC",
        verificationStatus: "PENDING",
      },
    })
  }

  const nodePassport = await db.passport.create({
    data: priorOwner
      ? { userId: priorOwner.id, displayName: tag(`${name}-node-passport`) }
      : { displayName: tag(`${name}-node-passport`) },
    select: { id: true },
  })

  const node = await db.lineageNode.create({
    data: {
      passportId: nodePassport.id,
      slug: tag(`${name}-node`),
      visibility: "PUBLIC",
      verificationStatus: "PENDING",
    },
    select: { id: true },
  })

  const tree = await db.lineageTree.create({
    data: {
      id: tag(`${name}-tree`),
      brand: TEST_BRAND,
      slug: tag(`${name}-tree`),
      name: tag(`${name}-tree`),
      visibility: "PUBLIC",
      isPublished: treePublished,
      isClaimable: treeClaimable,
      scopeType: "DISCIPLINE",
    },
  })

  await db.lineageTreeMember.create({
    data: {
      id: tag(`${name}-member`),
      treeId: tree.id,
      nodeId: node.id,
      isClaimable: memberClaimable,
      visualSortOrder: 0,
    },
  })

  return {
    treeId: tree.id,
    nodeId: node.id,
    nodePassportId: nodePassport.id,
    claimantUserId: claimant.id,
  }
}

beforeAll(async () => {
  await ensureEntitlement(LINEAGE_PREMIUM_ENTITLEMENT_KEY, "Lineage Premium")
  await ensureEntitlement(LINEAGE_ELITE_ENTITLEMENT_KEY, "Lineage Elite")
})

afterAll(async () => {
  setTestSession(null)
  await db.auditLog.deleteMany({
    where: { OR: [{ entityId: { startsWith: PREFIX } }, { userId: { startsWith: PREFIX } }] },
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
  await db.lineageClaimRequest.deleteMany({ where: { treeId: { startsWith: PREFIX } } })
  // ADR 0036: the email path mints PassportClaimRequest rows; clean them by tagged tree.
  await db.passportClaimRequest.deleteMany({ where: { treeId: { startsWith: PREFIX } } })
  await db.lineageTreeMember.deleteMany({ where: { treeId: { startsWith: PREFIX } } })
  await db.lineageTree.deleteMany({ where: { id: { startsWith: PREFIX } } })
  // Nodes use auto-generated cuids (the action validates the id) — clean by tagged slug.
  await db.lineageNode.deleteMany({ where: { slug: { startsWith: PREFIX } } })
  await db.passport.deleteMany({ where: { displayName: { startsWith: PREFIX } } })
  await db.user.deleteMany({ where: { id: { startsWith: PREFIX } } })
  for (const id of createdEntitlementIds) {
    await db.entitlement.delete({ where: { id } }).catch(() => {})
  }
})

describe("acceptLineageClaimByToken", () => {
  it("gate: returns serverError when unauthenticated (userActionClient)", async () => {
    const fx = await createFixture({ name: "unauth" })
    setTestSession(null)

    const result = await acceptLineageClaimByToken({ nodeId: fx.nodeId })

    expect(result?.serverError).toBe("User not authenticated")
    expect(result?.data).toBeUndefined()
    // The auth gate short-circuits before any write — the node stays accountless.
    const passport = await db.passport.findUnique({ where: { id: fx.nodePassportId } })
    expect(passport?.userId).toBeNull()
  })

  it("happy path: accountless node → attaches account, APPROVED bypass claim, audit, elite comp", async () => {
    const fx = await createFixture({ name: "happy" })
    setTestSession({ id: fx.claimantUserId })

    const result = await acceptLineageClaimByToken({ nodeId: fx.nodeId })

    expect(result?.serverError).toBeUndefined()
    expect(result?.validationErrors).toBeUndefined()
    expect(result?.data?.outcome).toBe("claimed")
    expect(result?.data?.nodeId).toBe(fx.nodeId)

    const [passport, claim, grant, audit, comps] = await Promise.all([
      db.passport.findUnique({ where: { id: fx.nodePassportId } }),
      // ADR 0036: the email path now mints the unified PassportClaimRequest (keyed on identity).
      db.passportClaimRequest.findFirst({ where: { id: result!.data!.claimId } }),
      db.lineageTreeAccess.findFirst({
        where: {
          treeId: fx.treeId,
          userId: fx.claimantUserId,
          nodeId: fx.nodeId,
          role: "NODE_EDITOR",
          revokedAt: null,
        },
      }),
      db.auditLog.findFirst({
        where: {
          entityType: "PassportClaimRequest",
          entityId: result!.data!.claimId,
          action: "lineage.claim.reviewed",
        },
      }),
      db.userEntitlement.findMany({
        where: { userId: fx.claimantUserId, status: "ACTIVE" },
        include: { entitlement: { select: { key: true } } },
      }),
    ])

    // (c) account attached to the claimed Passport
    expect(passport?.userId).toBe(fx.claimantUserId)
    // auto-approved unified PassportClaimRequest with the email-token bypass reason
    expect(claim?.status).toBe("APPROVED")
    expect(claim?.bypassReason).toBe("email-token")
    expect(claim?.reviewedById).toBe(fx.claimantUserId)
    expect(claim?.passportId).toBe(fx.nodePassportId)
    // NODE_EDITOR access granted
    expect(grant?.id).toBeTruthy()
    // audit parity with the admin path
    expect(audit?.userId).toBe(fx.claimantUserId)
    expect(audit?.after).toMatchObject({
      status: "APPROVED",
      bypassReason: "email-token",
      passportAccountAttached: true,
      ownershipTransferred: true,
    })
    // BBL Elite comp (Premium + Elite keys); non-Dirty-Dozen → 1yr end date
    expect(comps.map(c => c.entitlement.key).sort()).toEqual([
      LINEAGE_ELITE_ENTITLEMENT_KEY,
      LINEAGE_PREMIUM_ENTITLEMENT_KEY,
    ])
    for (const comp of comps) {
      expect(comp.endsAt).toBeInstanceOf(Date)
    }
  })

  it("guard: rejects when the clicker already owns a different lineage node", async () => {
    const fx = await createFixture({ name: "has-node", claimantOwnsOtherNode: true })
    setTestSession({ id: fx.claimantUserId })

    const result = await acceptLineageClaimByToken({ nodeId: fx.nodeId })

    expect(result?.serverError).toBe(CLAIM_ACCEPT_ERROR.CLAIMANT_HAS_NODE)
    expect(result?.data).toBeUndefined()

    // No attach, no claim row.
    const [passport, claims] = await Promise.all([
      db.passport.findUnique({ where: { id: fx.nodePassportId } }),
      db.passportClaimRequest.findMany({ where: { passportId: fx.nodePassportId } }),
    ])
    expect(passport?.userId).toBeNull()
    expect(claims).toHaveLength(0)
  })

  it("guard: rejects an already-accountful node owned by someone else (no-op)", async () => {
    const fx = await createFixture({ name: "accountful", accountful: true })
    setTestSession({ id: fx.claimantUserId })

    const result = await acceptLineageClaimByToken({ nodeId: fx.nodeId })

    expect(result?.serverError).toBe(CLAIM_ACCEPT_ERROR.ALREADY_OWNED_BY_OTHER)
    expect(result?.data).toBeUndefined()

    // The prior owner still owns the Passport; no claim created for this claimant.
    const [passport, claims] = await Promise.all([
      db.passport.findUnique({ where: { id: fx.nodePassportId } }),
      db.passportClaimRequest.findMany({
        where: { passportId: fx.nodePassportId, claimantUserId: fx.claimantUserId },
      }),
    ])
    expect(passport?.userId).not.toBe(fx.claimantUserId)
    expect(passport?.userId).toBeTruthy()
    expect(claims).toHaveLength(0)
  })

  it("guard: rejects when the node's tree is unpublished or unclaimable", async () => {
    const fx = await createFixture({ name: "unclaimable-tree", treeClaimable: false })
    setTestSession({ id: fx.claimantUserId })

    const result = await acceptLineageClaimByToken({ nodeId: fx.nodeId })

    expect(result?.serverError).toBe(CLAIM_ACCEPT_ERROR.NODE_NOT_CLAIMABLE)
    expect(result?.data).toBeUndefined()
  })

  it("replay: a second click after a successful claim is an idempotent no-op success", async () => {
    const fx = await createFixture({ name: "replay" })
    setTestSession({ id: fx.claimantUserId })

    const first = await acceptLineageClaimByToken({ nodeId: fx.nodeId })
    expect(first?.data?.outcome).toBe("claimed")

    const second = await acceptLineageClaimByToken({ nodeId: fx.nodeId })
    expect(second?.serverError).toBeUndefined()
    expect(second?.data?.outcome).toBe("already-claimed")
    expect(second?.data?.nodeId).toBe(fx.nodeId)

    // Still exactly one APPROVED claim — the replay did not mint a duplicate.
    const approved = await db.passportClaimRequest.count({
      where: {
        passportId: fx.nodePassportId,
        claimantUserId: fx.claimantUserId,
        status: "APPROVED",
      },
    })
    expect(approved).toBe(1)
  })
})
