import type { Brand } from "~/.generated/prisma/client"
import { Badge } from "~/components/common/badge"
import { Stack } from "~/components/common/stack"
import { StructuredData } from "~/components/web/structured-data"
import { bblHeadingFontClass, BrandTypography } from "~/components/web/ui/brand-typography"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import {
  createGraph,
  generateBreadcrumbs,
  generateCollectionPageWithGenericItems,
} from "~/lib/structured-data"
import type { PromotionEventCard } from "~/server/web/promotion-events/payloads"
import { buildEventCollectionItems } from "./event-collection-schema"
import { EventGrid } from "./event-grid"
import { ReadSurfaceAside } from "./read-surface-aside"

type PromotionEventsIndexProps = {
  /** Resolved request brand — drives which font tokens the typography scope exposes. */
  brand: Brand
  /** Public promotion events for this brand, already fetched on the wire. */
  events: PromotionEventCard[]
  pageUrl: string
  pageTitle: string
  pageDescription: string
}

/**
 * Public orchestrator for the promotion-events index (the colocated folder
 * module's barrel — the only export consumers import). Thin by design: it shapes
 * the on-the-wire events into structured data, then composes the breadcrumbs +
 * intro + grid + sidebar inside the brand typography scope. All card/grid/aside
 * presentation lives in the sibling section files.
 *
 * @see docs/runbooks/component-launch-sweep-recipe.md
 */
export function PromotionEventsIndex({
  brand,
  events,
  pageUrl,
  pageTitle,
  pageDescription,
}: PromotionEventsIndexProps) {
  const collectionItems = buildEventCollectionItems(events)

  return (
    <>
      <StructuredData
        data={createGraph([
          generateBreadcrumbs([{ url: pageUrl, title: pageTitle }]),
          generateCollectionPageWithGenericItems(
            pageUrl,
            pageTitle,
            pageDescription,
            collectionItems,
            "CreativeWork",
          ),
        ])}
      />

      <BrandTypography brand={brand}>
        <Breadcrumbs items={[{ url: pageUrl, title: pageTitle }]} />

        <Intro>
          <IntroTitle className={bblHeadingFontClass}>{pageTitle}</IntroTitle>
          <IntroDescription>{pageDescription}</IntroDescription>
        </Intro>

        <Section>
          <Section.Content>
            <Stack className="mb-4 w-full justify-between">
              <p className="text-sm text-muted-foreground">
                {events.length} event{events.length === 1 ? "" : "s"}
              </p>
              <Badge variant="soft" size="sm">
                Read-only
              </Badge>
            </Stack>

            <EventGrid events={events} />
          </Section.Content>

          <Section.Sidebar>
            <ReadSurfaceAside />
          </Section.Sidebar>
        </Section>
      </BrandTypography>
    </>
  )
}
