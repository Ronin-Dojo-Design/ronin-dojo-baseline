import { Badge } from "~/components/common/badge"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { ListingHeroAvatar } from "~/components/web/listing/listing-hero-avatar"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { IntroTitle } from "~/components/web/ui/intro"
import { initialsOf } from "~/lib/directory/facet-result"
import type { OrganizationDetailView } from "./organization-detail-data"

type OrganizationHeaderProps = Pick<
  OrganizationDetailView,
  "org" | "uniqueMemberCount" | "formattedAddress" | "breadcrumbItems"
>

/**
 * Public org "hero" (SESSION_0415) — breadcrumbs + a premium avatar/title row that
 * mirrors the school detail hero and the person profile: a large `rounded-2xl` logo
 * (or gradient-initials) avatar beside the name, the type + linked discipline badges,
 * and a member-count / location meta line with a location pin.
 *
 * Returns a fragment so it stays a direct child of the brand typography scope
 * (preserving its `gap-y-fluid-md` rhythm). `IntroTitle` is the H1 and inherits the BBL
 * heading font from the scope's heading selector — no per-element font class needed.
 * Brand-neutral: theme tokens only; org theme colors keep flowing from the route layout.
 */
export function OrganizationHeader({
  org,
  uniqueMemberCount,
  formattedAddress,
  breadcrumbItems,
}: OrganizationHeaderProps) {
  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />

      <div className="flex items-start gap-4 sm:gap-5">
        <ListingHeroAvatar
          name={org.name}
          logoUrl={org.orgSettings?.logoUrl}
          initials={initialsOf(org.name)}
        />

        <div className="min-w-0 flex-1 space-y-3">
          <IntroTitle className="leading-tight!">{org.name}</IntroTitle>

          <Stack size="sm" className="flex-wrap">
            <Badge variant="outline" size="lg">
              {org.type}
            </Badge>
            {org.disciplines.map(od => (
              <Badge key={od.discipline.id} size="lg">
                <Link href={`/disciplines/${od.discipline.slug}`}>{od.discipline.name}</Link>
              </Badge>
            ))}
          </Stack>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>
              {uniqueMemberCount} member{uniqueMemberCount !== 1 ? "s" : ""}
            </span>
            {formattedAddress && (
              <span className="flex items-center gap-1.5">
                <svg
                  viewBox="0 0 24 24"
                  className="size-3.5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M12 21s-6-5.7-6-10a6 6 0 1 1 12 0c0 4.3-6 10-6 10Z" />
                  <circle cx="12" cy="11" r="2" />
                </svg>
                {formattedAddress}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
