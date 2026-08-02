import assert from "node:assert/strict"
import { describe, test } from "node:test"
import type { BeltFamily } from "~/components/common/belt-swatch"
import type { LineageNodeProfile } from "~/server/web/lineage/payloads"
import {
  type BeltProgression,
  BELT_PROMOTION_POINTS,
  buildAchievementsUnlocked,
  buildBeltProgressions,
  isBlackBeltRateEligible,
  totalProgressionPoints,
} from "./rank-progression"

type RankEntry = NonNullable<LineageNodeProfile["passport"]>["rankEntries"][number]

const BJJ_RANKS = [
  {
    id: "rank-white",
    sortOrder: 1,
    name: "White Belt",
    shortName: "White",
    colorHex: "#ffffff",
    beltFamily: "COLORED",
  },
  {
    id: "rank-blue",
    sortOrder: 2,
    name: "Blue Belt",
    shortName: "Blue",
    colorHex: "#1d4ed8",
    beltFamily: "COLORED",
  },
  {
    id: "rank-purple",
    sortOrder: 3,
    name: "Purple Belt",
    shortName: "Purple",
    colorHex: "#7c3aed",
    beltFamily: "COLORED",
  },
  {
    id: "rank-brown",
    sortOrder: 4,
    name: "Brown Belt",
    shortName: "Brown",
    colorHex: "#92400e",
    beltFamily: "COLORED",
  },
  {
    id: "rank-black",
    sortOrder: 5,
    name: "Black Belt",
    shortName: "Black",
    colorHex: "#0f172a",
    beltFamily: "BLACK",
  },
] as const

const KARATE_RANKS = [
  {
    id: "k-white",
    sortOrder: 1,
    name: "White",
    shortName: "White",
    colorHex: "#ffffff",
    beltFamily: "COLORED",
  },
  {
    id: "k-yellow",
    sortOrder: 2,
    name: "Yellow",
    shortName: "Yellow",
    colorHex: "#facc15",
    beltFamily: "COLORED",
  },
  {
    id: "k-black",
    sortOrder: 3,
    name: "Black",
    shortName: "Black",
    colorHex: "#0f172a",
    beltFamily: "BLACK",
  },
] as const

function makeAward(opts: {
  id: string
  rankId: string
  rankName: string
  rankColorHex?: string | null
  rankSortOrder?: number
  // Structured belt-family for the entry's own rank. Only consulted for eligibility
  // when the widened system ladder omits this rank (the recordEarnedRank fallback);
  // otherwise the level's beltFamily comes from `ranks` (default: BJJ_RANKS).
  rankBeltFamily?: BeltFamily | null
  rankSystemId?: string
  rankSystemName?: string
  disciplineName?: string | null
  ranks?: ReadonlyArray<{
    id: string
    sortOrder: number
    name: string
    shortName: string | null
    colorHex: string | null
    beltFamily?: BeltFamily | null
  }>
  awardedAt?: Date | null
  awarderName?: string | null
  organizationName?: string | null
}): RankEntry {
  const systemId = opts.rankSystemId ?? "system-bjj"
  const systemName = opts.rankSystemName ?? "BJJ Adult Belt System"
  const disciplineName = opts.disciplineName ?? "Brazilian Jiu-Jitsu"
  // #376: the row IS a RankEntry; the ceremony facts (id/awardedAt/awarder/org) live on the anchor
  // award, reached via the required `rankAward` relation.
  return {
    id: `entry-${opts.id}`,
    status: "VERIFIED",
    rank: {
      id: opts.rankId,
      name: opts.rankName,
      shortName: opts.rankName,
      colorHex: opts.rankColorHex ?? "#000000",
      sortOrder: opts.rankSortOrder ?? 1,
      beltFamily: opts.rankBeltFamily ?? null,
      rankSystem: {
        id: systemId,
        name: systemName,
        discipline: disciplineName
          ? { id: `disc-${systemId}`, name: disciplineName, slug: "bjj", code: "BJJ" }
          : null,
        ranks: opts.ranks ?? BJJ_RANKS,
      },
    },
    rankAward: {
      id: opts.id,
      awardedAt: opts.awardedAt ?? null,
      location: null,
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
    },
  } as unknown as RankEntry
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

  test("keeps the newest ceremony date when duplicate entries reference the same rank", () => {
    const older = makeAward({
      id: "a-blue-old",
      rankId: "rank-blue",
      rankName: "Blue Belt",
      rankSortOrder: 2,
      awardedAt: new Date("2020-01-01"),
    })
    const newer = makeAward({
      id: "a-blue-new",
      rankId: "rank-blue",
      rankName: "Blue Belt",
      rankSortOrder: 2,
      awardedAt: new Date("2024-01-01"),
    })

    const [progression] = buildBeltProgressions([older, newer])
    const blue = progression?.levels.find(level => level.rank.id === "rank-blue")
    assert.equal(blue?.status, "current")
    assert.equal(blue?.awardedAt?.toISOString(), "2024-01-01T00:00:00.000Z")
    assert.equal(progression?.earnedCount, 1)
  })

  test("adds the awarded rank when a widened system ladder omits it", () => {
    const purpleAward = makeAward({
      id: "a-purple-missing",
      rankId: "rank-purple",
      rankName: "Purple Belt",
      rankSortOrder: 3,
      ranks: BJJ_RANKS.filter(rank => rank.id !== "rank-purple"),
      awardedAt: new Date("2024-01-01"),
    })

    const [progression] = buildBeltProgressions([purpleAward])
    const purple = progression?.levels.find(level => level.rank.id === "rank-purple")
    assert.equal(purple?.status, "current")
    assert.equal(progression?.currentLevelIndex, 2)
    assert.equal(progression?.totalLevels, BJJ_RANKS.length)
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

// SESSION_0473 TASK_03 — BBL "Black Belt rate" eligibility predicate.
// D-062 (SESSION_0735): the gate keys off the structured `Rank.beltFamily` enum, NOT
// the display name — so `prog()` fixtures carry an explicit `beltFamily` per level and
// a deliberately DECOUPLED display `name`. `makeAward` always stamps slug "bjj", so the
// discipline-scoping branches use the minimal direct `prog()` fixture; the happy path
// runs the real buildBeltProgressions.
type ProgLevel = {
  beltFamily: BeltFamily | null
  status: "earned" | "current" | "locked"
  /** Display name — deliberately independent of `beltFamily` (proves the gate ignores it). */
  name?: string
}

function prog(disciplineSlug: string | null, levels: ProgLevel[]): BeltProgression {
  return {
    rankSystem: {
      id: "rs",
      name: "System",
      discipline:
        disciplineSlug === null
          ? null
          : { id: "d", name: "Discipline", slug: disciplineSlug, code: null },
    },
    levels: levels.map((level, i) => ({
      rank: {
        id: `r${i}`,
        name: level.name ?? `Rank ${i}`,
        shortName: null,
        colorHex: null,
        sortOrder: i,
        beltFamily: level.beltFamily,
      },
      status: level.status,
      awardedAt: null,
    })),
    currentLevelIndex: null,
    earnedCount: levels.filter(level => level.status !== "locked").length,
    totalLevels: levels.length,
    points: 0,
  }
}

describe("isBlackBeltRateEligible", () => {
  test("true for an awarded BJJ black belt (through buildBeltProgressions)", () => {
    const blackAward = makeAward({
      id: "a-black",
      rankId: "rank-black",
      rankName: "Black Belt",
      rankSortOrder: 5,
      awardedAt: new Date("2020-01-01"),
    })
    assert.equal(isBlackBeltRateEligible(buildBeltProgressions([blackAward])), true)
  })

  test("false when the highest awarded BJJ rank is brown", () => {
    assert.equal(
      isBlackBeltRateEligible([prog("bjj", [{ beltFamily: "COLORED", status: "current" }])]),
      false,
    )
  })

  test("false when a black belt exists but was never awarded (locked)", () => {
    assert.equal(
      isBlackBeltRateEligible([
        prog("bjj", [
          { beltFamily: "COLORED", status: "current" },
          { beltFamily: "BLACK", status: "locked" },
        ]),
      ]),
      false,
    )
  })

  test("true for BJJ coral and red belts (black-belt-and-above)", () => {
    assert.equal(
      isBlackBeltRateEligible([prog("bjj", [{ beltFamily: "CORAL", status: "current" }])]),
      true,
    )
    assert.equal(
      isBlackBeltRateEligible([prog("bjj", [{ beltFamily: "RED", status: "earned" }])]),
      true,
    )
  })

  test("false for a black belt in a non-BJJ discipline", () => {
    assert.equal(
      isBlackBeltRateEligible([prog("karate", [{ beltFamily: "BLACK", status: "current" }])]),
      false,
    )
  })

  test("false when the rank system has no discipline", () => {
    assert.equal(
      isBlackBeltRateEligible([prog(null, [{ beltFamily: "BLACK", status: "current" }])]),
      false,
    )
  })

  test("false for empty progressions", () => {
    assert.equal(isBlackBeltRateEligible([]), false)
  })

  test("multi-system: eligible if ANY BJJ system has an awarded black belt", () => {
    assert.equal(
      isBlackBeltRateEligible([
        prog("karate", [{ beltFamily: "BLACK", status: "current" }]),
        prog("bjj", [{ beltFamily: "BLACK", status: "current" }]),
      ]),
      true,
    )
  })

  // --- D-062 regression: eligibility keys off `beltFamily`, never the display name ---

  test("D-062: a RENAMED/localized black belt still prices correctly (name never gates)", () => {
    // Display name does NOT match the retired /\b(black|coral|red)\s+belt\b/ regex —
    // this returned false (mispriced to $65) before the re-key. Structured family = BLACK.
    assert.equal(
      isBlackBeltRateEligible([
        prog("bjj", [{ beltFamily: "BLACK", status: "current", name: "Faixa Preta" }]),
      ]),
      true,
    )
    assert.equal(
      isBlackBeltRateEligible([
        prog("bjj", [{ beltFamily: "RED", status: "earned", name: "Faixa Vermelha 10º grau" }]),
      ]),
      true,
    )
  })

  test("D-062: a COLORED rank merely NAMED 'Black Belt' is NOT eligible", () => {
    // Old name-regex would have matched this and granted the $45 rate (revenue leak /
    // wrong discount). The structured family (COLORED) is what decides.
    assert.equal(
      isBlackBeltRateEligible([
        prog("bjj", [{ beltFamily: "COLORED", status: "current", name: "Black Belt Prep" }]),
      ]),
      false,
    )
  })

  test("D-062: an unseeded rank (null beltFamily) named like a black belt is NOT eligible", () => {
    // Fails closed on the safe side — an unseeded rank never unlocks the discount rate.
    assert.equal(
      isBlackBeltRateEligible([
        prog("bjj", [{ beltFamily: null, status: "current", name: "Black Belt" }]),
      ]),
      false,
    )
  })
})
