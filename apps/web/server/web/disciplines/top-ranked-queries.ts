// @added   SESSION_0357 (2026-06-08) — TASK_01 black-belt-rail repoint.
// @why     The discipline "Top Ranked" rail read `Membership.rank`, so BBL lineage
//          members (who hold RankEntries but no Membership) rendered as an empty
//          "No ranked members yet" while the lineage tree below was full of black
//          belts. RankEntry is canonical rank truth (ADR 0058); read it.
//          Membership is Baseline enrollment, not the rank source (passport-and-shells.md).
// @wired   apps/web/app/(web)/disciplines/_components/black-belt-rail.tsx
import type { Brand, Prisma } from "~/.generated/prisma/client"
import { rankEntryDisplayOrder } from "~/server/belt/rank-entry-display-order"
import { publicPassportPayload } from "~/server/web/passport/public-payloads"
import { projectPublicPassport } from "~/server/web/passport/public-projection"
import { db } from "~/services/db"

// DTO — the strict shape the rail consumes; no raw Prisma rows reach the component.
const topRankedEntrySelect = {
  passportId: true,
  rank: { select: { name: true, colorHex: true, sortOrder: true } },
  // Phase 3c / issue #134: use the canonical public passport payload so identity
  // derivation (displayName fallback, avatarUrl resolution) is centralised in
  // projectPublicPassport rather than repeated per-surface.
  passport: { select: publicPassportPayload },
} satisfies Prisma.RankEntrySelect

export type TopRankedMember = {
  id: string
  name: string
  image: string | null
  rankName: string
  colorHex: string | null
}

/**
 * Highest-ranked members of a discipline for the "Top Ranked" rail, read from
 * RankEntry (the ONE canonical rank model, ADR 0058 / #376) — the retired
 * RankAward read caused the SESSION_0725 dark-rail defect this replaces.
 *
 * Brand scope = "this person belongs to this brand" via **lineage tree OR org
 * membership** — capturing BOTH BBL lineage people (no Membership) and Baseline
 * members. A Membership-only boundary (what the directory uses) renders empty
 * for BBL, which is the bug this replaces.
 *
 * Deduped to each person's single highest rank entry. No hardcoded belt threshold —
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
  const entries = await db.rankEntry.findMany({
    where: {
      rank: { rankSystem: { disciplineId } },
      passport: {
        OR: [
          { lineageNode: { treeMembers: { some: { tree: { brand } } } } },
          { user: { memberships: { some: { organization: { brand } } } } },
        ],
      },
    },
    select: topRankedEntrySelect,
    // Highest belt first; the anchor award's awardedAt is the tiebreak (RankEntry has no date).
    orderBy: rankEntryDisplayOrder,
  })

  // First entry per user wins (already ordered highest-rank-first) → one row per person.
  const seen = new Set<string>()
  const members: TopRankedMember[] = []
  for (const entry of entries) {
    if (seen.has(entry.passportId)) continue
    seen.add(entry.passportId)
    const passportDto = projectPublicPassport(entry.passport, { showRanks: true })
    members.push({
      id: entry.passportId,
      name: passportDto.displayName,
      image: passportDto.avatarUrl,
      rankName: entry.rank.name,
      colorHex: entry.rank.colorHex,
    })
    if (members.length >= take) break
  }

  return members
}
