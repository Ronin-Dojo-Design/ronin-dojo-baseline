import dynamic from "next/dynamic"
import { OrgClaimCta } from "~/components/web/claims/org-claim-cta"
import { PromotionTimeline } from "~/components/web/promotion-events/promotion-timeline"
import { BrandTypography, bblHeadingScopeClass } from "~/components/web/ui/brand-typography"
import { Section } from "~/components/web/ui/section"
import type { OrganizationDetailView } from "./organization-detail-data"
import { OrganizationAbout } from "./organization-about"
import { OrganizationHeader } from "./organization-header"
import { OrganizationSidebar } from "./organization-sidebar"
import { OrganizationStructuredData } from "./organization-structured-data"

// Lazy boundaries: the roster + the related grid sit below the Overview/Details fold,
// so their chunks (the roster also bundles the join + membership-action client
// islands) only load once reached. SSR is kept (no `ssr: false`) so the content still
// server-renders for SEO — same pattern as the BBL landing orchestrator.
const OrganizationMembers = dynamic(() =>
  import("./organization-members").then(m => m.OrganizationMembers),
)
const RelatedOrganizations = dynamic(() =>
  import("./related-organizations").then(m => m.RelatedOrganizations),
)

/**
 * Public org detail orchestrator — the colocated folder module's barrel and only
 * export (component-launch-sweep recipe). Thin: it wires the extracted sections and
 * lazy-loads the below-fold ones; it owns no section presentation and no data
 * fetching (the route loads the view model via `loadOrganizationDetail`).
 *
 * Brand seam: the whole visible body renders inside `BrandTypography` so headings +
 * body inherit the BBL type tokens under BBL and degrade to the app fonts off-BBL
 * (the consumer authorizes the tokens; the sections stay brand-agnostic). Org theme
 * colors keep flowing from `OrgSettings` via the route `layout.tsx` `[data-org]` CSS
 * vars — unchanged. The JSON-LD stays a sibling after the scope.
 *
 * @see docs/runbooks/component-launch-sweep-recipe.md
 */
export function OrganizationDetail({
  org,
  brand,
  isOwner,
  canManage,
  roles,
  uniqueMembers,
  uniqueMemberCount,
  formattedAddress,
  relatedOrgs,
  promotionTimeline,
  isSignedIn,
  orgUrl,
  breadcrumbItems,
}: OrganizationDetailView) {
  return (
    <>
      <BrandTypography brand={brand} className={bblHeadingScopeClass}>
        <OrganizationHeader
          org={org}
          uniqueMemberCount={uniqueMemberCount}
          formattedAddress={formattedAddress}
          breadcrumbItems={breadcrumbItems}
        />

        {!org.ownerId && (
          <OrgClaimCta
            organizationId={org.id}
            organizationName={org.name}
            returnPath={orgUrl}
            isSignedIn={isSignedIn}
          />
        )}

        <Section>
          <Section.Content>
            <OrganizationAbout org={org} formattedAddress={formattedAddress} />

            <PromotionTimeline entries={promotionTimeline} />

            <OrganizationMembers
              org={org}
              brand={brand}
              uniqueMembers={uniqueMembers}
              uniqueMemberCount={uniqueMemberCount}
              roles={roles}
              isOwner={isOwner}
            />
          </Section.Content>

          <Section.Sidebar>
            <OrganizationSidebar
              org={org}
              isOwner={isOwner}
              canManage={canManage}
              uniqueMemberCount={uniqueMemberCount}
            />
          </Section.Sidebar>
        </Section>

        {relatedOrgs.length > 0 && <RelatedOrganizations relatedOrgs={relatedOrgs} />}
      </BrandTypography>

      <OrganizationStructuredData org={org} breadcrumbItems={breadcrumbItems} orgUrl={orgUrl} />
    </>
  )
}
