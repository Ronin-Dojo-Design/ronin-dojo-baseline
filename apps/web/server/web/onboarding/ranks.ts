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
 * rule, ADR 0026). Scoped to the BJJ discipline's belt ladder (the single IBJJF
 * system) — BBL is a BJJ lineage product, so the picker shows ONE ordered ladder.
 *
 * Without the discipline scope this pulled EVERY system-wide BELT system across
 * disciplines (IBJJF, two eskrima Doce Pares, Kajukenbo), so identically-named
 * belts collided into the jumbled, duplicated White/Orange/Blue/Purple list the
 * operator flagged (SESSION_0445 #5). The `brand` arg still lets a brand-specific
 * BJJ system through; today only the system-wide IBJJF ladder exists. Mirrors the
 * claim picker's `rankSystem.discipline.code = "bjj"` scope (rank-queries.ts).
 * Each option carries `colorHex` for the `<BeltSwatch>` (lineage-surface pattern).
 */
export async function getBeltRanks(brand: Brand): Promise<BeltRankOption[]> {
  const ranks = await db.rank.findMany({
    where: {
      rankSystem: { kind: "BELT", discipline: { code: "bjj" } },
      OR: [{ isSystem: true }, { brand }],
    },
    select: { id: true, name: true, shortName: true, colorHex: true },
    orderBy: { sortOrder: "asc" },
  })

  return ranks
}
