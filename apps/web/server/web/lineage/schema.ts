import {
  createSearchParamsCache,
  type inferParserType,
  parseAsInteger,
  parseAsString,
} from "nuqs/server"

export const LINEAGE_DEFAULT_PER_PAGE = 24
export const LINEAGE_MAX_PER_PAGE = 96

export const normalizeLineageSearchParams = <
  T extends { q: string; page: number; perPage: number },
>(
  params: T,
): T => ({
  ...params,
  q: params.q.trim(),
  page: Math.max(1, params.page),
  perPage:
    params.perPage > 0 ? Math.min(params.perPage, LINEAGE_MAX_PER_PAGE) : LINEAGE_DEFAULT_PER_PAGE,
})

export const lineageFilterParams = {
  q: parseAsString.withDefault(""),
  sort: parseAsString.withDefault("name.asc"),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(LINEAGE_DEFAULT_PER_PAGE),
  discipline: parseAsString.withDefault(""),
  organization: parseAsString.withDefault(""),
  // Tree kind = `scopeType` enum value (BBL-DISCOVER-002). "" → no kind narrowing.
  kind: parseAsString.withDefault(""),
}

export const lineageFilterParamsCache = createSearchParamsCache(lineageFilterParams)

export type LineageFilterSchema = typeof lineageFilterParams
export type LineageFilterParams = inferParserType<typeof lineageFilterParams>
