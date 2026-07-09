import { createSearchParamsCache, parseAsInteger } from "nuqs/server"
import { getSortingStateParser } from "~/lib/parsers"
import type { ProfileClaimRow } from "./claim-queries"

/**
 * Params/sort schema for the profile-claim queue (`/app/claims`) migrated onto
 * `AdminCollection` (ADR 0045). The queue is small and had no search axis in its
 * hand-rolled form, so this schema carries only pagination + the default
 * `createdAt desc` sort the queue already ordered by. Behavior-preserving.
 */
export const claimsTableParamsSchema = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(50),
  sort: getSortingStateParser<ProfileClaimRow>().withDefault([{ id: "createdAt", desc: true }]),
}

export const claimsTableParamsCache = createSearchParamsCache(claimsTableParamsSchema)
export type ClaimsTableSchema = Awaited<ReturnType<typeof claimsTableParamsCache.parse>>
