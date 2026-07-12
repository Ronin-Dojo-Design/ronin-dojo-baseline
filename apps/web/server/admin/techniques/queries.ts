import "server-only"

import { Brand, type Prisma } from "~/.generated/prisma/client"
import { clampListPageParams, runAdminListTransaction } from "~/server/admin/list-query"
import { resolveTechniqueOrderBy, techniqueScopeWhere } from "~/server/admin/techniques/scope"
import type { TechniquesTableSchema } from "~/server/admin/techniques/schema"
import { db } from "~/services/db"

/**
 * Admin queries for the Techniques AdminCollection index (FI-027, ADR 0045). Brand-scoped
 * to BBL. Powers the staff surface that discovers authored techniques awaiting the
 * SESSION_0529 3C `isFeatured` promotion; the row link targets `/app/techniques/[id]`.
 *
 * HARD NO-LEAK INVARIANT: the row select NEVER reads `mediaAttachments.url` /
 * `.thumbnailUrl` (premium media locators) — only `isPremium` for the free/premium mix
 * count. The list payload therefore cannot carry a premium locator by construction.
 */
const techniqueAdminSelect = {
  id: true,
  name: true,
  slug: true,
  isFeatured: true,
  isPublished: true,
  isPremium: true,
  // createdAt backs the default `createdAt desc` sort (and is the row's sort key). Scalar
  // timestamp only — not a media locator, so the no-leak invariant is unaffected.
  createdAt: true,
  author: { select: { displayName: true } },
  organization: { select: { name: true } },
  mediaAttachments: { select: { isPremium: true } },
} satisfies Prisma.TechniqueSelect

// Derived from the SELECT (not from `findTechniquesForAdmin`) on purpose: the params schema's
// `sort` parser is generic over this row type, and deriving the row from the schema-taking
// function would make the two type-reference each other (TS2456). GetPayload depends only on the
// select const, breaking that cycle.
export type TechniqueAdminRow = Prisma.TechniqueGetPayload<{ select: typeof techniqueAdminSelect }>

/**
 * Paginated Techniques for the `AdminCollection` frame (ADR 0045), routed through
 * `runAdminListTransaction` so it returns the shared `{ rows, total, pageCount }` and
 * shares the pager math with the other admin surfaces. The header sort is threaded through
 * `resolveTechniqueOrderBy`; `scope` + `name` compose the where onto the BBL base.
 */
export async function findTechniquesForAdmin(search: TechniquesTableSchema) {
  const { page, perPage } = clampListPageParams(search.page, search.perPage)
  const orderBy = resolveTechniqueOrderBy(search.sort)

  const nameWhere: Prisma.TechniqueWhereInput = search.name
    ? { name: { contains: search.name, mode: "insensitive" } }
    : {}

  const where: Prisma.TechniqueWhereInput = {
    brand: Brand.BBL,
    ...techniqueScopeWhere[search.scope],
    ...nameWhere,
  }

  return runAdminListTransaction({
    perPage,
    findMany: () =>
      db.technique.findMany({
        where,
        orderBy,
        select: techniqueAdminSelect,
        take: perPage,
        skip: (page - 1) * perPage,
      }),
    count: () => db.technique.count({ where }),
  })
}
