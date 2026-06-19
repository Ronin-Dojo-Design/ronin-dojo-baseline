import { EmptyList } from "~/components/common/empty-list"
import { Grid } from "~/components/web/ui/grid"
import type { PromotionEventCard } from "~/server/web/promotion-events/payloads"
import { EventCard } from "./event-card"

/**
 * The public events grid: one `EventCard` per ceremony, or an empty state when no
 * public promotion events exist for the request brand.
 */
export function EventGrid({ events }: { events: PromotionEventCard[] }) {
  if (events.length === 0) {
    return <EmptyList>No public promotion events are available yet.</EmptyList>
  }

  return (
    <Grid>
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </Grid>
  )
}
