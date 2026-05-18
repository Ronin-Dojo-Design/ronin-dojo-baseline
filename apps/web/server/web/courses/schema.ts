import {
  createSearchParamsCache,
  type inferParserType,
  parseAsInteger,
  parseAsString,
} from "nuqs/server"

export const courseFilterParams = {
  q: parseAsString.withDefault(""),
  sort: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(12),
}

export const courseFilterParamsCache = createSearchParamsCache(courseFilterParams)

export type CourseFilterSchema = typeof courseFilterParams
export type CourseFilterParams = inferParserType<typeof courseFilterParams>
