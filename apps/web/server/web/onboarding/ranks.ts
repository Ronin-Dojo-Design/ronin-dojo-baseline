import type { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"

export type BeltRankOption = {
  id: string
  name: string
  shortName: string | null
  colorHex: string | null
}

/**
 * Belt ranks for the profile-enhancement wizard's Step 2 picker.
 *
 * Data-driven from `Rank` (never a hardcoded belt-color map — the brand-safe
 * rule, ADR 0022), scoped to BELT-kind rank systems that are system-wide or
 * brand-specific, ordered by their `sortOrder`. Each option carries `colorHex`
 * so the picker can render a `<BeltSwatch>` per the lineage-surface pattern.
 */
export async function getBeltRanks(brand: Brand): Promise<BeltRankOption[]> {
  const ranks = await db.rank.findMany({
    where: {
      rankSystem: { kind: "BELT" },
      OR: [{ isSystem: true }, { brand }],
    },
    select: { id: true, name: true, shortName: true, colorHex: true },
    orderBy: { sortOrder: "asc" },
  })

  return ranks
}
