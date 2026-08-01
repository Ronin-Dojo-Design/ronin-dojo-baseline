/**
 * @added   SESSION_0729 (2026-07-30)
 * @why     Provide the compact RankEntry-first member-rank read contract for the additive cutover
 * @wired   server/belt/member-ranks.test.ts; first runtime adoption is SESSION_0732 #377 read guard
 */
import type { Prisma } from "~/.generated/prisma/client"
import { rankEntryDisplayOrder } from "~/server/belt/rank-entry-display-order"
import type {
  RankEntryTrustAxes,
  TransitionalRankAwardAnchor,
} from "~/server/belt/rank-entry-trust-axes"
import { db } from "~/services/db"

/**
 * The canonical compact rank-read seam (#376, map #374 / G-011).
 *
 * Compact member-rank reads resolve from `RankEntry` (the canonical member-rank
 * aggregate, ADR 0058) — NOT from `RankAward`, which stays the write anchor only
 * until the table-drop (#380). Rich nested payloads select their own fields but
 * reuse `rankEntryDisplayOrder`, keeping the display law in one place.
 *
 * Two axes travel on every row and must never be conflated:
 * - `status`     — MUTABLE presentation trust (PENDING → UNVERIFIED → VERIFIED …).
 *                  IMPORTED awards collapse to VERIFIED here (`rankEntryStatusForAward`).
 * - `provenance` — IMMUTABLE origin (#375): IMPORTED (the one-time WP Gravity-Form
 *                  self-report migration) vs EARNED in-app. Pure historical metadata
 *                  since SESSION_0730 — it locks nothing (the member owns their
 *                  imported self-report; ADR 0036's claim flow is the identity gate)
 *                  and is never rendered publicly. Final disposition rides #380.
 *
 * ADR 0035 display law (unchanged): top rank = the highest AWARDED rank by
 * `rank.sortOrder`; NEVER scope by `rank.brand`.
 */

/** RankEntry selected for this seam's compact view. */
const rankEntryViewSelect = {
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
export type TransitionalRankAwardAnchoredMemberRank = TransitionalRankAwardAnchor &
  RankEntryTrustAxes & {
    rankEntryId: string
    passportId: string
    rankId: string
    rankName: string
    colorHex: string | null
    sortOrder: number
    /** Non-null: `Rank.rankSystem` and `RankSystem.disciplineId` are both required relations. */
    disciplineId: string
  }

export type RankEntryView = TransitionalRankAwardAnchoredMemberRank

/** Project one selected RankEntry row into the flat seam view. */
function projectRankEntry(row: RankEntryRow): RankEntryView {
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
    orderBy: rankEntryDisplayOrder,
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
