import { createSearchParamsCache, parseAsInteger } from "nuqs/server"
import { getSortingStateParser } from "~/lib/parsers"
import type { OrganizationRow } from "./queries"

/**
 * Params/sort schema for the organizations list (`/app/organizations`) migrated onto
 * `AdminCollection` (ADR 0045). The hand-rolled list had no search axis; this schema
 * carries only pagination + sort. Sort is threaded to the query (`resolveOrgOrderBy` maps
 * the Organization/Brand headers to real Prisma orders) and defaults to `name asc`.
 */
export const organizationsTableParamsSchema = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(50),
  sort: getSortingStateParser<OrganizationRow>().withDefault([{ id: "name", desc: false }]),
}

export const organizationsTableParamsCache = createSearchParamsCache(organizationsTableParamsSchema)
export type OrganizationsTableSchema = Awaited<
  ReturnType<typeof organizationsTableParamsCache.parse>
>
