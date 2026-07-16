import { createSearchParamsCache, parseAsInteger } from "nuqs/server"
import { getSortingStateParser } from "~/lib/parsers"
import type { RankReviewAdminRow } from "./queries"

/**
 * Params/sort schema for the belt-review queue (`/app/belt-reviews`, G-010) — a SIBLING
 * AdminCollection of `/app/techniques` (ADR 0045). The list is FIXED to
 * `status: PENDING, reason: PROMOTER_CHANGED` in the query (not a `scope` control): it exists
 * only to action the SESSION_0540 backfill-verification `RankEntryReview` rows nothing else
 * consumes. Sort defaults to `createdAt asc` so the oldest unactioned review surfaces first
 * (FIFO moderation), the opposite of the newest-first content indexes.
 */
export const rankReviewsTableParamsSchema = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  sort: getSortingStateParser<RankReviewAdminRow>().withDefault([{ id: "createdAt", desc: false }]),
}

export const rankReviewsTableParamsCache = createSearchParamsCache(rankReviewsTableParamsSchema)
export type RankReviewsTableSchema = Awaited<ReturnType<typeof rankReviewsTableParamsCache.parse>>
