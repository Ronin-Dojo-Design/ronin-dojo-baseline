import { Badge } from "~/components/common/badge"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Section } from "~/components/web/ui/section"
import type { DirectoryProfile } from "./directory-profile-data"

/** Schools & organizations the member is affiliated with (full profile only). */
export function OrganizationsSection({ profile }: { profile: DirectoryProfile }) {
  const { user } = profile

  if (user.organizations.length === 0) {
    return null
  }

  return (
    <Section>
      <H4>Schools &amp; Organizations</H4>
      <Stack size="sm">
        {user.organizations.map((org, index) => (
          // WL-P3-43: composite key — one member can hold several rows for the same org
          // (multi-affiliation), so `org.id` alone repeats and warns; the index disambiguates.
          <div key={`${org.id}-${index}`} className="flex items-center gap-2">
            <Link href={`/schools/${org.slug}`} className="font-medium">
              {org.name}
            </Link>
            {org.discipline && <Badge variant="soft">{org.discipline.name}</Badge>}
          </div>
        ))}
      </Stack>
    </Section>
  )
}
