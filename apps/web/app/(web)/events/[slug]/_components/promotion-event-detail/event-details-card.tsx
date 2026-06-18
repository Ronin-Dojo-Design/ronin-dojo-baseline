import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { bblHeadingFontClass } from "~/components/web/ui/brand-typography"
import { formatDate } from "./event-detail-format"

/**
 * The "Event Details" card: the public description plus a host / date / location
 * definition list. `location` is the already-resolved event location (own location
 * falling back to the host org's city/state).
 */
export function EventDetailsCard({
  description,
  hostOrganization,
  eventDate,
  location,
}: {
  description: string | null
  hostOrganization: { slug: string; name: string } | null
  eventDate: Date | null
  location: string | null
}) {
  return (
    <Card hover={false}>
      <CardHeader>
        <H4 className={bblHeadingFontClass}>Event Details</H4>
      </CardHeader>
      <CardDescription className="line-clamp-none">
        {description ?? "This ceremony does not have a public description yet."}
      </CardDescription>
      <dl className="grid w-full gap-2 text-sm @sm:grid-cols-[9rem_minmax(0,1fr)]">
        {hostOrganization && (
          <>
            <dt className="text-muted-foreground">Host</dt>
            <dd>
              <Link href={`/organizations/${hostOrganization.slug}`}>{hostOrganization.name}</Link>
            </dd>
          </>
        )}
        <dt className="text-muted-foreground">Date</dt>
        <dd>{formatDate(eventDate)}</dd>
        {location && (
          <>
            <dt className="text-muted-foreground">Location</dt>
            <dd>{location}</dd>
          </>
        )}
      </dl>
    </Card>
  )
}
