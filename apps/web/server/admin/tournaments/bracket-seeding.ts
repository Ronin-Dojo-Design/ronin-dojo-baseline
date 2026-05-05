/**
 * Bracket seeding utilities.
 *
 * Four seeding strategies:
 *   1. REGISTRATION_ORDER — first registered = seed 1 (default, fair for casual)
 *   2. TOURNAMENT_RANKING — based on FightRecord W/L/D across the season
 *   3. MARTIAL_ARTS_RANK — based on belt/rank sortOrder
 *   4. MANUAL — admin-assigned seed numbers
 *
 * Standard bracket seeding order for N competitors:
 * - Seed 1 vs Seed N, Seed 2 vs Seed N-1, etc.
 * - BYEs are assigned to the highest seeds first.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SeedableEntry = {
  id: string
  registrationOrder: number
  /** FightRecord-derived score (wins - losses + draws*0.5). Null = no record. */
  tournamentRankingScore: number | null
  /** Martial arts rank sortOrder (lower = higher rank). Null = unranked. */
  martialArtsRankOrdinal: number | null
  /** Admin-assigned seed (1 = top seed). Null = not manually seeded. */
  manualSeed: number | null
}

export type SeedingMethod =
  | "REGISTRATION_ORDER"
  | "TOURNAMENT_RANKING"
  | "MARTIAL_ARTS_RANK"
  | "MANUAL"

// ---------------------------------------------------------------------------
// Sorting strategies
// ---------------------------------------------------------------------------

/** Registration order: first registered = best seed */
function sortByRegistrationOrder(entries: SeedableEntry[]): SeedableEntry[] {
  return [...entries].sort((a, b) => a.registrationOrder - b.registrationOrder)
}

/** Tournament ranking: higher FightRecord score = better seed */
function sortByTournamentRanking(entries: SeedableEntry[]): SeedableEntry[] {
  return [...entries].sort((a, b) => {
    if (a.tournamentRankingScore != null && b.tournamentRankingScore != null) {
      if (a.tournamentRankingScore !== b.tournamentRankingScore) {
        return b.tournamentRankingScore - a.tournamentRankingScore // descending
      }
      return a.registrationOrder - b.registrationOrder
    }
    if (a.tournamentRankingScore != null) return -1
    if (b.tournamentRankingScore != null) return 1
    return a.registrationOrder - b.registrationOrder
  })
}

/** Martial arts rank: lower sortOrder = higher rank = better seed */
function sortByMartialArtsRank(entries: SeedableEntry[]): SeedableEntry[] {
  return [...entries].sort((a, b) => {
    if (a.martialArtsRankOrdinal != null && b.martialArtsRankOrdinal != null) {
      if (a.martialArtsRankOrdinal !== b.martialArtsRankOrdinal) {
        return a.martialArtsRankOrdinal - b.martialArtsRankOrdinal
      }
      return a.registrationOrder - b.registrationOrder
    }
    if (a.martialArtsRankOrdinal != null) return -1
    if (b.martialArtsRankOrdinal != null) return 1
    return a.registrationOrder - b.registrationOrder
  })
}

/** Manual: admin-assigned seed number, unassigned go last by registration order */
function sortByManualSeed(entries: SeedableEntry[]): SeedableEntry[] {
  return [...entries].sort((a, b) => {
    if (a.manualSeed != null && b.manualSeed != null) {
      return a.manualSeed - b.manualSeed
    }
    if (a.manualSeed != null) return -1
    if (b.manualSeed != null) return 1
    return a.registrationOrder - b.registrationOrder
  })
}

/** Dispatch to the correct sort strategy */
export function sortByMethod(
  entries: SeedableEntry[],
  method: SeedingMethod,
): SeedableEntry[] {
  switch (method) {
    case "REGISTRATION_ORDER":
      return sortByRegistrationOrder(entries)
    case "TOURNAMENT_RANKING":
      return sortByTournamentRanking(entries)
    case "MARTIAL_ARTS_RANK":
      return sortByMartialArtsRank(entries)
    case "MANUAL":
      return sortByManualSeed(entries)
  }
}

// ---------------------------------------------------------------------------
// Bracket position math
// ---------------------------------------------------------------------------

/**
 * Generate standard bracket seeding positions.
 *
 * For a bracket of size N (power of 2), returns an array of seed numbers
 * in bracket position order. Seed 1 faces seed N, seed 2 faces seed N-1, etc.
 *
 * @param bracketSize - Must be a power of 2 (2, 4, 8, 16, 32...)
 * @returns Array of 1-indexed seed positions in bracket order
 */
export function standardBracketOrder(bracketSize: number): number[] {
  if (bracketSize < 2) return [1]
  if (bracketSize === 2) return [1, 2]

  const half = bracketSize / 2
  const top = standardBracketOrder(half)
  const bottom = top.map((seed) => bracketSize + 1 - seed)

  const result: number[] = []
  for (let i = 0; i < half; i++) {
    result.push(top[i]!, bottom[i]!)
  }
  return result
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Assign seed numbers to entries using the specified seeding method, then
 * map them into standard bracket positions.
 */
export function seedEntries(
  entries: SeedableEntry[],
  bracketSize: number,
  method: SeedingMethod = "REGISTRATION_ORDER",
): { entryId: string; seed: number; bracketSlotIndex: number }[] {
  const sorted = sortByMethod(entries, method)
  const order = standardBracketOrder(bracketSize)

  const seedToPosition = new Map<number, number>()
  for (let i = 0; i < order.length; i++) {
    seedToPosition.set(order[i]!, i)
  }

  return sorted.map((entry, i) => ({
    entryId: entry.id,
    seed: i + 1,
    bracketSlotIndex: seedToPosition.get(i + 1) ?? i,
  }))
}
