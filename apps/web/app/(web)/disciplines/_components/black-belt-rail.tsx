// @edited SESSION_0357 (2026-06-08) — TASK_01: read RankAward (canonical promotion
// fact, ADR 0016) via a server query/DTO instead of an inline `db.membership` scan.
// Membership is Baseline enrollment, so the old query rendered empty for BBL lineage
// members; RankAward is the source of truth (passport-and-shells.md).
import type { Brand } from "~/.generated/prisma/client"
import { Card } from "~/components/common/card"
import { EmptyList } from "~/components/common/empty-list"
import { H4 } from "~/components/common/heading"
import { getTopRankedMembersForDiscipline } from "~/server/web/disciplines/top-ranked-queries"
import { BlackBeltRailList } from "./black-belt-rail-list"

type BlackBeltRailProps = {
  disciplineId: string
  brand: Brand
}

/**
 * Sidebar honor strip showing the highest-ranked members in a discipline, read
 * from RankAward (the canonical promotion fact, ADR 0016) — NOT Membership. The
 * belt-color reveal lives in the client BlackBeltRailList (SESSION_0304).
 */
export async function BlackBeltRail({ disciplineId, brand }: BlackBeltRailProps) {
  const members = await getTopRankedMembersForDiscipline({ disciplineId, brand })

  return (
    <Card className="p-4">
      <H4 render={props => <h3 {...props}>{props.children}</h3>} className="mb-3 text-sm">
        Top Ranked
      </H4>
      {members.length === 0 ? (
        <EmptyList className="text-xs">No ranked members yet.</EmptyList>
      ) : (
        <BlackBeltRailList members={members} />
      )}
    </Card>
  )
}
