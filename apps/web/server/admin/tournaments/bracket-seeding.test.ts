/**
 * SESSION_0078 TASK_03 — Bracket seeding unit tests.
 *
 * Pure functions, no DB needed.
 *
 * Run: cd apps/web && bun test server/admin/tournaments/bracket-seeding.test.ts
 */

// @ts-expect-error — bun:test runtime module
import { describe, expect, it } from "bun:test"
import {
  standardBracketOrder,
  seedEntries,
  sortByMethod,
  type SeedableEntry,
} from "./bracket-seeding"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function entry(
  id: string,
  regOrder: number,
  overrides: Partial<SeedableEntry> = {},
): SeedableEntry {
  return {
    id,
    registrationOrder: regOrder,
    tournamentRankingScore: null,
    martialArtsRankOrdinal: null,
    manualSeed: null,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// standardBracketOrder
// ---------------------------------------------------------------------------

describe("standardBracketOrder", () => {
  it("returns [1,2] for bracket size 2", () => {
    expect(standardBracketOrder(2)).toEqual([1, 2])
  })

  it("returns [1,4,2,3] for bracket size 4", () => {
    // Seed 1 vs 4, seed 2 vs 3
    expect(standardBracketOrder(4)).toEqual([1, 4, 2, 3])
  })

  it("returns correct 8-bracket order", () => {
    const order = standardBracketOrder(8)
    // Standard: 1v8, 4v5, 2v7, 3v6
    expect(order).toEqual([1, 8, 4, 5, 2, 7, 3, 6])
  })

  it("returns correct 16-bracket order", () => {
    const order = standardBracketOrder(16)
    expect(order.length).toBe(16)
    // Seed 1 should be at position 0, seed 16 at position 1
    expect(order[0]).toBe(1)
    expect(order[1]).toBe(16)
  })
})

// ---------------------------------------------------------------------------
// sortByMethod — REGISTRATION_ORDER
// ---------------------------------------------------------------------------

describe("sortByMethod REGISTRATION_ORDER", () => {
  it("sorts by registration order", () => {
    const entries = [entry("c", 2), entry("a", 0), entry("b", 1)]
    const sorted = sortByMethod(entries, "REGISTRATION_ORDER")
    expect(sorted.map((e) => e.id)).toEqual(["a", "b", "c"])
  })
})

// ---------------------------------------------------------------------------
// sortByMethod — TOURNAMENT_RANKING
// ---------------------------------------------------------------------------

describe("sortByMethod TOURNAMENT_RANKING", () => {
  it("sorts by score descending (higher = better seed)", () => {
    const entries = [
      entry("low", 0, { tournamentRankingScore: 2 }),
      entry("high", 1, { tournamentRankingScore: 10 }),
      entry("mid", 2, { tournamentRankingScore: 5 }),
    ]
    const sorted = sortByMethod(entries, "TOURNAMENT_RANKING")
    expect(sorted.map((e) => e.id)).toEqual(["high", "mid", "low"])
  })

  it("puts unscored entries last, sorted by registration order", () => {
    const entries = [
      entry("unscored1", 1),
      entry("scored", 0, { tournamentRankingScore: 3 }),
      entry("unscored0", 2),
    ]
    const sorted = sortByMethod(entries, "TOURNAMENT_RANKING")
    expect(sorted.map((e) => e.id)).toEqual(["scored", "unscored1", "unscored0"])
  })

  it("breaks ties by registration order", () => {
    const entries = [
      entry("b", 1, { tournamentRankingScore: 5 }),
      entry("a", 0, { tournamentRankingScore: 5 }),
    ]
    const sorted = sortByMethod(entries, "TOURNAMENT_RANKING")
    expect(sorted.map((e) => e.id)).toEqual(["a", "b"])
  })
})

// ---------------------------------------------------------------------------
// sortByMethod — MARTIAL_ARTS_RANK
// ---------------------------------------------------------------------------

describe("sortByMethod MARTIAL_ARTS_RANK", () => {
  it("sorts by rank ordinal ascending (lower = higher rank)", () => {
    const entries = [
      entry("white", 0, { martialArtsRankOrdinal: 10 }),
      entry("black", 1, { martialArtsRankOrdinal: 1 }),
      entry("blue", 2, { martialArtsRankOrdinal: 5 }),
    ]
    const sorted = sortByMethod(entries, "MARTIAL_ARTS_RANK")
    expect(sorted.map((e) => e.id)).toEqual(["black", "blue", "white"])
  })

  it("puts unranked entries last", () => {
    const entries = [
      entry("unranked", 0),
      entry("ranked", 1, { martialArtsRankOrdinal: 3 }),
    ]
    const sorted = sortByMethod(entries, "MARTIAL_ARTS_RANK")
    expect(sorted.map((e) => e.id)).toEqual(["ranked", "unranked"])
  })
})

// ---------------------------------------------------------------------------
// sortByMethod — MANUAL
// ---------------------------------------------------------------------------

describe("sortByMethod MANUAL", () => {
  it("sorts by manual seed ascending", () => {
    const entries = [
      entry("seed3", 0, { manualSeed: 3 }),
      entry("seed1", 1, { manualSeed: 1 }),
      entry("seed2", 2, { manualSeed: 2 }),
    ]
    const sorted = sortByMethod(entries, "MANUAL")
    expect(sorted.map((e) => e.id)).toEqual(["seed1", "seed2", "seed3"])
  })

  it("puts non-manually-seeded entries last by registration order", () => {
    const entries = [
      entry("auto2", 2),
      entry("manual", 0, { manualSeed: 1 }),
      entry("auto1", 1),
    ]
    const sorted = sortByMethod(entries, "MANUAL")
    expect(sorted.map((e) => e.id)).toEqual(["manual", "auto1", "auto2"])
  })
})

// ---------------------------------------------------------------------------
// seedEntries — end-to-end placement
// ---------------------------------------------------------------------------

describe("seedEntries", () => {
  it("places 2 competitors correctly", () => {
    const entries = [entry("a", 0), entry("b", 1)]
    const result = seedEntries(entries, 2, "REGISTRATION_ORDER")
    expect(result).toEqual([
      { entryId: "a", seed: 1, bracketSlotIndex: 0 },
      { entryId: "b", seed: 2, bracketSlotIndex: 1 },
    ])
  })

  it("places 4 competitors in standard bracket order", () => {
    const entries = [entry("a", 0), entry("b", 1), entry("c", 2), entry("d", 3)]
    const result = seedEntries(entries, 4, "REGISTRATION_ORDER")
    // Standard order for 4: [1,4,2,3]
    // Seed 1 (a) → position 0, Seed 2 (b) → position 2, Seed 3 (c) → position 3, Seed 4 (d) → position 1
    expect(result.find((r) => r.entryId === "a")?.bracketSlotIndex).toBe(0)
    expect(result.find((r) => r.entryId === "d")?.bracketSlotIndex).toBe(1)
    expect(result.find((r) => r.entryId === "b")?.bracketSlotIndex).toBe(2)
    expect(result.find((r) => r.entryId === "c")?.bracketSlotIndex).toBe(3)
  })

  it("with 3 competitors in bracket of 4, seed 1 gets the BYE slot partner", () => {
    const entries = [entry("a", 0), entry("b", 1), entry("c", 2)]
    const result = seedEntries(entries, 4, "REGISTRATION_ORDER")
    // 3 entries, bracket size 4 → seed 4 is empty (BYE)
    // Seed 1 (a) at slot 0, paired with slot 1 (seed 4 = empty) = BYE for seed 1
    expect(result.length).toBe(3)
    expect(result.find((r) => r.entryId === "a")?.seed).toBe(1)
  })

  it("uses tournament ranking to determine seeds", () => {
    const entries = [
      entry("newcomer", 0, { tournamentRankingScore: 1 }),
      entry("champion", 1, { tournamentRankingScore: 15 }),
    ]
    const result = seedEntries(entries, 2, "TOURNAMENT_RANKING")
    // Champion should be seed 1
    expect(result.find((r) => r.entryId === "champion")?.seed).toBe(1)
    expect(result.find((r) => r.entryId === "newcomer")?.seed).toBe(2)
  })

  it("uses manual seeds when specified", () => {
    const entries = [
      entry("b", 0, { manualSeed: 2 }),
      entry("a", 1, { manualSeed: 1 }),
    ]
    const result = seedEntries(entries, 2, "MANUAL")
    expect(result.find((r) => r.entryId === "a")?.seed).toBe(1)
    expect(result.find((r) => r.entryId === "b")?.seed).toBe(2)
  })
})
