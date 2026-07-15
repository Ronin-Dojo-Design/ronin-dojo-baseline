import type { RankEntryStatus } from "~/.generated/prisma/client"
import type { BeltFamily } from "~/components/common/belt-swatch"
import type { BeltRankViewModel } from "~/components/web/belt/belt-view-model"
import { ceilingSortOrder, type GateAward } from "~/server/belt/belt-gate"
import { type MemberAward, toBeltCard } from "~/server/belt/queries"

export type ProfileRankEntry = {
  rankId: string
  status: RankEntryStatus
  rankAward: MemberAward
}

export type ProfileLadderRank = {
  id: string
  name: string
  colorHex: string | null
  sortOrder: number
  /** @added SESSION_0539 — refined-belt render fields for the journey ladder swatch. */
  secondaryColorHex: string | null
  degree: number | null
  beltFamily: BeltFamily | null
}

/**
 * The RankEntry-rooted profile read projection. Legacy RankAward still supplies
 * compatibility facts and milestone media; RankEntry supplies membership/status
 * semantics and is the only input that can contribute an active belt card.
 *
 * The editability CEILING is computed from `awards` — the member's RankAwards
 * (`getMemberAwards(...).map(toGateAward)`, pre-ordered by `rank.sortOrder desc`)
 * — NOT from `entries`. The WRITE gate (`upsertBeltMilestone` / `deleteRankAward`
 * in `./router.ts`) reads its ceiling from RankAward via the same
 * `getMemberAwards` + `ceilingSortOrder` pair, and a RankAward lacking a synced
 * RankEntry made an entry-sourced ceiling collapse while the write gate still
 * allowed the edit — belts falsely rendered locked (FI-021). Pending promotions
 * live as claims (no RankAward until approval), so an award-sourced ceiling
 * still never rises on a PENDING promotion.
 */
export function projectProfileBeltEntries({
  ladder,
  entries,
  awards,
  disciplineId,
}: {
  ladder: ProfileLadderRank[]
  entries: ProfileRankEntry[]
  /** ALL member RankAwards as gate shapes, pre-ordered by `rank.sortOrder desc`. */
  awards: GateAward[]
  disciplineId: string
}): Pick<{ ranks: BeltRankViewModel[]; ceiling: number | null }, "ranks" | "ceiling"> {
  const ceiling = ceilingSortOrder(awards, disciplineId)
  const entryByRankId = new Map(entries.map(entry => [entry.rankId, entry]))

  return {
    ceiling,
    ranks: ladder.map(rank => {
      const entry = entryByRankId.get(rank.id)
      return {
        rank,
        card: entry ? toBeltCard(entry.rankAward, entry.status) : null,
      }
    }),
  }
}
