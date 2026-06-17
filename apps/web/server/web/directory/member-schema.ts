import { type inferParserType, parseAsInteger, parseAsString } from "nuqs/server"

const memberFilterParams = {
  q: parseAsString.withDefault(""),
  sort: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(24),
  discipline: parseAsString.withDefault(""),
  org: parseAsString.withDefault(""),
  rank: parseAsString.withDefault(""),
  city: parseAsString.withDefault(""),
  region: parseAsString.withDefault(""),
}

export type MemberFilterParams = inferParserType<typeof memberFilterParams>
