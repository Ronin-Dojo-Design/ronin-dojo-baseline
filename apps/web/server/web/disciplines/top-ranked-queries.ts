// @added   SESSION_0357 (2026-06-08) — TASK_01 black-belt-rail repoint.
// @why     The discipline "Top Ranked" rail read `Membership.rank`, so BBL lineage
//          members (who hold RankAwards but no Membership) rendered as an empty
//          "No ranked members yet" while the lineage tree below was full of black
//          belts. RankAward is the canonical promotion fact (ADR 0016); read it.
//          Membership is Baseline enrollment, not the rank source (passport-and-shells.md).
// @wired   apps/web/app/(web)/disciplines/_components/black-belt-rail.tsx
import type { Brand, Prisma } from "~/.generated/prisma/client"
import { db } from "~/services/db"

// DTO — the strict shape the rail consumes; no raw Prisma rows reach the component.
const topRankedAwardSelect = {
  passportId: true,
  rank: { select: { name: true, colorHex: true, sortOrder: true } },
  // Phase 3c (SOT-ADR D1): the earner is Passport-rooted; identity is on the Passport, with the
  // attached account image as a fallback.
  passport: {
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      user: { select: { id: true, name: true, image: true } },
    },
  },
} satisfies Prisma.RankAwardSelect

export type TopRankedMember = {
  id: string
  name: string
  image: string | null
  rankName: string
  colorHex: string | null
}

/**
 * Highest-ranked members of a discipline for the "Top Ranked" rail, read from
 * RankAward (the canonical promotion fact, ADR 0016).
 *
 * Brand scope = "this person belongs to this brand" via **lineage tree OR org
 * membership** — capturing BOTH BBL lineage people (no Membership) and Baseline
 * members. A Membership-only boundary (what the directory uses) renders empty
 * for BBL, which is the bug this replaces.
 *
 * Deduped to each person's single highest award. No hardcoded belt threshold —
 * ordered by `rank.sortOrder` desc and capped at `take`.
 */
export async function getTopRankedMembersForDiscipline({
  disciplineId,
  brand,
  take = 10,
}: {
  disciplineId: string
  brand: Brand
  take?: number
}): Promise<TopRankedMember[]> {
  const awards = await db.rankAward.findMany({
    where: {
      rank: { rankSystem: { disciplineId } },
      passport: {
        OR: [
          { lineageNode: { treeMembers: { some: { tree: { brand } } } } },
          { user: { memberships: { some: { organization: { brand } } } } },
        ],
      },
    },
    select: topRankedAwardSelect,
    orderBy: [{ rank: { sortOrder: "desc" } }, { awardedAt: "desc" }],
  })

  // First award per user wins (already ordered highest-rank-first) → one row per person.
  const seen = new Set<string>()
  const members: TopRankedMember[] = []
  for (const award of awards) {
    if (seen.has(award.passportId)) continue
    seen.add(award.passportId)
    members.push({
      id: award.passportId,
      name: award.passport.displayName ?? award.passport.user?.name ?? "Unnamed",
      image: award.passport.avatarUrl ?? award.passport.user?.image ?? null,
      rankName: award.rank.name,
      colorHex: award.rank.colorHex,
    })
    if (members.length >= take) break
  }

  return members
}
