import "server-only"

import { db } from "~/services/db"

/**
 * Fetch the BJJ ranks for the lineage claim rank picker (FI-006 — SESSION_0432).
 * Returns ranks ordered by sortOrder so the picker renders White→Red top-to-bottom.
 */
export async function getBjjRanksForClaimPicker() {
  return db.rank.findMany({
    where: {
      rankSystem: { discipline: { code: "bjj" } },
    },
    select: {
      id: true,
      name: true,
      shortName: true,
      colorHex: true,
      sortOrder: true,
      // @added SESSION_0539 — refined-belt render fields for the journey ladder swatch.
      secondaryColorHex: true,
      degree: true,
      beltFamily: true,
    },
    orderBy: { sortOrder: "asc" },
  })
}

export type BjjRankOption = Awaited<ReturnType<typeof getBjjRanksForClaimPicker>>[number]
