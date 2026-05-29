import { db } from "~/services/db"

export const findOrgSettings = async (organizationId: string) => {
  return db.orgSettings.findUnique({ where: { organizationId } })
}

export const findAllOrganizationsWithSettings = async () => {
  return db.organization.findMany({
    select: {
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
    },
    orderBy: { name: "asc" },
  })
}
