import {
  createSearchParamsCache,
  type inferParserType,
  parseAsInteger,
  parseAsString,
} from "nuqs/server"

export const schoolFilterParams = {
  q: parseAsString.withDefault(""),
  sort: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(24),
  type: parseAsString.withDefault(""),
  discipline: parseAsString.withDefault(""),
  city: parseAsString.withDefault(""),
  region: parseAsString.withDefault(""),
}

export const schoolFilterParamsCache = createSearchParamsCache(schoolFilterParams)

export type SchoolFilterSchema = typeof schoolFilterParams
export type SchoolFilterParams = inferParserType<typeof schoolFilterParams>
