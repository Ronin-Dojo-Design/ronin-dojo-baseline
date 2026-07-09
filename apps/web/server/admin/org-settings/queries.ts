import type { Prisma } from "~/.generated/prisma/client"
import { runAdminListTransaction } from "~/server/admin/list-query"
import { db } from "~/services/db"

export const findOrgSettings = async (organizationId: string) => {
  return db.orgSettings.findUnique({ where: { organizationId } })
}

const organizationWithSettingsSelect = {
  id: true,
  name: true,
  slug: true,
  brand: true,
  orgSettings: {
    select: {
      id: true,
      primaryColor: true,
      primaryFgColor: true,
      accentColor: true,
      accentFgColor: true,
      logoUrl: true,
      faviconUrl: true,
      ogImageUrl: true,
    },
  },
} as const

export const findAllOrganizationsWithSettings = async () => {
  return db.organization.findMany({
    select: organizationWithSettingsSelect,
    orderBy: { name: "asc" },
  })
}

export type OrganizationRow = Awaited<ReturnType<typeof findAllOrganizationsWithSettings>>[number]

/** Columns the org list can actually be ordered by in Prisma (the theme swatch/badge is
 * computed and has no scalar to sort on). Anything else falls back to `name asc`. */
const ORG_ORDERABLE = new Set<keyof Prisma.OrganizationOrderByWithRelationInput>(["name", "brand"])

const defaultOrgOrderBy: Prisma.OrganizationOrderByWithRelationInput = { name: "asc" }

const resolveOrgOrderBy = (
  sort: Array<{ id: string; desc: boolean }>,
): Prisma.OrganizationOrderByWithRelationInput => {
  const primary = sort[0]
  if (primary && ORG_ORDERABLE.has(primary.id as keyof typeof defaultOrgOrderBy)) {
    return { [primary.id]: primary.desc ? "desc" : "asc" }
  }
  return defaultOrgOrderBy
}

/**
 * Paginated shape of the org-settings list for the `AdminCollection` frame (ADR 0045),
 * routed through `runAdminListTransaction` (like the exemplar `findPeople`) so it returns
 * the shared `{ rows, total, pageCount }` and shares the pager math. Same rows as
 * `findAllOrganizationsWithSettings`; the Organization/Brand header sort is threaded through
 * (`resolveOrgOrderBy`) and defaults to `name asc`.
 */
export const findOrganizationsWithSettingsPaginated = async (params: {
  page?: number
  perPage?: number
  sort?: Array<{ id: string; desc: boolean }>
}) => {
  const { page = 1, perPage = 50, sort = [] } = params
  const orderBy = resolveOrgOrderBy(sort)

  return runAdminListTransaction({
    perPage,
    findMany: () =>
      db.organization.findMany({
        select: organizationWithSettingsSelect,
        orderBy,
        take: perPage,
        skip: (page - 1) * perPage,
      }),
    count: () => db.organization.count(),
  })
}
