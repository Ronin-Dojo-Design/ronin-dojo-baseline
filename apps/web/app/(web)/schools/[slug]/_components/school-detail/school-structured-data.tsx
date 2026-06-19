import type { EducationalOrganization, PostalAddress } from "schema-dts"
import { StructuredData } from "~/components/web/structured-data"
import { siteConfig } from "~/config/site"
import { generateCollectionPage } from "~/lib/structured-data"
import type { SchoolDetailView } from "./school-detail-data"

type SchoolStructuredDataProps = Pick<SchoolDetailView, "school" | "formattedAddress">

/**
 * JSON-LD graph for the school detail page: a WebPage CollectionPage plus the
 * `EducationalOrganization` entity (address / telephone / email / sameAs). Renders a
 * zero-height `<script>`, so it stays a sibling AFTER the brand typography scope
 * without affecting the page's visible vertical rhythm. Built verbatim from the prior
 * inline route body (on-the-wire data only).
 */
export function SchoolStructuredData({ school, formattedAddress }: SchoolStructuredDataProps) {
  const educationalOrg: EducationalOrganization = {
    "@type": "EducationalOrganization",
    "@id": `${siteConfig.url}/schools/${school.slug}#school`,
    name: school.name,
    url: `${siteConfig.url}/schools/${school.slug}`,
    description: school.description ?? undefined,
    ...(formattedAddress
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress:
              [school.addressLine1, school.addressLine2].filter(Boolean).join(", ") || undefined,
            addressLocality: school.city ?? undefined,
            addressRegion: school.state ?? undefined,
            postalCode: school.zip ?? undefined,
            addressCountry: school.country ?? undefined,
          } satisfies PostalAddress,
        }
      : {}),
    ...(school.phoneE164 ? { telephone: school.phoneE164 } : {}),
    ...(school.email ? { email: school.email } : {}),
    ...(school.websiteUrl ? { sameAs: school.websiteUrl } : {}),
  }

  return (
    <StructuredData
      data={{
        "@context": "https://schema.org",
        "@graph": [
          generateCollectionPage(
            `/schools/${school.slug}`,
            school.name,
            school.description ??
              `${school.name} — ${school._count.memberships} members, ${school._count.programs} programs`,
          ),
          educationalOrg,
        ],
      }}
    />
  )
}
