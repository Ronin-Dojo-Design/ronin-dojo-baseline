/**
 * SESSION_0721 — Integration test for the DB-backed lineage tier policy resolvers
 * (server/web/entitlements/lineage-tier-policy.ts). Additive/behavior-locking: pins the
 * CURRENT free-vs-paid lineage render boundary against the REAL Prisma query — the pure
 * resolver (`resolveLineageListingRenderPolicyFromEntitlementKeys` and friends) already has
 * unit coverage in lib/entitlements/lineage-tier-policy.test.ts; this file exercises the DB
 * wiring on top of it (the `db.userEntitlement.findMany` lookup via `activeEntitlementWhereForUsers`).
 *
 * Covers:
 * - getLineageListingRenderPolicyForUser: no-userId short-circuit, a free-tier user (no active
 *   entitlement), and an entitled user (active LINEAGE_PREMIUM grant).
 * - getLineageListingRenderPoliciesForUsers: the batch map for a mixed free+entitled userIds
 *   array, plus the empty-array no-op.
 * - getLineageProfileDetailRenderPolicyForUser / getLineageProfileDetailRenderPoliciesForUsers:
 *   the profile-detail derivation mirrors the listing-policy tier for both sessions.
 *
 * Uses real Postgres dev DB. Fixtures use unique per-run ids and are cleaned up in FK order,
 * mirroring server/web/entitlements/queries.integration.test.ts.
 *
 * Run: cd apps/web && bun test server/web/entitlements/lineage-tier-policy.integration.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { afterAll, beforeAll, describe, expect, it } from "bun:test"
import type { Brand } from "~/.generated/prisma/client"
import { LINEAGE_PREMIUM_ENTITLEMENT_KEY } from "~/lib/entitlements/lineage-comp"
import {
  FREE_LINEAGE_LISTING_RENDER_POLICY,
  FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
  PREMIUM_LINEAGE_LISTING_RENDER_POLICY,
  PREMIUM_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
} from "~/lib/entitlements/lineage-tier-policy"
import {
  getLineageListingRenderPoliciesForUsers,
  getLineageListingRenderPolicyForUser,
  getLineageProfileDetailRenderPoliciesForUsers,
  getLineageProfileDetailRenderPolicyForUser,
} from "~/server/web/entitlements/lineage-tier-policy"
import { db } from "~/services/db"

const BRAND: Brand = "BBL"
const TEST_PREFIX = `test-lineage-tier-policy-integ-${Date.now()}-`
const tag = (suffix: string) => `${TEST_PREFIX}${suffix}`

// Track created IDs for FK-ordered cleanup (mirrors queries.integration.test.ts).
const cleanup: {
  userIds: string[]
  entitlementId: string | null
  userEntitlementIds: string[]
} = {
  userIds: [],
  entitlementId: null,
  userEntitlementIds: [],
}

describe("lineage tier policy (DB-backed)", () => {
  let freeUserId: string
  let entitledUserId: string

  beforeAll(async () => {
    // The resolver checks the literal LINEAGE_PREMIUM_ENTITLEMENT_KEY string (not a caller-
    // supplied key, unlike hasAnyActiveEntitlement) — the Entitlement row must carry that exact
    // key. The row already exists in prodsnap (brand+key is @@unique); find-or-create so the
    // test is safe to run against a fresh DB too, and only clean up what we created.
    let entitlement = await db.entitlement.findUnique({
      where: { brand_key: { brand: BRAND, key: LINEAGE_PREMIUM_ENTITLEMENT_KEY } },
    })
    if (!entitlement) {
      entitlement = await db.entitlement.create({
        data: {
          brand: BRAND,
          key: LINEAGE_PREMIUM_ENTITLEMENT_KEY,
          name: "Black Belt Legacy — Premium (test-created)",
        },
      })
      cleanup.entitlementId = entitlement.id
    }

    const freeUser = await db.user.create({
      data: { name: tag("free-user"), email: `${tag("free-user")}@test.local` },
    })
    cleanup.userIds.push(freeUser.id)
    freeUserId = freeUser.id

    const entitledUser = await db.user.create({
      data: { name: tag("entitled-user"), email: `${tag("entitled-user")}@test.local` },
    })
    cleanup.userIds.push(entitledUser.id)
    entitledUserId = entitledUser.id

    const grant = await db.userEntitlement.create({
      data: {
        userId: entitledUser.id,
        entitlementId: entitlement.id,
        sourceType: "MANUAL_GRANT",
        status: "ACTIVE",
      },
    })
    cleanup.userEntitlementIds.push(grant.id)
  })

  afterAll(async () => {
    // Clean up in reverse dependency order.
    if (cleanup.userEntitlementIds.length) {
      await db.userEntitlement.deleteMany({ where: { id: { in: cleanup.userEntitlementIds } } })
    }
    if (cleanup.entitlementId) {
      await db.entitlement.delete({ where: { id: cleanup.entitlementId } })
    }
    // Clean up users — must delete passport + directoryProfile first.
    for (const userId of cleanup.userIds) {
      await db.passport.deleteMany({ where: { userId } })
      await db.directoryProfile.deleteMany({ where: { passport: { userId } } })
      await db.account.deleteMany({ where: { userId } })
      await db.session.deleteMany({ where: { userId } })
    }
    if (cleanup.userIds.length) {
      await db.user.deleteMany({ where: { id: { in: cleanup.userIds } } })
    }
  })

  describe("getLineageListingRenderPolicyForUser", () => {
    it("returns the FREE policy when userId is null (no entitled session)", async () => {
      const policy = await getLineageListingRenderPolicyForUser({ userId: null, brand: BRAND })
      expect(policy).toEqual(FREE_LINEAGE_LISTING_RENDER_POLICY)
    })

    it("returns the FREE policy when userId is omitted (anonymous request)", async () => {
      const policy = await getLineageListingRenderPolicyForUser({ brand: BRAND })
      expect(policy).toEqual(FREE_LINEAGE_LISTING_RENDER_POLICY)
    })

    it("returns the FREE policy for a real user with no active lineage entitlement", async () => {
      const policy = await getLineageListingRenderPolicyForUser({
        userId: freeUserId,
        brand: BRAND,
      })
      expect(policy).toEqual(FREE_LINEAGE_LISTING_RENDER_POLICY)
    })

    it("returns the PREMIUM policy for a user with an active LINEAGE_PREMIUM entitlement", async () => {
      const policy = await getLineageListingRenderPolicyForUser({
        userId: entitledUserId,
        brand: BRAND,
      })
      expect(policy).toEqual(PREMIUM_LINEAGE_LISTING_RENDER_POLICY)
    })
  })

  describe("getLineageListingRenderPoliciesForUsers", () => {
    it("resolves a mixed batch — the free user stays FREE, the entitled user resolves PREMIUM", async () => {
      const policies = await getLineageListingRenderPoliciesForUsers({
        userIds: [freeUserId, entitledUserId],
        brand: BRAND,
      })

      expect(policies.get(freeUserId)).toEqual(FREE_LINEAGE_LISTING_RENDER_POLICY)
      expect(policies.get(entitledUserId)).toEqual(PREMIUM_LINEAGE_LISTING_RENDER_POLICY)
    })

    it("returns an empty map for an empty userIds array", async () => {
      const policies = await getLineageListingRenderPoliciesForUsers({ userIds: [], brand: BRAND })
      expect(policies.size).toBe(0)
    })
  })

  describe("getLineageProfileDetailRenderPolicyForUser", () => {
    it("returns the FREE profile-detail policy (basic fields granted, rich media gated) for a free user", async () => {
      const policy = await getLineageProfileDetailRenderPolicyForUser({
        userId: freeUserId,
        brand: BRAND,
      })
      expect(policy).toEqual(FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY)
    })

    it("returns the PREMIUM profile-detail policy (rich media unlocked) for an entitled user", async () => {
      const policy = await getLineageProfileDetailRenderPolicyForUser({
        userId: entitledUserId,
        brand: BRAND,
      })
      expect(policy).toEqual(PREMIUM_LINEAGE_PROFILE_DETAIL_RENDER_POLICY)
    })
  })

  describe("getLineageProfileDetailRenderPoliciesForUsers", () => {
    it("resolves a mixed batch mirroring the listing-policy tier for each user", async () => {
      const policies = await getLineageProfileDetailRenderPoliciesForUsers({
        userIds: [freeUserId, entitledUserId],
        brand: BRAND,
      })

      expect(policies.get(freeUserId)).toEqual(FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY)
      expect(policies.get(entitledUserId)).toEqual(PREMIUM_LINEAGE_PROFILE_DETAIL_RENDER_POLICY)
    })
  })
})
