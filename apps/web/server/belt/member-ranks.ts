import type { Prisma, RankEntryProvenance, RankEntryStatus } from "~/.generated/prisma/client"
import { db } from "~/services/db"

/**
 * The ONE canonical rank-read seam (#376, map #374 / G-011).
 *
 * Every non-write rank read goes through here. Reads resolve from `RankEntry`
 * (the canonical member-rank aggregate, ADR 0035) — NOT from `RankAward`, which
 * stays the write anchor only until the table-drop (#380). Callers stop querying
 * rank models directly; they consume the projected {@link RankEntryView}.
 *
 * Two axes travel on every row and must never be conflated:
 * - `status`     — MUTABLE presentation trust (PENDING → UNVERIFIED → VERIFIED …).
 *                  IMPORTED awards collapse to VERIFIED here (`rankEntryStatusForAward`).
 * - `provenance` — IMMUTABLE origin (#375): IMPORTED legacy truth vs EARNED in-app.
 *                  This is what belt-gate reads for "authority-owned / read-only",
 *                  replacing the old `verificationStatus === "IMPORTED"` reads.
 *
 * ADR 0035 display law (unchanged): top rank = the highest AWARDED rank by
 * `rank.sortOrder`; NEVER scope by `rank.brand`.
 */

/** RankEntry selected in the shape every rank reader consumes. */
export const rankEntryViewSelect = {
  id: true,
  rankAwardId: true,
  passportId: true,
  rankId: true,
  status: true,
  provenance: true,
  rank: {
    select: {
      name: true,
      colorHex: true,
      sortOrder: true,
      rankSystem: { select: { disciplineId: true } },
    },
  },
} satisfies Prisma.RankEntrySelect

type RankEntryRow = Prisma.RankEntryGetPayload<{ select: typeof rankEntryViewSelect }>

/** The flat, render-ready rank view. No raw Prisma row reaches a consumer. */
export type RankEntryView = {
  rankEntryId: string
  /** The compatibility-anchor award id — the join key for fact-level reads (date/promoter/milestone). */
  rankAwardId: string
  passportId: string
  rankId: string
  rankName: string
  colorHex: string | null
  sortOrder: number
  /** Non-null: `Rank.rankSystem` and `RankSystem.disciplineId` are both required relations. */
  disciplineId: string
  status: RankEntryStatus
  provenance: RankEntryProvenance
}

/** Project one selected RankEntry row into the flat seam view. */
export function projectRankEntry(row: RankEntryRow): RankEntryView {
  return {
    rankEntryId: row.id,
    rankAwardId: row.rankAwardId,
    passportId: row.passportId,
    rankId: row.rankId,
    rankName: row.rank.name,
    colorHex: row.rank.colorHex,
    sortOrder: row.rank.sortOrder,
    disciplineId: row.rank.rankSystem.disciplineId,
    status: row.status,
    provenance: row.provenance,
  }
}

type MemberRanksDb = Pick<typeof db, "rankEntry">

/**
 * `orderBy` shared by every seam read: highest belt first. `rank.sortOrder desc`
 * yields the ceiling as the first row (the order `memberTopRank` and belt-gate's
 * `ceilingSortOrder` rely on). The tiebreak is the anchor award's `awardedAt` — the
 * SAME contract the retired `rankAwardsEarned` reads used (SESSION_0430), so a
 * NULL-dated lower belt can't float up and the seam matches the public projection +
 * rail exactly. RankEntry carries no date of its own, hence the relation hop.
 */
const rankEntryOrder: Prisma.RankEntryOrderByWithRelationInput[] = [
  { rank: { sortOrder: "desc" } },
  { rankAward: { awardedAt: "desc" } },
]

/**
 * All of a member's ranks, highest belt first. Every entry carries `status` and
 * immutable `provenance`. This is the canonical replacement for `getMemberAwards`
 * at every read (display, gate, directory, promotion history) — the write path
 * still reads awards.
 */
export async function memberRanks(
  passportId: string,
  dbClient: MemberRanksDb = db,
): Promise<RankEntryView[]> {
  const rows = await dbClient.rankEntry.findMany({
    where: { passportId },
    select: rankEntryViewSelect,
    orderBy: rankEntryOrder,
  })
  return rows.map(projectRankEntry)
}

/**
 * The member's ceiling rank — their highest AWARDED belt (ADR 0035). Scoped to
 * `disciplineId` when given (BBL = BJJ), else the global top across disciplines.
 * Status-agnostic: the ceiling is what they HOLD, so an unverified top belt still
 * counts (callers that only want verified filter on `status` themselves).
 * Returns `null` when the member holds no rank (in the discipline).
 */
export async function memberTopRank(
  passportId: string,
  disciplineId?: string | null,
  dbClient: MemberRanksDb = db,
): Promise<RankEntryView | null> {
  const ranks = await memberRanks(passportId, dbClient)
  if (disciplineId) {
    return ranks.find(entry => entry.disciplineId === disciplineId) ?? null
  }
  return ranks[0] ?? null
}
