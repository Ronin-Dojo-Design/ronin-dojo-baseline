/**
 * @added   SESSION_0729 (2026-07-30)
 * @why     Enforce highest-awarded display order and keep dated equal-sortOrder entries ahead of PostgreSQL DESC nulls
 * @wired   server/belt/member-ranks.ts, server/admin/tournaments/actions.ts, server/web/lineage/payloads.ts, server/web/passport/public-payloads.ts, server/web/directory/
 */
import type { Prisma } from "~/.generated/prisma/client"

// ADR 0035: highest awarded belt first; awardedAt desc NULLS LAST breaks equal-sortOrder ties.
// Never add a brand predicate: BBL ranks intentionally have `brand = null`.
export const rankEntryDisplayOrder = [
  { rank: { sortOrder: "desc" } },
  { rankAward: { awardedAt: { sort: "desc", nulls: "last" } } },
] satisfies Prisma.RankEntryOrderByWithRelationInput[]
