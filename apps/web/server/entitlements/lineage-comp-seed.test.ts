/**
 * SESSION_0346 TASK_03 — multi-rank/multi-student lineage comp seed fixture.
 *
 * Run: cd apps/web && bun test server/entitlements/lineage-comp-seed.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, describe, expect, it } from "bun:test"
import {
  cleanupLineageCompFixture,
  type LineageCompSeedFixture,
  readLineageCompFixtureState,
  seedLineageCompFixture,
} from "~/e2e/helpers/seed-lineage-comp-fixture"
import {
  LINEAGE_ELITE_ENTITLEMENT_KEY,
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
} from "~/lib/entitlements/lineage-comp"
import { grantComp } from "~/server/entitlements/comp-grants"
import { db } from "~/services/db"

const TEST_BRAND = "BASELINE_MARTIAL_ARTS" as const

let fixture: LineageCompSeedFixture | null = null

afterAll(async () => {
  if (fixture) {
    await cleanupLineageCompFixture(fixture)
  }
}, 60_000)

describe("lineage comp multi-rank seed fixture", () => {
  it("seeds deterministic instructor branches, rank awards, and mixed comp tiers", async () => {
    fixture = await seedLineageCompFixture()

    expect(fixture.instructorUserIds).toHaveLength(2)
    expect(fixture.students).toHaveLength(20)
    expect(fixture.rankIds).toHaveLength(5)
    expect(fixture.rankAwardIds).toHaveLength(22)
    expect(fixture.relationshipIds).toHaveLength(20)
    expect(fixture.premiumUserIds).toHaveLength(2)
    expect(fixture.eliteUserIds).toHaveLength(2)

    const state = await readLineageCompFixtureState(fixture)
    for (const instructorUserId of fixture.instructorUserIds) {
      const countsByRank = state.studentCountByInstructorAndRank[instructorUserId]
      expect(Object.values(countsByRank ?? {})).toHaveLength(5)
      for (const count of Object.values(countsByRank ?? {})) {
        expect(count).toBe(2)
      }
    }

    for (const userId of fixture.premiumUserIds) {
      expect(state.compGrantCountByUserId[userId]).toBe(1)
    }
    for (const userId of fixture.eliteUserIds) {
      expect(state.compGrantCountByUserId[userId]).toBe(2)
    }
    const uncompedStudent = fixture.students.find(student => student.compTier === "NONE")
    expect(uncompedStudent).toBeTruthy()
    expect(state.compGrantCountByUserId[uncompedStudent!.userId]).toBeUndefined()
  }, 30_000)

  it("supports idempotent comp re-grant against a seeded actor", async () => {
    if (!fixture) throw new Error("fixture not initialized")

    const granteeUserId = fixture.premiumUserIds[0]!
    const grantorUserId = fixture.instructorUserIds[0]!

    await grantComp({
      db,
      brand: TEST_BRAND,
      grantorUserId,
      granteeUserId,
      entitlementKeys: [LINEAGE_PREMIUM_ENTITLEMENT_KEY],
      reason: "seed-premium",
    })

    const grants = await db.userEntitlement.findMany({
      where: {
        userId: granteeUserId,
        sourceType: "MANUAL_GRANT",
        sourceId: `grant:${grantorUserId}:seed-premium`,
        entitlement: { brand: TEST_BRAND, key: LINEAGE_PREMIUM_ENTITLEMENT_KEY },
      },
    })
    const eliteGrantCount = await db.userEntitlement.count({
      where: {
        userId: granteeUserId,
        sourceType: "MANUAL_GRANT",
        entitlement: { brand: TEST_BRAND, key: LINEAGE_ELITE_ENTITLEMENT_KEY },
      },
    })

    expect(grants).toHaveLength(1)
    expect(grants[0]?.status).toBe("ACTIVE")
    expect(eliteGrantCount).toBe(0)
  }, 30_000)
})
