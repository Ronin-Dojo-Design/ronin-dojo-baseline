/**
 * SESSION_0419 — reconcilePendingLineageClaims integration tests.
 *
 * The fix for "Tony signed in with Google and never claimed his node": a persisted email→node
 * binding (LineagePendingClaim) is reconciled on EVERY successful auth, so any sign-in method
 * claims. These exercise the reconciler directly against a real DB (it is a plain server fn, not
 * a safe-action, so no middleware mocks are needed) with brand=BBL so the comp path runs.
 *
 * Run: cd apps/web && bun test --timeout 120000 \
 *        server/web/lineage/reconcile-pending-claims.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it } from "bun:test"

import {
  LINEAGE_ELITE_ENTITLEMENT_KEY,
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
} from "~/lib/entitlements/lineage-comp"
import { reconcilePendingLineageClaims } from "~/server/web/lineage/reconcile-pending-claims"
import { db } from "~/services/db"

const TEST_BRAND = "BBL" as const
const TS = Date.now()
const PREFIX = `session-0419-${TS}`
const tag = (name: string) => `${PREFIX}-${name}`

/**
 * Issue #378 (SESSION_0725 flake): the old findUnique-then-create was a non-atomic race —
 * two suites on the shared local DB could both miss and both create, and the loser threw
 * P2002 on `Entitlement @@unique([brand, key])` in beforeAll. Native upsert (INSERT … ON
 * CONFLICT) is atomic. These are brand-wide DEFINITION rows (live in prod/prodsnap already),
 * not per-test data — so they are upserted and left in place, mirroring
 * `e2e/helpers/seed-lineage-lifecycle-db.ts`. Deleting them in afterAll was the other half
 * of the cross-suite hazard: it yanked the definition out from under any concurrent suite's
 * comp-grant path mid-run.
 */
async function ensureEntitlement(key: string, name: string) {
  return db.entitlement.upsert({
    where: { brand_key: { brand: TEST_BRAND, key } },
    update: {},
    create: { brand: TEST_BRAND, key, name },
  })
}

type Fixture = {
  nodeId: string
  nodePassportId: string
  claimantUserId: string
  claimantEmail: string
}

/** A claimable accountless node in a published+claimable BBL tree, plus a fresh claimant. */
const createFixture = async (name: string, accountful = false): Promise<Fixture> => {
  const email = `${tag(name)}@test.local`
  const claimant = await db.user.create({
    data: { id: tag(`${name}-claimant`), name: tag(name), email },
  })
  const priorOwner = accountful
    ? await db.user.create({
        data: {
          id: tag(`${name}-prior`),
          name: tag(`${name}-prior`),
          email: `${tag(`${name}-prior`)}@test.local`,
        },
      })
    : null

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
      isPublished: true,
      isClaimable: true,
      scopeType: "DISCIPLINE",
    },
  })
  await db.lineageTreeMember.create({
    data: {
      id: tag(`${name}-member`),
      treeId: tree.id,
      nodeId: node.id,
      isClaimable: true,
      visualSortOrder: 0,
    },
  })
  return {
    nodeId: node.id,
    nodePassportId: nodePassport.id,
    claimantUserId: claimant.id,
    claimantEmail: email,
  }
}

const bind = async (email: string, nodeId: string, expiresAt: Date | null = null) =>
  db.lineagePendingClaim.create({
    data: { email: email.toLowerCase(), nodeId, brand: TEST_BRAND, expiresAt },
  })

/**
 * Issue #378 (SESSION_0725 flake): the reconciler runs each binding in a SERIALIZABLE tx and —
 * by contract — swallows failures, leaving the binding UNCONSUMED "so a later sign-in retries".
 * Under cross-suite pressure on the shared local DB (concurrent lanes' suites/seed sweeps),
 * Postgres SSI can abort that tx, which surfaced here as a happy-path assertion failure.
 * Mirror the runtime contract: re-invoke (= the "later sign-in") a bounded number of times,
 * ONLY while the binding remains unconsumed, and warn loudly when a retry fires. Assertions
 * below are untouched — consumption, account attach, and comps are still fully asserted.
 */
const reconcileUntilConsumed = async (
  args: { userId: string; email: string; emailVerified: boolean },
  bindingId: string,
  attempts = 3,
) => {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    await reconcilePendingLineageClaims(args)
    const binding = await db.lineagePendingClaim.findUnique({
      where: { id: bindingId },
      select: { consumedAt: true },
    })
    if (binding?.consumedAt) return
    console.warn(
      `[reconcile-pending-claims.test] binding unconsumed after attempt ${attempt}/${attempts} — retrying (cross-suite conflict, issue #378)`,
    )
  }
}

beforeAll(async () => {
  await ensureEntitlement(LINEAGE_PREMIUM_ENTITLEMENT_KEY, "Lineage Premium")
  await ensureEntitlement(LINEAGE_ELITE_ENTITLEMENT_KEY, "Lineage Elite")
})

afterAll(async () => {
  await db.auditLog.deleteMany({
    where: { OR: [{ entityId: { startsWith: PREFIX } }, { userId: { startsWith: PREFIX } }] },
  })
  await db.userEntitlement.deleteMany({ where: { userId: { startsWith: PREFIX } } })
  await db.lineageTreeAccess.deleteMany({
    where: { OR: [{ treeId: { startsWith: PREFIX } }, { userId: { startsWith: PREFIX } }] },
  })
  await db.lineagePendingClaim.deleteMany({ where: { email: { contains: PREFIX.toLowerCase() } } })
  await db.lineageClaimRequest.deleteMany({ where: { treeId: { startsWith: PREFIX } } })
  await db.lineageTreeMember.deleteMany({ where: { treeId: { startsWith: PREFIX } } })
  await db.lineageTree.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.lineageNode.deleteMany({ where: { slug: { startsWith: PREFIX } } })
  await db.passport.deleteMany({ where: { displayName: { startsWith: PREFIX } } })
  await db.user.deleteMany({ where: { id: { startsWith: PREFIX } } })
  // Entitlement DEFINITION rows ({BBL, LINEAGE_PREMIUM/ELITE}) are intentionally NOT deleted —
  // see the ensureEntitlement doc block (issue #378 cross-suite hazard).
})

describe("reconcilePendingLineageClaims", () => {
  it("verified email + pending binding → claims the node, attaches account, consumes the binding", async () => {
    const fx = await createFixture("happy")
    const binding = await bind(fx.claimantEmail, fx.nodeId)

    await reconcileUntilConsumed(
      { userId: fx.claimantUserId, email: fx.claimantEmail, emailVerified: true },
      binding.id,
    )

    const [passport, consumed, comps] = await Promise.all([
      db.passport.findUnique({ where: { id: fx.nodePassportId } }),
      db.lineagePendingClaim.findUnique({ where: { id: binding.id } }),
      db.userEntitlement.findMany({
        where: { userId: fx.claimantUserId, status: "ACTIVE" },
        include: { entitlement: { select: { key: true } } },
      }),
    ])
    expect(passport?.userId).toBe(fx.claimantUserId)
    expect(consumed?.consumedAt).toBeInstanceOf(Date)
    expect(consumed?.consumedByUserId).toBe(fx.claimantUserId)
    expect(comps.map(c => c.entitlement.key).sort()).toEqual([
      LINEAGE_ELITE_ENTITLEMENT_KEY,
      LINEAGE_PREMIUM_ENTITLEMENT_KEY,
    ])
  })

  it("UNVERIFIED email → no claim, binding left untouched", async () => {
    const fx = await createFixture("unverified")
    const binding = await bind(fx.claimantEmail, fx.nodeId)

    await reconcilePendingLineageClaims({
      userId: fx.claimantUserId,
      email: fx.claimantEmail,
      emailVerified: false,
    })

    const [passport, untouched] = await Promise.all([
      db.passport.findUnique({ where: { id: fx.nodePassportId } }),
      db.lineagePendingClaim.findUnique({ where: { id: binding.id } }),
    ])
    expect(passport?.userId).toBeNull()
    expect(untouched?.consumedAt).toBeNull()
  })

  it("no binding for the email → no-op, no throw", async () => {
    const fx = await createFixture("no-binding")
    await reconcilePendingLineageClaims({
      userId: fx.claimantUserId,
      email: fx.claimantEmail,
      emailVerified: true,
    })
    const passport = await db.passport.findUnique({ where: { id: fx.nodePassportId } })
    expect(passport?.userId).toBeNull()
  })

  it("node already owned by someone else → never throws, binding stays unconsumed for retry", async () => {
    const fx = await createFixture("taken", true)
    const binding = await bind(fx.claimantEmail, fx.nodeId)

    await reconcilePendingLineageClaims({
      userId: fx.claimantUserId,
      email: fx.claimantEmail,
      emailVerified: true,
    })

    const [passport, stillPending] = await Promise.all([
      db.passport.findUnique({ where: { id: fx.nodePassportId } }),
      db.lineagePendingClaim.findUnique({ where: { id: binding.id } }),
    ])
    // The prior owner keeps the node; the claimant did not take it.
    expect(passport?.userId).not.toBe(fx.claimantUserId)
    expect(passport?.userId).toBeTruthy()
    expect(stillPending?.consumedAt).toBeNull()
  })

  it("expired binding → ignored", async () => {
    const fx = await createFixture("expired")
    const binding = await bind(fx.claimantEmail, fx.nodeId, new Date(Date.now() - 1000))

    await reconcilePendingLineageClaims({
      userId: fx.claimantUserId,
      email: fx.claimantEmail,
      emailVerified: true,
    })

    const [passport, untouched] = await Promise.all([
      db.passport.findUnique({ where: { id: fx.nodePassportId } }),
      db.lineagePendingClaim.findUnique({ where: { id: binding.id } }),
    ])
    expect(passport?.userId).toBeNull()
    expect(untouched?.consumedAt).toBeNull()
  })
})
