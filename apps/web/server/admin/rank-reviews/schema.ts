/**
 * @added   SESSION_0541 (2026-07-15)
 * @why     Keep belt-review pagination and sorting aligned with the shared AdminCollection contract
 * @wired   app/app/belt-reviews/page.tsx
 */
import { createSearchParamsCache, parseAsInteger } from "nuqs/server"
import { getSortingStateParser } from "~/lib/parsers"
import type { RankReviewAdminRow } from "./queries"

/**
 * Params/sort schema for the belt-review queue (`/app/belt-reviews`, G-010) — a SIBLING
 * AdminCollection of `/app/techniques` (ADR 0045). The list is FIXED to
 * open `PENDING | PROPOSAL_PENDING, reason: PROMOTER_CHANGED` rows in the query (not a `scope`
 * control): captured proposals can be actioned; legacy payload-less rows remain visible but fail
 * closed. Sort defaults to `createdAt asc` so the oldest unactioned review surfaces first
 * (FIFO moderation), the opposite of the newest-first content indexes.
 */
export const rankReviewsTableParamsSchema = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  sort: getSortingStateParser<RankReviewAdminRow>().withDefault([{ id: "createdAt", desc: false }]),
}

export const rankReviewsTableParamsCache = createSearchParamsCache(rankReviewsTableParamsSchema)
export type RankReviewsTableSchema = Awaited<ReturnType<typeof rankReviewsTableParamsCache.parse>>
