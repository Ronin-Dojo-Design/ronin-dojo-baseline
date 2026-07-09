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

/**
 * Paginated shape of the org-settings list for the `AdminCollection` frame (ADR 0045),
 * mirroring `findPeople` (`{ rows, total, pageCount }`). Same rows, same `name asc` order
 * as `findAllOrganizationsWithSettings`; only pagination is layered on so the frame's
 * pager wires correctly.
 */
export const findOrganizationsWithSettingsPaginated = async (params: {
  page?: number
  perPage?: number
}) => {
  const { page = 1, perPage = 50 } = params
  const skip = (page - 1) * perPage

  const [rows, total] = await db.$transaction([
    db.organization.findMany({
      select: organizationWithSettingsSelect,
      orderBy: { name: "asc" },
      take: perPage,
      skip,
    }),
    db.organization.count(),
  ])

  const pageCount = Math.max(1, Math.ceil(total / perPage))

  return { rows, total, pageCount }
}
