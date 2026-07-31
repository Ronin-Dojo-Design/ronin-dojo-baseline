import type { Prisma } from "~/.generated/prisma/client"

/**
 * ADR 0035 display law for RankEntry reads: highest awarded belt first, with
 * newest award as the deterministic same-rank tiebreak. Explicit NULLS LAST
 * prevents an undated lower award from winning PostgreSQL's descending order.
 *
 * Do not add a brand predicate here: BBL ranks intentionally have `brand = null`.
 */
export const rankEntryDisplayOrder = [
  { rank: { sortOrder: "desc" } },
  { rankAward: { awardedAt: { sort: "desc", nulls: "last" } } },
] satisfies Prisma.RankEntryOrderByWithRelationInput[]
