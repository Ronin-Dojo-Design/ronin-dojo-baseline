import dynamic from "next/dynamic"
import { OrgClaimCta } from "~/components/web/claims/org-claim-cta"
import { ListingDetail } from "~/components/web/listing/listing-detail"
import { ListingHeroAvatar } from "~/components/web/listing/listing-hero-avatar"
import { ListingSaveButton } from "~/components/web/listing/listing-save-button"
import { BrandTypography, bblHeadingScopeClass } from "~/components/web/ui/brand-typography"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import type { SchoolDetailView } from "./school-detail-data"
import { SchoolAbout } from "./school-about"
import { SchoolHeroBadges } from "./school-hero-badges"
import { SchoolIntro } from "./school-intro"
import { SchoolSidebar } from "./school-sidebar"
import { SchoolStructuredData } from "./school-structured-data"

// Lazy boundaries: the instructors grid, the programs grid, and the related-schools
// grid all sit below the About/sidebar fold, so their chunks only load once reached.
// SSR is kept (no `ssr: false` — illegal in a Server Component anyway) so the content
// still server-renders for SEO — same pattern as the BBL landing / org-detail
// orchestrators (component-launch-sweep step 3).
const SchoolInstructors = dynamic(() =>
  import("./school-instructors").then(m => m.SchoolInstructors),
)
const SchoolPrograms = dynamic(() => import("./school-programs").then(m => m.SchoolPrograms))
const RelatedSchools = dynamic(() => import("./related-schools").then(m => m.RelatedSchools))

/**
 * Public school detail orchestrator — the colocated folder module's barrel and only
 * export (component-launch-sweep recipe). Thin: it wires the reused `ListingDetail`
 * chrome to the extracted hero/sidebar/body sections and lazy-loads the below-fold
 * grids; it owns no section presentation and no data fetching (the route loads the
 * view model via `loadSchoolDetail`).
 *
 * Brand seam: the whole visible body renders inside `BrandTypography` with
 * `bblHeadingScopeClass`, so — under BBL — every descendant heading (including the
 * `ListingDetail` H1 and the section H4s) inherits the BBL heading type token, and
 * the body inherits the BBL body token; off-BBL it degrades to the app fonts. The
 * consumer authorises the tokens; the sections stay brand-agnostic. Belt colors stay
 * data-driven where on the wire; the JSON-LD stays a zero-height sibling after the
 * scope.
 *
 * @see docs/runbooks/component-launch-sweep-recipe.md
 */
export function SchoolDetail({
  school,
  brand,
  instructors,
  classesPerWeek,
  schoolInitials,
  formattedAddress,
  relatedSchools,
  promotionTimeline,
  isSignedIn,
  isUnclaimed,
  schoolUrl,
  breadcrumbItems,
  instructorRoleCodes,
}: SchoolDetailView) {
  return (
    <>
      <BrandTypography brand={brand} className={bblHeadingScopeClass}>
        <Breadcrumbs items={breadcrumbItems} />

        <ListingDetail
          media={
            <ListingHeroAvatar
              name={school.name}
              logoUrl={school.orgSettings?.logoUrl}
              initials={schoolInitials}
            />
          }
          title={school.name}
          badges={<SchoolHeroBadges school={school} />}
          actions={
            <ListingSaveButton
              subjectType="ORGANIZATION"
              subjectId={school.id}
              size="md"
              showLabel={false}
            />
          }
          intro={<SchoolIntro school={school} formattedAddress={formattedAddress} />}
          sidebar={
            <SchoolSidebar
              school={school}
              instructors={instructors}
              classesPerWeek={classesPerWeek}
            />
          }
          related={relatedSchools.length > 0 && <RelatedSchools relatedSchools={relatedSchools} />}
        >
          {isUnclaimed && (
            <OrgClaimCta
              organizationId={school.id}
              organizationName={school.name}
              noun="school"
              returnPath={schoolUrl}
              isSignedIn={isSignedIn}
            />
          )}

          <SchoolAbout
            school={school}
            formattedAddress={formattedAddress}
            promotionTimeline={promotionTimeline}
          />

          {instructors.length > 0 && (
            <SchoolInstructors
              instructors={instructors}
              instructorRoleCodes={instructorRoleCodes}
            />
          )}

          {school.programs.length > 0 && <SchoolPrograms school={school} />}
        </ListingDetail>
      </BrandTypography>

      <SchoolStructuredData school={school} formattedAddress={formattedAddress} />
    </>
  )
}
