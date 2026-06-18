import { StructuredData } from "~/components/web/structured-data"
import {
  createGraph,
  generateBreadcrumbs,
  generateCollectionPage,
  generateSchemaReference,
  generateStructuredDataEntity,
} from "~/lib/structured-data"
import type { BreadcrumbItem, OrganizationDetailView } from "./organization-detail-data"

type OrganizationStructuredDataProps = {
  org: OrganizationDetailView["org"]
  breadcrumbItems: BreadcrumbItem[]
  orgUrl: string
}

/**
 * JSON-LD graph for the org detail page (breadcrumbs + CollectionPage + the
 * Organization entity with its discipline `about` references + postal address).
 * Renders a zero-height `<script>`, so it stays a sibling AFTER the brand typography
 * scope without affecting the page's visible vertical rhythm (the /about gotcha).
 */
export function OrganizationStructuredData({
  org,
  breadcrumbItems,
  orgUrl,
}: OrganizationStructuredDataProps) {
  const orgReference = generateSchemaReference("Organization", orgUrl, org.name)
  const disciplineReferences = org.disciplines.map(od =>
    generateSchemaReference("Thing", `/disciplines/${od.discipline.slug}`, od.discipline.name),
  )

  return (
    <StructuredData
      data={createGraph([
        generateBreadcrumbs(breadcrumbItems),
        generateCollectionPage(orgUrl, org.name, org.description ?? `${org.type} organization`, {
          mainEntity: orgReference,
          about: orgReference,
        }),
        generateStructuredDataEntity({
          type: "Organization",
          url: orgUrl,
          name: org.name,
          description: org.description,
          id: orgReference["@id"],
          about: disciplineReferences.length > 0 ? disciplineReferences : undefined,
          address: {
            streetAddress: [org.addressLine1, org.addressLine2].filter(Boolean).join(", "),
            addressLocality: org.city,
            addressRegion: org.state,
            postalCode: org.zip,
            addressCountry: org.country,
          },
        }),
      ])}
    />
  )
}
