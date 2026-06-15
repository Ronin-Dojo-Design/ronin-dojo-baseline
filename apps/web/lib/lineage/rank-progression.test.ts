import assert from "node:assert/strict"
import { describe, test } from "node:test"
import type { LineageNodeProfile } from "~/server/web/lineage/payloads"
import {
  BELT_PROMOTION_POINTS,
  buildAchievementsUnlocked,
  buildBeltProgressions,
  totalProgressionPoints,
} from "./rank-progression"

type RankAward = NonNullable<LineageNodeProfile["passport"]>["rankAwardsEarned"][number]

const BJJ_RANKS = [
  { id: "rank-white", sortOrder: 1, name: "White Belt", shortName: "White", colorHex: "#ffffff" },
  { id: "rank-blue", sortOrder: 2, name: "Blue Belt", shortName: "Blue", colorHex: "#1d4ed8" },
  {
    id: "rank-purple",
    sortOrder: 3,
    name: "Purple Belt",
    shortName: "Purple",
    colorHex: "#7c3aed",
  },
  { id: "rank-brown", sortOrder: 4, name: "Brown Belt", shortName: "Brown", colorHex: "#92400e" },
  { id: "rank-black", sortOrder: 5, name: "Black Belt", shortName: "Black", colorHex: "#0f172a" },
] as const

const KARATE_RANKS = [
  { id: "k-white", sortOrder: 1, name: "White", shortName: "White", colorHex: "#ffffff" },
  { id: "k-yellow", sortOrder: 2, name: "Yellow", shortName: "Yellow", colorHex: "#facc15" },
  { id: "k-black", sortOrder: 3, name: "Black", shortName: "Black", colorHex: "#0f172a" },
] as const

function makeAward(opts: {
  id: string
  rankId: string
  rankName: string
  rankColorHex?: string | null
  rankSortOrder?: number
  rankSystemId?: string
  rankSystemName?: string
  disciplineName?: string | null
  ranks?: ReadonlyArray<{
    id: string
    sortOrder: number
    name: string
    shortName: string | null
    colorHex: string | null
  }>
  awardedAt?: Date | null
  awarderName?: string | null
  organizationName?: string | null
}): RankAward {
  const systemId = opts.rankSystemId ?? "system-bjj"
  const systemName = opts.rankSystemName ?? "BJJ Adult Belt System"
  const disciplineName = opts.disciplineName ?? "Brazilian Jiu-Jitsu"
  return {
    id: opts.id,
    awardedAt: opts.awardedAt ?? null,
    location: null,
    rank: {
      id: opts.rankId,
      name: opts.rankName,
      shortName: opts.rankName,
      colorHex: opts.rankColorHex ?? "#000000",
      sortOrder: opts.rankSortOrder ?? 1,
      rankSystem: {
        id: systemId,
        name: systemName,
        discipline: disciplineName
          ? { id: `disc-${systemId}`, name: disciplineName, slug: "bjj", code: "BJJ" }
          : null,
        ranks: opts.ranks ?? BJJ_RANKS,
      },
    },
    awardedBy: opts.awarderName ? { id: "u-awarder", name: opts.awarderName, image: null } : null,
    organization: opts.organizationName
      ? {
          id: "org-1",
          name: opts.organizationName,
          slug: "org",
          city: null,
          state: null,
        }
      : null,
    promotionEvent: null,
  } as unknown as RankAward
}

describe("buildBeltProgressions", () => {
  test("returns empty list when there are no awards", () => {
    const result = buildBeltProgressions([])
    assert.deepEqual(result, [])
    assert.equal(totalProgressionPoints(result), 0)
  })

  test("classifies the highest earned rank as 'current' and unawarded ranks as 'locked'", () => {
    const blueAward = makeAward({
      id: "a-blue",
      rankId: "rank-blue",
      rankName: "Blue Belt",
      rankColorHex: "#1d4ed8",
      rankSortOrder: 2,
      awardedAt: new Date("2024-06-01"),
    })
    const [progression] = buildBeltProgressions([blueAward])
    assert.ok(progression)
    assert.equal(progression.totalLevels, BJJ_RANKS.length)
    assert.equal(progression.earnedCount, 1)
    assert.equal(progression.points, BELT_PROMOTION_POINTS)
    assert.equal(progression.currentLevelIndex, 1) // blue is index 1 in sorted ranks
    const statuses = progression.levels.map(l => l.status)
    assert.deepEqual(statuses, ["locked", "current", "locked", "locked", "locked"])
    const blueLevel = progression.levels[1]!
    assert.equal(blueLevel.rank.name, "Blue Belt")
    assert.equal(blueLevel.rank.colorHex, "#1d4ed8")
    assert.ok(blueLevel.awardedAt instanceof Date)
  })

  test("multiple earned ranks: highest is 'current', the rest are 'earned'", () => {
    const whiteAward = makeAward({
      id: "a-white",
      rankId: "rank-white",
      rankName: "White Belt",
      rankSortOrder: 1,
      awardedAt: new Date("2020-01-01"),
    })
    const blueAward = makeAward({
      id: "a-blue",
      rankId: "rank-blue",
      rankName: "Blue Belt",
      rankSortOrder: 2,
      awardedAt: new Date("2022-01-01"),
    })
    const purpleAward = makeAward({
      id: "a-purple",
      rankId: "rank-purple",
      rankName: "Purple Belt",
      rankSortOrder: 3,
      awardedAt: new Date("2024-06-01"),
    })

    const [progression] = buildBeltProgressions([whiteAward, blueAward, purpleAward])
    assert.ok(progression)
    assert.equal(progression.earnedCount, 3)
    assert.equal(progression.points, 3 * BELT_PROMOTION_POINTS)
    assert.equal(progression.currentLevelIndex, 2)
    const statuses = progression.levels.map(l => l.status)
    assert.deepEqual(statuses, ["earned", "earned", "current", "locked", "locked"])
  })

  test("groups by rank-system and sorts by discipline name then system name", () => {
    const blueAward = makeAward({
      id: "a-blue",
      rankId: "rank-blue",
      rankName: "Blue Belt",
      rankSortOrder: 2,
      awardedAt: new Date("2024-06-01"),
    })
    const karateYellow = makeAward({
      id: "a-karate-yellow",
      rankId: "k-yellow",
      rankName: "Yellow",
      rankSortOrder: 2,
      rankSystemId: "system-karate",
      rankSystemName: "Karate Kyu System",
      disciplineName: "Karate",
      ranks: KARATE_RANKS,
      awardedAt: new Date("2023-01-01"),
    })
    const progressions = buildBeltProgressions([blueAward, karateYellow])
    assert.equal(progressions.length, 2)
    // Brazilian Jiu-Jitsu sorts before Karate alphabetically.
    assert.equal(progressions[0]!.rankSystem.discipline?.name, "Brazilian Jiu-Jitsu")
    assert.equal(progressions[1]!.rankSystem.discipline?.name, "Karate")
    assert.equal(progressions[1]!.totalLevels, KARATE_RANKS.length)
    assert.equal(progressions[1]!.currentLevelIndex, 1)
  })

  test("preserves earned status when the user skipped a rank (no inferred fills)", () => {
    // Awarded Black with no Brown — Brown stays locked because no RankAward exists for it.
    const blackAward = makeAward({
      id: "a-black",
      rankId: "rank-black",
      rankName: "Black Belt",
      rankColorHex: "#0f172a",
      rankSortOrder: 5,
      awardedAt: new Date("2025-12-01"),
    })
    const [progression] = buildBeltProgressions([blackAward])
    assert.ok(progression)
    const statuses = progression.levels.map(l => l.status)
    assert.deepEqual(statuses, ["locked", "locked", "locked", "locked", "current"])
    assert.equal(progression.earnedCount, 1)
    assert.equal(progression.points, BELT_PROMOTION_POINTS)
  })
})

describe("buildAchievementsUnlocked", () => {
  test("returns one entry per award sorted by date descending", () => {
    const older = makeAward({
      id: "a-1",
      rankId: "rank-white",
      rankName: "White Belt",
      rankSortOrder: 1,
      awardedAt: new Date("2020-01-01"),
    })
    const newer = makeAward({
      id: "a-2",
      rankId: "rank-blue",
      rankName: "Blue Belt",
      rankSortOrder: 2,
      awardedAt: new Date("2024-06-01"),
      awarderName: "Master Smith",
      organizationName: "Smith Academy",
    })
    const unlocks = buildAchievementsUnlocked([older, newer])
    assert.equal(unlocks.length, 2)
    assert.equal(unlocks[0]!.id, "a-2")
    assert.equal(unlocks[0]!.rank.name, "Blue Belt")
    assert.equal(unlocks[0]!.awarderName, "Master Smith")
    assert.equal(unlocks[0]!.organizationName, "Smith Academy")
    assert.equal(unlocks[0]!.points, BELT_PROMOTION_POINTS)
    assert.equal(unlocks[1]!.id, "a-1")
  })

  test("pushes null-date awards to the bottom of the rail", () => {
    const dated = makeAward({
      id: "a-dated",
      rankId: "rank-white",
      rankName: "White Belt",
      rankSortOrder: 1,
      awardedAt: new Date("2024-01-01"),
    })
    const undated = makeAward({
      id: "a-undated",
      rankId: "rank-blue",
      rankName: "Blue Belt",
      rankSortOrder: 2,
      awardedAt: null,
    })
    const unlocks = buildAchievementsUnlocked([undated, dated])
    assert.equal(unlocks[0]!.id, "a-dated")
    assert.equal(unlocks[1]!.id, "a-undated")
    assert.equal(unlocks[1]!.awardedAt, null)
  })
})

describe("totalProgressionPoints", () => {
  test("sums points across multiple progressions", () => {
    const a = makeAward({
      id: "a-blue",
      rankId: "rank-blue",
      rankName: "Blue Belt",
      rankSortOrder: 2,
      awardedAt: new Date("2024-06-01"),
    })
    const b = makeAward({
      id: "a-karate",
      rankId: "k-yellow",
      rankName: "Yellow",
      rankSortOrder: 2,
      rankSystemId: "system-karate",
      rankSystemName: "Karate Kyu System",
      disciplineName: "Karate",
      ranks: KARATE_RANKS,
      awardedAt: new Date("2023-01-01"),
    })
    const progressions = buildBeltProgressions([a, b])
    assert.equal(totalProgressionPoints(progressions), 2 * BELT_PROMOTION_POINTS)
  })
})
