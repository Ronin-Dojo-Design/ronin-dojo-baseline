import type { Prisma } from "~/.generated/prisma/client"
import type { ExtendedSortingState } from "~/types"
import type { TechniqueAdminRow } from "./queries"

/**
 * The one Techniques-index default sort: newest first (WL-P2-56). A single field-of-truth
 * (`createdAt`) drives BOTH shapes so the concept lives in one place: the params-schema parser
 * default (sort-state array) and the query's `resolveTechniqueOrderBy` fallback (Prisma orderBy
 * object). Parked in a leaf module (only type-imports) so neither `schema.ts` nor `scope.ts`
 * pulls the other at runtime.
 */
const DEFAULT_TECHNIQUE_SORT_FIELD = "createdAt" as const

export const DEFAULT_TECHNIQUE_SORT: ExtendedSortingState<TechniqueAdminRow> = [
  { id: DEFAULT_TECHNIQUE_SORT_FIELD, desc: true },
]

export const defaultTechniqueOrderBy: Prisma.TechniqueOrderByWithRelationInput = {
  [DEFAULT_TECHNIQUE_SORT_FIELD]: "desc",
}
