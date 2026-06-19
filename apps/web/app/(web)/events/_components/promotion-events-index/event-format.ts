import type { PromotionEventCard } from "~/server/web/promotion-events/payloads"

/**
 * Long-form ceremony date ("June 18, 2026"), UTC-pinned so the listing and the
 * detail page agree regardless of the viewer's timezone. Kept colocated to the
 * events-index module (the repo convention is a per-surface `formatDate`, not a
 * shared util — see the ~dozen local definitions across the app).
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "Unknown date"
  const d = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return "Unknown date"
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(d)
}

/**
 * The location shown on an event card: the event's own location, else the host
 * organization's "City, State", else null (the caller renders nothing).
 */
export function eventLocation(
  event: Pick<PromotionEventCard, "location" | "hostOrganization">,
): string | null {
  return (
    event.location ??
    ([event.hostOrganization?.city, event.hostOrganization?.state].filter(Boolean).join(", ") ||
      null)
  )
}
