import type { Metadata } from "next"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import { getOrganizationsByBrand } from "~/server/web/organization/queries"
import { OrganizationsList } from "./_components/organizations-list"

const PAGE_URL = "/organizations"
const PAGE_TITLE = "Organizations"
const PAGE_DESCRIPTION = "Browse dojos, schools, clubs, and leagues in the martial arts network."

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url: PAGE_URL,
    metadata: { title: PAGE_TITLE, description: PAGE_DESCRIPTION },
  })
}

export default async function OrganizationsPage() {
  const brand = await getRequestBrand()
  const orgs = await getOrganizationsByBrand(brand)

  return (
    <OrganizationsList
      orgs={orgs}
      brand={brand}
      url={PAGE_URL}
      title={PAGE_TITLE}
      description={PAGE_DESCRIPTION}
    />
  )
}
