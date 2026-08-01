import type { LineageNodeProfile } from "~/server/web/lineage/payloads"

/**
 * Trophy.so-style rank-progression read model (SESSION_0332).
 *
 * Pure functions that derive a Points/Levels belt ladder + Achievements Unlocked
 * list from the lineage profile payload's existing `RankEntry[]` data. No new
 * schema; no `GamificationEvent` writes. Points are derived by treating each
 * awarded entry as worth `BELT_PROMOTION_POINTS`, mirroring the seeded
 * `GamificationEventType.BELT_PROMOTION.defaultPoints` value (see
 * `apps/web/prisma/seed-baseline-platform.ts:203`).
 *
 * Spec — petey-plan-0305 §Phase 4 Slice 2:
 *   "Points Levels List showing belt progression (White → Black) with current
 *    position highlighted; Achievement Unlocked animation when a RankAward is
 *    created; data: RankAward + Rank models provide the progression data;
 *    Rank.colorHex for visual theming."
 *
 * ADR 0058 — `RankEntry` is the canonical rank read; ceremony facts remain on
 * its required RankAward anchor until #380.
 */

export const BELT_PROMOTION_POINTS = 100

// @changed SESSION_0729 (#376) — the progression/achievements read model now reads `RankEntry`
// rows (the ONE canonical rank model); each row's ceremony facts (awardedAt, awarder, organization)
// are reached through the required `rankAward` relation, so the timeline is behaviour-identical.
type RankEntry = NonNullable<LineageNodeProfile["passport"]>["rankEntries"][number]

export type ProgressionLevel = {
  rank: {
    id: string
    name: string
    shortName: string | null
    colorHex: string | null
    sortOrder: number
  }
  status: "earned" | "current" | "locked"
  awardedAt: Date | null
}

export type BeltProgression = {
  rankSystem: {
    id: string
    name: string
    discipline: { id: string; name: string; slug: string; code: string | null } | null
  }
  levels: ProgressionLevel[]
  currentLevelIndex: number | null
  earnedCount: number
  totalLevels: number
  points: number
}

export type AchievementUnlock = {
  id: string
  rank: {
    id: string
    name: string
    shortName: string | null
    colorHex: string | null
    sortOrder: number | null
  }
  rankSystemName: string | null
  disciplineName: string | null
  awardedAt: Date | null
  awarderName: string | null
  organizationName: string | null
  points: number
}

type RankSystemAccumulator = {
  rankSystem: BeltProgression["rankSystem"]
  /** All ranks the system defines, indexed by id. */
  rankById: Map<string, ProgressionLevel["rank"]>
  /** Earned ranks keyed by rankId, with the latest awarded date kept. */
  earnedAwards: Map<string, { awardedAt: Date | null; sortOrder: number }>
}

type EntryRank = NonNullable<RankEntry["rank"]>
type EntryRankSystem = NonNullable<EntryRank["rankSystem"]>
type WidenedSystemRank = {
  id: string
  sortOrder: number
  name?: string | null
  shortName?: string | null
  colorHex?: string | null
}

function awardDate(entry: RankEntry): Date | null {
  const awardedAt = entry.rankAward.awardedAt
  if (!awardedAt) return null
  const d = awardedAt instanceof Date ? awardedAt : new Date(awardedAt)
  return Number.isNaN(d.getTime()) ? null : d
}

function compareDatesDesc(a: Date | null, b: Date | null): number {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1
  return b.getTime() - a.getTime()
}

function progressionRankFromSystemRank(rank: WidenedSystemRank): ProgressionLevel["rank"] {
  return {
    id: rank.id,
    sortOrder: rank.sortOrder,
    name: rank.name ?? "",
    shortName: rank.shortName ?? null,
    colorHex: rank.colorHex ?? null,
  }
}

function createRankSystemAccumulator(system: EntryRankSystem): RankSystemAccumulator {
  const rankById = new Map<string, ProgressionLevel["rank"]>()
  for (const rank of system.ranks ?? []) {
    rankById.set(rank.id, progressionRankFromSystemRank(rank as WidenedSystemRank))
  }

  return {
    rankSystem: {
      id: system.id,
      name: system.name,
      // Strict allowlist projection beyond the payload allowlist (SESSION_0334 privacy test).
      discipline: system.discipline
        ? {
            id: system.discipline.id,
            name: system.discipline.name,
            slug: system.discipline.slug,
            code: system.discipline.code ?? null,
          }
        : null,
    },
    rankById,
    earnedAwards: new Map(),
  }
}

function recordEarnedRank(
  accumulator: RankSystemAccumulator,
  entry: RankEntry,
  rank: EntryRank,
): void {
  if (!accumulator.rankById.has(rank.id)) {
    accumulator.rankById.set(rank.id, {
      id: rank.id,
      sortOrder: rank.sortOrder ?? 0,
      name: rank.name,
      shortName: rank.shortName ?? null,
      colorHex: rank.colorHex ?? null,
    })
  }

  const date = awardDate(entry)
  const prior = accumulator.earnedAwards.get(rank.id)
  if (!prior || compareDatesDesc(date, prior.awardedAt) < 0) {
    accumulator.earnedAwards.set(rank.id, {
      awardedAt: date,
      sortOrder: rank.sortOrder ?? 0,
    })
  }
}

function collectRankSystems(entries: readonly RankEntry[]): Map<string, RankSystemAccumulator> {
  const bySystem = new Map<string, RankSystemAccumulator>()
  for (const entry of entries) {
    const rank = entry.rank
    const system = rank?.rankSystem
    if (!rank || !system) continue

    const accumulator = bySystem.get(system.id) ?? createRankSystemAccumulator(system)
    if (!bySystem.has(system.id)) bySystem.set(system.id, accumulator)
    recordEarnedRank(accumulator, entry, rank)
  }
  return bySystem
}

function highestEarnedSortOrder(accumulator: RankSystemAccumulator): number | null {
  let highest: number | null = null
  for (const earned of accumulator.earnedAwards.values()) {
    if (highest === null || earned.sortOrder > highest) highest = earned.sortOrder
  }
  return highest
}

function progressionFromAccumulator(accumulator: RankSystemAccumulator): BeltProgression {
  const sortedRanks = Array.from(accumulator.rankById.values()).sort(
    (a, b) => a.sortOrder - b.sortOrder,
  )
  const currentSortOrder = highestEarnedSortOrder(accumulator)
  let currentLevelIndex: number | null = null
  const levels = sortedRanks.map((rank, index): ProgressionLevel => {
    const earned = accumulator.earnedAwards.get(rank.id)
    if (!earned) return { rank, status: "locked", awardedAt: null }

    const status = rank.sortOrder === currentSortOrder ? "current" : "earned"
    if (status === "current") currentLevelIndex = index
    return { rank, status, awardedAt: earned.awardedAt }
  })
  const earnedCount = accumulator.earnedAwards.size

  return {
    rankSystem: accumulator.rankSystem,
    levels,
    currentLevelIndex,
    earnedCount,
    totalLevels: sortedRanks.length,
    points: earnedCount * BELT_PROMOTION_POINTS,
  }
}

function compareProgressions(a: BeltProgression, b: BeltProgression): number {
  const disciplineDelta = (a.rankSystem.discipline?.name ?? "").localeCompare(
    b.rankSystem.discipline?.name ?? "",
  )
  if (disciplineDelta !== 0) return disciplineDelta
  return a.rankSystem.name.localeCompare(b.rankSystem.name)
}

/**
 * Group awards by rank-system and project the system's full ranks list (from
 * the widened payload) into a Points/Levels ladder. The "current" level is the
 * highest-`sortOrder` rank the user has an award for within the system. Ranks
 * below it that were *never awarded* remain "locked" — we do not infer skipped
 * promotions.
 */
export function buildBeltProgressions(entries: readonly RankEntry[]): BeltProgression[] {
  return Array.from(collectRankSystems(entries).values())
    .map(progressionFromAccumulator)
    .sort(compareProgressions)
}

/**
 * Flatten `RankEntry[]` into per-award "Achievement Unlocked" records ordered
 * newest first. Null `awardedAt` entries sink to the bottom so the rail's lead
 * is always the most recent ceremony.
 */
export function buildAchievementsUnlocked(entries: readonly RankEntry[]): AchievementUnlock[] {
  const unlocks: AchievementUnlock[] = []

  for (const entry of entries) {
    const rank = entry.rank
    if (!rank) continue
    // Ceremony facts (award id, awarder, organization) via the entry's required `rankAward` relation.
    const award = entry.rankAward

    unlocks.push({
      id: award.id,
      rank: {
        id: rank.id,
        name: rank.name,
        shortName: rank.shortName ?? null,
        colorHex: rank.colorHex ?? null,
        sortOrder: rank.sortOrder ?? null,
      },
      rankSystemName: rank.rankSystem?.name ?? null,
      disciplineName: rank.rankSystem?.discipline?.name ?? null,
      awardedAt: awardDate(entry),
      awarderName: award.awardedBy?.name ?? null,
      organizationName: award.organization?.name ?? null,
      points: BELT_PROMOTION_POINTS,
    })
  }

  unlocks.sort((a, b) => compareDatesDesc(a.awardedAt, b.awardedAt))
  return unlocks
}

export function totalProgressionPoints(progressions: readonly BeltProgression[]): number {
  let total = 0
  for (const p of progressions) total += p.points
  return total
}

/**
 * BBL "Black Belt rate" eligibility (SESSION_0473 TASK_03 / SOT-ADR D472-1, D472-3).
 *
 * Belt rank is a **price** axis, not a feature axis: a verified BJJ black belt is
 * offered the $45/yr Elite price; everyone else sees the $65/yr Elite price. This
 * predicate is the eligibility check that gates the PRICE — it never gates features
 * and never auto-bills (promotion flips eligibility; the member opts in).
 *
 * "Verified" = awarded truth: this reads `BeltProgression`s built by
 * `buildBeltProgressions` from the passport's `rankEntries` (the canonical rank
 * model, #376), so a self-declared / pending rank never qualifies. Scoped to BJJ
 * (the lineage discipline); the degree tiers Black Belt → Coral Belt → Red Belt all
 * count as black-belt-or-above.
 */
const BLACK_BELT_RATE_DISCIPLINE_KEYS = new Set(["bjj"])

function isBlackBeltOrAbove(rank: { name: string }): boolean {
  // BJJ black-belt-and-above rank names: "Black Belt[ - Nth Degree]",
  // "Coral Belt (...)", "Red Belt - Nth Degree". White/Blue/Purple/Brown never match.
  return /\b(black|coral|red)\s+belt\b/i.test(rank.name)
}

export function isBlackBeltRateEligible(progressions: readonly BeltProgression[]): boolean {
  return progressions.some(progression => {
    const disciplineKey =
      progression.rankSystem.discipline?.slug ?? progression.rankSystem.discipline?.code ?? null
    if (!disciplineKey || !BLACK_BELT_RATE_DISCIPLINE_KEYS.has(disciplineKey.toLowerCase())) {
      return false
    }
    return progression.levels.some(
      level =>
        (level.status === "earned" || level.status === "current") && isBlackBeltOrAbove(level.rank),
    )
  })
}
