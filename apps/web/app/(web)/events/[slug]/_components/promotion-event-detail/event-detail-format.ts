/**
 * Display helpers for the promotion-event detail surface. Colocated to the module
 * (the repo convention is a per-surface `formatDate`, not a shared util); the long
 * UTC-pinned format matches the events index so the two surfaces agree.
 */

import { nameInitials } from "~/lib/identity/passport-display"

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

/** A promotee's initials for the avatar fallback — canonical identity seam. */
export const initials = nameInitials

/** "City, State" for an org, or null when neither is set. */
export function organizationLocation(
  org: { city: string | null; state: string | null } | null,
): string | null {
  if (!org) return null
  return [org.city, org.state].filter(Boolean).join(", ") || null
}
