/**
 * Rank-progression PII test (WL-P1-4, SESSION_0334).
 *
 * Run: cd apps/web && bun test lib/lineage/rank-progression.privacy.test.ts
 *
 * The Trophy.so-style rank-progression read model (`buildBeltProgressions`,
 * `buildAchievementsUnlocked`) is a *strict allowlist projection* over the
 * lineage profile payload's `RankAward[]` — it reads a fixed set of fields, never
 * spreads the input. This test proves that by feeding awards adversarially
 * enriched with account PII (email/role/password/notes/phone) on every nested
 * object and asserting NONE of it survives into the public output, while the
 * intentionally-public fields (rank taxonomy + `awardedAt` — operator product
 * call SESSION_0334 — + awarder/school names) still pass through.
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  BELT_PROMOTION_POINTS,
  buildAchievementsUnlocked,
  buildBeltProgressions,
} from "~/lib/lineage/rank-progression"

/** Account PII that must NEVER appear in any public rank-progression output. */
const PII = {
  email: "secret-email@example.com",
  role: "ADMIN",
  password: "hunter2",
  notes: "private-internal-note",
  phone: "+15551234567",
  emergencyContact: "Jane Doe Emergency",
}

const PII_TOKENS = Object.values(PII)

function adversarialAward() {
  return {
    id: "ra-1",
    awardedAt: new Date("2021-06-01T00:00:00.000Z"),
    ...PII, // adversarial: PII smuggled onto the award row itself
    rank: {
      id: "rank-black",
      name: "Black Belt",
      shortName: "BB",
      colorHex: "#000000",
      sortOrder: 10,
      ...PII,
      rankSystem: {
        id: "rs-1",
        name: "IBJJF Adult",
        ...PII,
        discipline: { id: "d-1", name: "BJJ", slug: "bjj", code: "BJJ", ...PII },
        ranks: [
          {
            id: "rank-white",
            name: "White Belt",
            shortName: "WB",
            colorHex: "#ffffff",
            sortOrder: 1,
          },
          {
            id: "rank-black",
            name: "Black Belt",
            shortName: "BB",
            colorHex: "#000000",
            sortOrder: 10,
          },
        ],
      },
    },
    awardedBy: { id: "u-awarder", name: "Professor Helio", ...PII },
    organization: { id: "o-1", name: "Gracie Academy", ...PII },
  }
}

function expectNoPII(value: unknown) {
  const json = JSON.stringify(value)
  for (const token of PII_TOKENS) {
    expect(json.includes(token)).toBe(false)
  }
}

describe("rank-progression read model leaks no account PII", () => {
  it("buildAchievementsUnlocked emits only the allowlisted projection", () => {
    const unlocks = buildAchievementsUnlocked([adversarialAward()] as never)

    expect(unlocks).toHaveLength(1)
    const unlock = unlocks[0]!
    // Intentionally-public fields pass through.
    expect(unlock.rank.name).toBe("Black Belt")
    expect(unlock.rank.colorHex).toBe("#000000")
    expect(unlock.rankSystemName).toBe("IBJJF Adult")
    expect(unlock.disciplineName).toBe("BJJ")
    expect(unlock.awarderName).toBe("Professor Helio")
    expect(unlock.organizationName).toBe("Gracie Academy")
    expect(unlock.points).toBe(BELT_PROMOTION_POINTS)
    // awardedAt is public per the SESSION_0334 product decision.
    expect(unlock.awardedAt?.toISOString()).toBe("2021-06-01T00:00:00.000Z")
    // No account PII anywhere in the output.
    expectNoPII(unlocks)
  })

  it("buildBeltProgressions projects rank taxonomy + awardedAt, no PII", () => {
    const progressions = buildBeltProgressions([adversarialAward()] as never)

    expect(progressions).toHaveLength(1)
    const progression = progressions[0]!
    expect(progression.rankSystem.name).toBe("IBJJF Adult")
    expect(progression.rankSystem.discipline?.name).toBe("BJJ")
    expect(progression.totalLevels).toBe(2)
    expect(progression.points).toBe(BELT_PROMOTION_POINTS)

    const black = progression.levels.find(l => l.rank.id === "rank-black")
    expect(black?.status).toBe("current")
    // awardedAt is public per the product decision.
    expect(black?.awardedAt?.toISOString()).toBe("2021-06-01T00:00:00.000Z")
    // The un-earned White Belt is locked with no date.
    const white = progression.levels.find(l => l.rank.id === "rank-white")
    expect(white?.status).toBe("locked")
    expect(white?.awardedAt).toBeNull()

    expectNoPII(progressions)
  })

  it("never emits a member account id/email even when present on the input", () => {
    const json = JSON.stringify({
      unlocks: buildAchievementsUnlocked([adversarialAward()] as never),
      progressions: buildBeltProgressions([adversarialAward()] as never),
    })
    // The awarder's *id* is not part of the public projection either.
    expect(json.includes("u-awarder")).toBe(false)
    expect(json.includes("email")).toBe(false)
  })
})
