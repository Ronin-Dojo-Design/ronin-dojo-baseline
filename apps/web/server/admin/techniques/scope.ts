import type { Prisma } from "~/.generated/prisma/client"
import type { TechniquesTableSchema } from "~/server/admin/techniques/schema"

/**
 * Pure (DB-free) scope + ordering logic for the Techniques AdminCollection (FI-027). Extracted
 * from `queries.ts` so the novel scope→where mapping and the header-sort resolver are unit-testable
 * without importing the Prisma client. Consumed by `findTechniquesForAdmin`.
 */

/**
 * The `scope` view control → Prisma where fragment (merged onto the BBL base where).
 * `pending-promotion` is the default queue: authored (owner Passport present), published,
 * not-yet-featured — exactly the rows a staffer promotes on the `[id]` editor.
 */
export const techniqueScopeWhere: Record<
  TechniquesTableSchema["scope"],
  Prisma.TechniqueWhereInput
> = {
  "pending-promotion": { authorPassportId: { not: null }, isPublished: true, isFeatured: false },
  featured: { isFeatured: true },
  authored: { authorPassportId: { not: null } },
  all: {},
}

/** Columns the surface can be ordered by in Prisma (computed cells — Author, School,
 * Premium mix — have no scalar to sort on). Anything else falls back to `createdAt desc`. */
const TECHNIQUE_ORDERABLE = new Set<keyof Prisma.TechniqueOrderByWithRelationInput>([
  "name",
  "isFeatured",
  "isPublished",
  "createdAt",
])

const defaultTechniqueOrderBy: Prisma.TechniqueOrderByWithRelationInput = { createdAt: "desc" }

export const resolveTechniqueOrderBy = (
  sort: Array<{ id: string; desc: boolean }>,
): Prisma.TechniqueOrderByWithRelationInput => {
  const primary = sort[0]
  if (
    primary &&
    TECHNIQUE_ORDERABLE.has(primary.id as keyof Prisma.TechniqueOrderByWithRelationInput)
  ) {
    return { [primary.id]: primary.desc ? "desc" : "asc" }
  }
  return defaultTechniqueOrderBy
}
