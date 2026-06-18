import dynamic from "next/dynamic"
import type { Brand } from "~/.generated/prisma/client"
import { Stack } from "~/components/common/stack"
import { BrandTypography } from "~/components/web/ui/brand-typography"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Section } from "~/components/web/ui/section"
import type { PromotionEventDetail } from "~/server/web/promotion-events/payloads"
import { EventDetailHeader } from "./event-detail-header"
import { organizationLocation } from "./event-detail-format"
import { EventDetailsCard } from "./event-details-card"
import { GalleryAside } from "./gallery-aside"
import { PromotionsList } from "./promotions-list"

// Lazy boundary: the photo gallery is the heaviest, last-painted section. SSR is
// kept (no `ssr: false`) so the gallery still server-renders for SEO; the split
// just defers its module off the critical path. The header + details + promotions
// stay eager — they are the above-the-fold provenance the timeline drills into.
const CeremonyPhotos = dynamic(() => import("./ceremony-photos").then(m => m.CeremonyPhotos))

type PromotionEventDetailProps = {
  /** The ceremony, already fetched on the wire (slug guaranteed by the route). */
  event: PromotionEventDetail & { slug: string }
  /** Resolved request brand — drives which font tokens the typography scope exposes. */
  brand: Brand
}

/**
 * Public orchestrator for a single ceremony page (the colocated folder module's
 * barrel). Thin by design: it derives the breadcrumbs + location, then composes the
 * header, details, promotions, gallery sidebar, and the lazy photo gallery inside
 * the brand typography scope. All section presentation lives in the sibling files.
 *
 * This is the `/events/[slug]` provenance drill-down that the BBL promotion marquee
 * and lineage-cohort-timeline link into ("Promoted by X · date").
 *
 * @see docs/runbooks/component-launch-sweep-recipe.md
 */
export function PromotionEventDetail({ event, brand }: PromotionEventDetailProps) {
  const breadcrumbItems = [
    { url: "/events", title: "Events" },
    { url: `/events/${event.slug}`, title: event.title },
  ]
  const eventLocation = event.location ?? organizationLocation(event.hostOrganization)

  return (
    <BrandTypography brand={brand}>
      <Breadcrumbs items={breadcrumbItems} />

      <EventDetailHeader
        title={event.title}
        eventDate={event.eventDate}
        location={eventLocation}
        awardCount={event.rankAwards.length}
      />

      <Section>
        <Section.Content>
          <Stack direction="column" size="lg" className="w-full">
            <EventDetailsCard
              description={event.description}
              hostOrganization={event.hostOrganization}
              eventDate={event.eventDate}
              location={eventLocation}
            />

            <PromotionsList awards={event.rankAwards} />
          </Stack>
        </Section.Content>

        <Section.Sidebar>
          <GalleryAside photoCount={event.mediaAttachments.length} />
        </Section.Sidebar>
      </Section>

      <CeremonyPhotos mediaAttachments={event.mediaAttachments} eventTitle={event.title} />
    </BrandTypography>
  )
}
