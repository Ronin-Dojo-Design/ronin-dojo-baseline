// @added   PWCC-002 slice 2 (m-card kind=rank) — belt-by-belt group projection.
// @why     The rank/curriculum card page needs ranks-with-counts (+ optional curriculum) for a
//          discipline. Mirrors getTopRankedMembersForDiscipline's brand scope (lineage tree OR
//          org membership) so BBL lineage members (RankEntry, no Membership) are counted — the
//          same bug class fixed in SESSION_0357. RankEntry is the ONE canonical rank model
//          (ADR 0058 / #376); belt tint is data-driven Rank.colorHex (ADR 0026).
// @wired   apps/web/app/(web)/disciplines/[slug]/ranks/page.tsx → m-card(kind=rank)
import { cacheLife, cacheTag } from "next/cache"
import type { Brand } from "~/.generated/prisma/client"
import type { RankGroupProjection } from "~/lib/m-card/map-rank"
import { db } from "~/services/db"

/**
 * Belt groups for a discipline: each `Rank` in the discipline's rank systems, with the count of
 * members holding it (brand-scoped) and the published curriculum techniques introduced at that
 * belt (`beltLevelMin = rank`). Already-public projection — the page maps each row straight onto
 * `MCardData["rank"]` via `mapRankGroupToCard`; no member identity leaves this query (count is an
 * aggregate; technique labels are public).
 *
 * Ordered by `Rank.sortOrder` asc (white → black). Includes ranks with zero members so the belt
 * ladder renders complete; the page can choose to filter.
 */
export async function getRankGroupsForDiscipline({
  disciplineId,
  disciplineCode,
  brand,
}: {
  disciplineId: string
  disciplineCode: string | null
  brand: Brand
}): Promise<RankGroupProjection[]> {
  "use cache"

  cacheTag(`rank-groups-${disciplineId}`)
  cacheLife("minutes")

  const ranks = await db.rank.findMany({
    where: { rankSystem: { disciplineId } },
    select: {
      id: true,
      name: true,
      colorHex: true,
      sortOrder: true,
      _count: {
        select: {
          // @changed SESSION_0729 (#376) — belt-holder counts read `RankEntry` (the ONE canonical
          // rank model) instead of the retired `RankAward` read-model; brand scope unchanged.
          rankEntries: {
            where: {
              passport: {
                OR: [
                  { lineageNode: { treeMembers: { some: { tree: { brand } } } } },
                  { user: { memberships: { some: { organization: { brand } } } } },
                ],
              },
            },
          },
        },
      },
      // Curriculum techniques introduced AT this belt (published only).
      techniqueBeltMin: {
        where: { isPublished: true },
        select: { id: true, name: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        take: 8,
      },
    },
    orderBy: { sortOrder: "asc" },
  })

  return ranks.map(rank => ({
    id: rank.id,
    name: rank.name,
    colorHex: rank.colorHex,
    disciplineCode,
    count: rank._count.rankEntries,
    items:
      rank.techniqueBeltMin.length > 0
        ? rank.techniqueBeltMin.map(tech => ({ id: tech.id, label: tech.name }))
        : undefined,
  }))
}
