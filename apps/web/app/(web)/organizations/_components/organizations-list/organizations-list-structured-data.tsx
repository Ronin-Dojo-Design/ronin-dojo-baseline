import { StructuredData } from "~/components/web/structured-data"
import {
  createGraph,
  generateBreadcrumbs,
  generateCollectionPageWithGenericItems,
  generateSchemaReference,
} from "~/lib/structured-data"
import type { OrganizationMany } from "~/server/web/organization/payloads"

type OrganizationsListStructuredDataProps = {
  orgs: OrganizationMany[]
  url: string
  title: string
  description: string
}

/**
 * JSON-LD for the organizations listing (breadcrumbs + a CollectionPage whose items
 * are the brand's organizations with their discipline `about` references + locality).
 * Renders a zero-height `<script>`, so it stays a sibling after the brand typography
 * scope without changing the page's visible rhythm.
 */
export function OrganizationsListStructuredData({
  orgs,
  url,
  title,
  description,
}: OrganizationsListStructuredDataProps) {
  const itemListItems = orgs.map(o => ({
    name: o.name,
    url: `/organizations/${o.slug}`,
    description: o.description,
    id: generateSchemaReference("Organization", `/organizations/${o.slug}`, o.name)["@id"],
    about:
      o.disciplines.length > 0
        ? o.disciplines.map(od =>
            generateSchemaReference(
              "Thing",
              `/disciplines/${od.discipline.slug}`,
              od.discipline.name,
            ),
          )
        : undefined,
    address: {
      addressLocality: o.city,
      addressRegion: o.state,
      addressCountry: o.country,
    },
  }))

  return (
    <StructuredData
      data={createGraph([
        generateBreadcrumbs([{ url, title }]),
        generateCollectionPageWithGenericItems(
          url,
          title,
          description,
          itemListItems,
          "Organization",
        ),
      ])}
    />
  )
}
