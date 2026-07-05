import type { Metadata } from "next"
import { filterAdminSectionGroups } from "~/config/admin-sections"
import { hasAnyLineageGrant, requirePermission } from "~/lib/auth-guard"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"
import { db } from "~/services/db"
import { CommandDeck } from "./command-deck"

export const metadata: Metadata = {
  title: "Command Deck",
}

/**
 * Live-count sources for sections with an obvious backing model — a missing
 * href simply hides the tile's badge. Claims counts PENDING only (the
 * actionable review queue, per the unified `PassportClaimRequest` model,
 * ADR 0036); everything else is a plain total.
 */
const COUNT_QUERIES: Record<string, () => Promise<number>> = {
  "/app/users": () => db.user.count(),
  "/app/claims": () => db.passportClaimRequest.count({ where: { status: "PENDING" } }),
  "/app/invites": () => db.invite.count(),
  "/app/memberships": () => db.membership.count(),
  "/app/organizations": () => db.organization.count(),
  "/app/certificates": () => db.certificateTemplate.count(),
  "/app/blog": () => db.post.count(),
  "/app/media": () => db.media.count(),
  "/app/events": () => db.event.count(),
  "/app/tournaments": () => db.tournament.count(),
  "/app/leads": () => db.lead.count(),
  "/app/subscriptions": () => db.userBrandSubscription.count(),
}

/**
 * Beta Command Deck (SESSION_0501) — the expressive opposite of the flat
 * `/app/sections` index: swipeable group pills + a live-count bento tile grid,
 * driven by the SAME `ADMIN_SECTION_GROUPS` config (no fork).
 */
export default async function () {
  // The `/app/beta` segment layout already gates on `beta.view`; re-assert here
  // so the page stays safe if it ever moves out of the beta segment.
  const user = await requirePermission(APP_AREA_PERMISSIONS.beta)
  const hasLineageGrant = await hasAnyLineageGrant(user.id)

  const allowedHrefs = filterAdminSectionGroups(user, hasLineageGrant).flatMap(group =>
    group.items.map(item => item.href),
  )

  // Counts ONLY for sections this user can reach (RSC props are visible to the
  // client — never leak numbers for areas the permission filter hid).
  const countable = allowedHrefs.filter(href => COUNT_QUERIES[href] != null)
  let counts: Record<string, number | null>
  try {
    const resolved = await Promise.all(countable.map(href => COUNT_QUERIES[href]!()))
    counts = Object.fromEntries(countable.map((href, index) => [href, resolved[index] ?? null]))
  } catch {
    // A failed count is a hidden badge, never a broken page.
    counts = Object.fromEntries(countable.map(href => [href, null]))
  }

  return <CommandDeck allowedHrefs={allowedHrefs} counts={counts} />
}
