import {
  createSearchParamsCache,
  type inferParserType,
  parseAsInteger,
  parseAsString,
} from "nuqs/server"

export const directoryFilterParams = {
  q: parseAsString.withDefault(""),
  sort: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(24),
  org: parseAsString.withDefault(""),
  discipline: parseAsString.withDefault(""),
  rank: parseAsString.withDefault(""),
  city: parseAsString.withDefault(""),
  region: parseAsString.withDefault(""),
}

export const directoryFilterParamsCache = createSearchParamsCache(directoryFilterParams)

export type DirectoryFilterSchema = typeof directoryFilterParams
export type DirectoryFilterParams = inferParserType<typeof directoryFilterParams>
