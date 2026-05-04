import {
  createSearchParamsCache,
  type inferParserType,
  parseAsInteger,
  parseAsString,
} from "nuqs/server"

export const techniqueFilterParams = {
  q: parseAsString.withDefault(""),
  sort: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(24),
  category: parseAsString.withDefault(""),
  position: parseAsString.withDefault(""),
  discipline: parseAsString.withDefault(""),
}

export const techniqueFilterParamsCache = createSearchParamsCache(techniqueFilterParams)

export type TechniqueFilterSchema = typeof techniqueFilterParams
export type TechniqueFilterParams = inferParserType<typeof techniqueFilterParams>
