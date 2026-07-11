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
  // @added SESSION_0525 (Stream D1) — single-belt facet. The value is a `Rank.id`
  // matched by exact equality against the technique's `beltLevelMinId` FK (the tagged
  // belt). KISS per the operator: no min/max range — a member tags a technique with one
  // belt and we filter on that. `beltLevelMaxId` stays unused this lane.
  belt: parseAsString.withDefault(""),
}

export const techniqueFilterParamsCache = createSearchParamsCache(techniqueFilterParams)

export type TechniqueFilterSchema = typeof techniqueFilterParams
export type TechniqueFilterParams = inferParserType<typeof techniqueFilterParams>
