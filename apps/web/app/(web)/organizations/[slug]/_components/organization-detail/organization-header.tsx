import { Badge } from "~/components/common/badge"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import type { OrganizationDetailView } from "./organization-detail-data"

type OrganizationHeaderProps = Pick<
  OrganizationDetailView,
  "org" | "uniqueMemberCount" | "breadcrumbItems"
>

/**
 * Public org "hero": breadcrumbs + the name/type/disciplines/member-count intro.
 * Returns a fragment so breadcrumbs and intro stay direct children of the brand
 * typography scope (preserving its `gap-y-fluid-md` rhythm, not nesting a new gap).
 * The `IntroTitle` inherits the BBL heading font from the scope's heading selector —
 * no per-element font class needed here.
 */
export function OrganizationHeader({
  org,
  uniqueMemberCount,
  breadcrumbItems,
}: OrganizationHeaderProps) {
  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />

      <Intro>
        <IntroTitle>{org.name}</IntroTitle>
        <IntroDescription>
          <Stack size="sm" className="flex-wrap">
            <Badge variant="outline" size="lg">
              {org.type}
            </Badge>
            {org.disciplines.map(od => (
              <Badge key={od.discipline.id} size="lg">
                <Link href={`/disciplines/${od.discipline.slug}`}>{od.discipline.name}</Link>
              </Badge>
            ))}
            <span className="text-sm text-muted-foreground">
              {uniqueMemberCount} member{uniqueMemberCount !== 1 ? "s" : ""}
            </span>
          </Stack>
        </IntroDescription>
      </Intro>
    </>
  )
}
