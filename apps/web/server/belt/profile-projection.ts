import type { RankEntryStatus } from "~/.generated/prisma/client"
import type { BeltRankViewModel } from "~/components/web/belt/belt-view-model"
import { ceilingSortOrder } from "~/server/belt/belt-gate"
import { type MemberAward, toBeltCard, toGateAward } from "~/server/belt/queries"

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
}

/**
 * The RankEntry-rooted profile read projection. Legacy RankAward still supplies
 * compatibility facts and milestone media; RankEntry supplies membership/status
 * semantics and is the only input that can contribute an active belt card.
 */
export function projectProfileBeltEntries({
  ladder,
  entries,
  disciplineId,
}: {
  ladder: ProfileLadderRank[]
  entries: ProfileRankEntry[]
  disciplineId: string
}): Pick<{ ranks: BeltRankViewModel[]; ceiling: number | null }, "ranks" | "ceiling"> {
  const ceiling = ceilingSortOrder(
    entries.map(entry => toGateAward(entry.rankAward)),
    disciplineId,
  )
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
