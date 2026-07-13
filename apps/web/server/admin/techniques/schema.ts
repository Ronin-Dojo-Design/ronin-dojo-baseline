import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import { getSortingStateParser } from "~/lib/parsers"
import { DEFAULT_TECHNIQUE_SORT } from "./constants"
import type { TechniqueAdminRow } from "./queries"

/**
 * Params/sort schema for the Techniques AdminCollection index (`/app/techniques`,
 * FI-027) — a SIBLING collection of `/app/tools` (ADR 0045). Carries pagination +
 * sort + a name search axis + a `scope` view control. `scope` defaults to
 * `pending-promotion` so the surface opens on authored techniques awaiting the
 * SESSION_0529 3C staff `isFeatured` promotion (the reason this list exists).
 */
export const techniquesTableParamsSchema = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  sort: getSortingStateParser<TechniqueAdminRow>().withDefault(DEFAULT_TECHNIQUE_SORT),
  name: parseAsString.withDefault(""),
  scope: parseAsStringEnum([
    "pending-promotion",
    "featured",
    "authored",
    "all",
  ] as const).withDefault("pending-promotion"),
}

export const techniquesTableParamsCache = createSearchParamsCache(techniquesTableParamsSchema)
export type TechniquesTableSchema = Awaited<ReturnType<typeof techniquesTableParamsCache.parse>>
