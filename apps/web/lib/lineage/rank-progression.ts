import type { LineageNodeProfile } from "~/server/web/lineage/payloads"

/**
 * Trophy.so-style rank-progression read model (SESSION_0332).
 *
 * Pure functions that derive a Points/Levels belt ladder + Achievements Unlocked
 * list from the lineage profile payload's existing `RankAward[]` data. No new
 * schema; no `GamificationEvent` writes. Points are derived by treating each
 * `RankAward` as worth `BELT_PROMOTION_POINTS`, mirroring the seeded
 * `GamificationEventType.BELT_PROMOTION.defaultPoints` value (see
 * `apps/web/prisma/seed-baseline-platform.ts:203`).
 *
 * Spec — petey-plan-0305 §Phase 4 Slice 2:
 *   "Points Levels List showing belt progression (White → Black) with current
 *    position highlighted; Achievement Unlocked animation when a RankAward is
 *    created; data: RankAward + Rank models provide the progression data;
 *    Rank.colorHex for visual theming."
 *
 * ADR 0016 — `RankAward` remains the canonical promotion fact; this module
 * only reads.
 */

export const BELT_PROMOTION_POINTS = 100

type RankAward = NonNullable<LineageNodeProfile["passport"]>["rankAwardsEarned"][number]

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

function awardDate(award: RankAward): Date | null {
  if (!award.awardedAt) return null
  const d = award.awardedAt instanceof Date ? award.awardedAt : new Date(award.awardedAt)
  return Number.isNaN(d.getTime()) ? null : d
}

function compareDatesDesc(a: Date | null, b: Date | null): number {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1
  return b.getTime() - a.getTime()
}

/**
 * Group awards by rank-system and project the system's full ranks list (from
 * the widened payload) into a Points/Levels ladder. The "current" level is the
 * highest-`sortOrder` rank the user has an award for within the system. Ranks
 * below it that were *never awarded* remain "locked" — we do not infer skipped
 * promotions.
 */
export function buildBeltProgressions(awards: readonly RankAward[]): BeltProgression[] {
  const bySystem = new Map<string, RankSystemAccumulator>()

  for (const award of awards) {
    const rank = award.rank
    if (!rank) continue
    const system = rank.rankSystem
    if (!system) continue

    let acc = bySystem.get(system.id)
    if (!acc) {
      acc = {
        rankSystem: {
          id: system.id,
          name: system.name,
          // Pick discipline fields explicitly rather than passing the object
          // through — keeps this a strict allowlist projection (defense-in-depth
          // beyond the payload allowlist; SESSION_0334 privacy test).
          discipline: system.discipline
            ? {
                id: system.discipline.id,
                name: system.discipline.name,
                slug: system.discipline.slug,
                code: system.discipline.code ?? null,
              }
            : null,
        },
        rankById: new Map(),
        earnedAwards: new Map(),
      }
      // Pre-populate the rank ladder from the system's full ranks list.
      for (const r of system.ranks ?? []) {
        // `r` from the payload has the widened shape (id, sortOrder, name, shortName, colorHex)
        // but TypeScript may infer the narrower legacy shape if Prisma typegen has not yet
        // regenerated; coerce to the expected shape here.
        const widened = r as {
          id: string
          sortOrder: number
          name?: string | null
          shortName?: string | null
          colorHex?: string | null
        }
        acc.rankById.set(widened.id, {
          id: widened.id,
          sortOrder: widened.sortOrder,
          name: widened.name ?? "",
          shortName: widened.shortName ?? null,
          colorHex: widened.colorHex ?? null,
        })
      }
      bySystem.set(system.id, acc)
    }

    // Ensure the awarded rank itself is in the ladder even if the rankSystem.ranks
    // list happened to omit it (defensive — should not happen for seeded data).
    if (!acc.rankById.has(rank.id)) {
      acc.rankById.set(rank.id, {
        id: rank.id,
        sortOrder: rank.sortOrder ?? 0,
        name: rank.name,
        shortName: rank.shortName ?? null,
        colorHex: rank.colorHex ?? null,
      })
    }

    // Earned: keep the most recent awarded date per rank.
    const date = awardDate(award)
    const prior = acc.earnedAwards.get(rank.id)
    if (!prior || compareDatesDesc(date, prior.awardedAt) < 0) {
      acc.earnedAwards.set(rank.id, { awardedAt: date, sortOrder: rank.sortOrder ?? 0 })
    }
  }

  const progressions: BeltProgression[] = []

  for (const acc of bySystem.values()) {
    const sortedRanks = Array.from(acc.rankById.values()).sort((a, b) => a.sortOrder - b.sortOrder)

    // Highest earned sortOrder defines the "current" rank.
    let currentSortOrder: number | null = null
    for (const earned of acc.earnedAwards.values()) {
      if (currentSortOrder === null || earned.sortOrder > currentSortOrder) {
        currentSortOrder = earned.sortOrder
      }
    }

    let currentLevelIndex: number | null = null
    const levels: ProgressionLevel[] = sortedRanks.map((rank, index) => {
      const earned = acc.earnedAwards.get(rank.id)
      let status: ProgressionLevel["status"]
      if (earned) {
        status =
          currentSortOrder !== null && rank.sortOrder === currentSortOrder ? "current" : "earned"
        if (status === "current") currentLevelIndex = index
      } else {
        status = "locked"
      }
      return {
        rank,
        status,
        awardedAt: earned?.awardedAt ?? null,
      }
    })

    const earnedCount = acc.earnedAwards.size
    progressions.push({
      rankSystem: acc.rankSystem,
      levels,
      currentLevelIndex,
      earnedCount,
      totalLevels: sortedRanks.length,
      points: earnedCount * BELT_PROMOTION_POINTS,
    })
  }

  progressions.sort((a, b) => {
    const aDiscipline = a.rankSystem.discipline?.name ?? ""
    const bDiscipline = b.rankSystem.discipline?.name ?? ""
    const disciplineDelta = aDiscipline.localeCompare(bDiscipline)
    if (disciplineDelta !== 0) return disciplineDelta
    return a.rankSystem.name.localeCompare(b.rankSystem.name)
  })

  return progressions
}

/**
 * Flatten `RankAward[]` into per-award "Achievement Unlocked" records ordered
 * newest first. Null `awardedAt` entries sink to the bottom so the rail's lead
 * is always the most recent ceremony.
 */
export function buildAchievementsUnlocked(awards: readonly RankAward[]): AchievementUnlock[] {
  const unlocks: AchievementUnlock[] = []

  for (const award of awards) {
    const rank = award.rank
    if (!rank) continue

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
      awardedAt: awardDate(award),
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
