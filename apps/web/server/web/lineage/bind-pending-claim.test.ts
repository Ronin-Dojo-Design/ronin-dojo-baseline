/**
 * SESSION_0513 — bindPendingClaim + buildClaimSignInUrl tests.
 *
 * The durable-email fix: emails no longer embed a one-shot magic-link token (a mail scanner /
 * late click consumed the single use → dead link). Instead we bind the email→node durably here
 * and link the email to a plain public sign-in URL; `reconcilePendingLineageClaims` (exercised in
 * reconcile-pending-claims.test.ts) claims the bound node on the recipient's next sign-in.
 *
 * These assert the SAFETY scoping of the binding write itself: only a claimable, UNOWNED node on
 * a published + claimable tree binds; an already-owned node or a non-existent node is a no-op. And
 * the sign-in URL stays QUERY-FREE (no nested `?` → no Better-Auth double-decode trap).
 *
 * Run: cd apps/web && bun run test server/web/lineage/bind-pending-claim.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, describe, expect, it } from "bun:test"

import { bindPendingClaim, buildClaimSignInUrl } from "~/server/web/lineage/mint-claim-magic-link"
import { db } from "~/services/db"

const TEST_BRAND = "BBL" as const
const TS = Date.now()
const PREFIX = `session-0513-${TS}`
const tag = (name: string) => `${PREFIX}-${name}`

type Fixture = { nodeId: string; nodePassportId: string; email: string }

/** A claimable node in a published+claimable BBL tree; owned iff `accountful`. */
const createFixture = async (name: string, accountful = false): Promise<Fixture> => {
  const email = `${tag(name)}@test.local`
  const owner = accountful
    ? await db.user.create({
        data: { id: tag(`${name}-owner`), name: tag(name), email: `${tag(name)}-owner@test.local` },
      })
    : null
  const nodePassport = await db.passport.create({
    data: owner
      ? { userId: owner.id, displayName: tag(`${name}-passport`) }
      : { displayName: tag(`${name}-passport`) },
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
  return { nodeId: node.id, nodePassportId: nodePassport.id, email }
}

afterAll(async () => {
  await db.lineagePendingClaim.deleteMany({ where: { email: { contains: PREFIX.toLowerCase() } } })
  await db.lineageTreeMember.deleteMany({ where: { treeId: { startsWith: PREFIX } } })
  await db.lineageTree.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.lineageNode.deleteMany({ where: { slug: { startsWith: PREFIX } } })
  await db.passport.deleteMany({ where: { displayName: { startsWith: PREFIX } } })
  await db.user.deleteMany({ where: { id: { startsWith: PREFIX } } })
})

describe("bindPendingClaim", () => {
  it("claimable, unowned node → creates the LineagePendingClaim row (brand + 90-day TTL)", async () => {
    const fx = await createFixture("claimable")

    await bindPendingClaim(fx.email, fx.nodeId)

    const row = await db.lineagePendingClaim.findUnique({
      where: { email_nodeId: { email: fx.email.toLowerCase(), nodeId: fx.nodeId } },
    })
    expect(row).not.toBeNull()
    expect(row?.brand).toBe(TEST_BRAND)
    expect(row?.consumedAt).toBeNull()
    // ~90 days out (allow generous slack for test runtime).
    const days = (row!.expiresAt!.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    expect(days).toBeGreaterThan(89)
    expect(days).toBeLessThan(91)
  })

  it("re-bind for the same email+node → upserts (re-arms), no duplicate row", async () => {
    const fx = await createFixture("rearm")

    await bindPendingClaim(fx.email, fx.nodeId)
    // Simulate a prior consumption, then re-mint: the update branch must clear it.
    await db.lineagePendingClaim.update({
      where: { email_nodeId: { email: fx.email.toLowerCase(), nodeId: fx.nodeId } },
      data: { consumedAt: new Date() },
    })
    await bindPendingClaim(fx.email, fx.nodeId)

    const rows = await db.lineagePendingClaim.findMany({ where: { nodeId: fx.nodeId } })
    expect(rows).toHaveLength(1)
    expect(rows[0]?.consumedAt).toBeNull()
  })

  it("node already owned by an account → NO-OP (never bind someone else's claimed node)", async () => {
    const fx = await createFixture("owned", true)

    await bindPendingClaim(fx.email, fx.nodeId)

    const row = await db.lineagePendingClaim.findUnique({
      where: { email_nodeId: { email: fx.email.toLowerCase(), nodeId: fx.nodeId } },
    })
    expect(row).toBeNull()
  })

  it("non-existent node → NO-OP, no throw", async () => {
    await bindPendingClaim(`${tag("ghost")}@test.local`, tag("does-not-exist"))
    const row = await db.lineagePendingClaim.findFirst({
      where: { nodeId: tag("does-not-exist") },
    })
    expect(row).toBeNull()
  })
})

describe("buildClaimSignInUrl", () => {
  it("defaults to /me and stays QUERY-FREE (single `?`, no nested query → no double-decode trap)", () => {
    const url = buildClaimSignInUrl("https://blackbeltlegacy.com")
    expect(url).toBe("https://blackbeltlegacy.com/auth/login?next=%2Fme")
    // Exactly one `?` (the login query) and no bare `/api/auth/magic-link/verify` token.
    expect(url.split("?").length - 1).toBe(1)
    expect(url).not.toContain("token=")
    expect(url).not.toContain("magic-link/verify")
  })

  it("trims a trailing slash on the base URL", () => {
    expect(buildClaimSignInUrl("https://blackbeltlegacy.com/")).toBe(
      "https://blackbeltlegacy.com/auth/login?next=%2Fme",
    )
  })

  it("encodes a custom relative nextPath", () => {
    expect(buildClaimSignInUrl("https://blackbeltlegacy.com", "/lineage")).toBe(
      "https://blackbeltlegacy.com/auth/login?next=%2Flineage",
    )
  })
})
