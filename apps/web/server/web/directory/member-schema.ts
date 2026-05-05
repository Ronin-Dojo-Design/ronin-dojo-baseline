import {
  createSearchParamsCache,
  type inferParserType,
  parseAsInteger,
  parseAsString,
} from "nuqs/server"

export const memberFilterParams = {
  q: parseAsString.withDefault(""),
  sort: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(24),
  discipline: parseAsString.withDefault(""),
  city: parseAsString.withDefault(""),
  region: parseAsString.withDefault(""),
}

export const memberFilterParamsCache = createSearchParamsCache(memberFilterParams)

export type MemberFilterSchema = typeof memberFilterParams
export type MemberFilterParams = inferParserType<typeof memberFilterParams>
