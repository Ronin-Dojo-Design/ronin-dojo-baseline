import "server-only"

import type { Prisma } from "~/.generated/prisma/client"
import { clampListPageParams, runAdminListTransaction } from "~/server/admin/list-query"
import type { PlanningIntakeTableSchema } from "~/server/admin/planning-intake/schema"
import { db } from "~/services/db"

/**
 * Admin queries for the PlanningIntake triage index (SESSION_0592) — the AdminCollection-conformed
 * sibling of `/app/techniques` and `/app/reports`. Powers the staff surface that triages
 * `FeatureWidget` idea-dump rows before hand-promotion into `planning-ledger.md` PL rows.
 */
const planningIntakeAdminSelect = {
  id: true,
  category: true,
  body: true,
  imageUrls: true,
  status: true,
  createdAt: true,
  createdBy: { select: { name: true } },
} satisfies Prisma.PlanningIntakeSelect

// Derived from the SELECT (not from `findPlanningIntakeForAdmin`) on purpose — same TS2456
// cycle-avoidance as `TechniqueAdminRow` (the params schema's `sort` parser is generic over
// this row type, so deriving it from the query function would make the two type-reference
// each other).
export type PlanningIntakeAdminRow = Prisma.PlanningIntakeGetPayload<{
  select: typeof planningIntakeAdminSelect
}>

/** Columns the surface can be ordered by in Prisma (computed/relation cells have no scalar to
 * sort on). Anything else falls back to `createdAt desc`. */
const PLANNING_INTAKE_ORDERABLE = new Set<keyof Prisma.PlanningIntakeOrderByWithRelationInput>([
  "category",
  "status",
  "createdAt",
])

const resolvePlanningIntakeOrderBy = (
  sort: Array<{ id: string; desc: boolean }>,
): Prisma.PlanningIntakeOrderByWithRelationInput => {
  const primary = sort[0]
  if (
    primary &&
    PLANNING_INTAKE_ORDERABLE.has(primary.id as keyof Prisma.PlanningIntakeOrderByWithRelationInput)
  ) {
    return { [primary.id]: primary.desc ? "desc" : "asc" }
  }
  return { createdAt: "desc" }
}

/**
 * Paginated PlanningIntake rows for the `AdminCollection` frame, routed through
 * `runAdminListTransaction` so it shares the `{ rows, total, pageCount }` shape and pager math
 * with the other admin surfaces. `status` defaults to the `NEW` triage queue (see `schema.ts`);
 * `"all"` clears the filter.
 */
export async function findPlanningIntakeForAdmin(search: PlanningIntakeTableSchema) {
  const { page, perPage } = clampListPageParams(search.page, search.perPage)
  const orderBy = resolvePlanningIntakeOrderBy(search.sort)

  const where: Prisma.PlanningIntakeWhereInput = {
    ...(search.status === "all" ? {} : { status: search.status }),
    ...(search.body ? { body: { contains: search.body, mode: "insensitive" } } : {}),
  }

  return runAdminListTransaction({
    perPage,
    findMany: () =>
      db.planningIntake.findMany({
        where,
        orderBy,
        select: planningIntakeAdminSelect,
        take: perPage,
        skip: (page - 1) * perPage,
      }),
    count: () => db.planningIntake.count({ where }),
  })
}
