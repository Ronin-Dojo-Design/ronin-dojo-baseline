import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import type { OrganizationDetailView } from "./organization-detail-data"

type OrganizationAboutProps = Pick<OrganizationDetailView, "org" | "formattedAddress">

/**
 * "About" block: the optional Overview prose plus the Details description list
 * (owner, type, address, website, phone, email). Presentational — every field is
 * rendered null-safe from the already-fetched org payload (on-the-wire data only).
 */
export function OrganizationAbout({ org, formattedAddress }: OrganizationAboutProps) {
  return (
    <>
      {org.description && (
        <div className="space-y-2">
          <H4>Overview</H4>
          <p className="text-sm text-secondary-foreground text-pretty">{org.description}</p>
        </div>
      )}

      <div className="space-y-3">
        <H4>Details</H4>
        <dl className="grid gap-2 text-sm @sm:grid-cols-[10rem_minmax(0,1fr)]">
          {org.owner?.name && (
            <>
              <dt className="text-muted-foreground">Owner</dt>
              <dd>{org.owner.name}</dd>
            </>
          )}

          <dt className="text-muted-foreground">Type</dt>
          <dd>{org.type}</dd>

          {formattedAddress && (
            <>
              <dt className="text-muted-foreground">Address</dt>
              <dd>{formattedAddress}</dd>
            </>
          )}

          {org.websiteUrl && (
            <>
              <dt className="text-muted-foreground">Website</dt>
              <dd>
                <Link href={org.websiteUrl} target="_blank" rel="noopener noreferrer">
                  {org.websiteUrl}
                </Link>
              </dd>
            </>
          )}

          {org.phoneE164 && (
            <>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{org.phoneE164}</dd>
            </>
          )}

          {org.email && (
            <>
              <dt className="text-muted-foreground">Email</dt>
              <dd>
                <Link href={`mailto:${org.email}`}>{org.email}</Link>
              </dd>
            </>
          )}
        </dl>
      </div>
    </>
  )
}
