import { generateSchemaReference } from "~/lib/structured-data"
import type { PromotionEventCard } from "~/server/web/promotion-events/payloads"

/**
 * Shape the public events into `CollectionPage` list items (one `CreativeWork`
 * per ceremony, each referencing its host `Organization` as provider). Pure
 * derivation pulled out of the orchestrator JSX so the barrel stays a thin
 * compose-and-wire layer. Events without a slug are skipped (no canonical URL).
 */
export function buildEventCollectionItems(events: PromotionEventCard[]) {
  return events
    .filter(event => event.slug)
    .map(event => ({
      name: event.title,
      url: `/events/${event.slug}`,
      description: event.description,
      id: generateSchemaReference("CreativeWork", `/events/${event.slug}`, event.title)["@id"],
      provider: event.hostOrganization
        ? generateSchemaReference(
            "Organization",
            `/organizations/${event.hostOrganization.slug}`,
            event.hostOrganization.name,
          )
        : undefined,
    }))
}
