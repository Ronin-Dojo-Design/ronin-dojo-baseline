import { filterAdminSectionGroups } from "~/config/admin-sections"
import type { SessionUser } from "~/server/orpc/context"
import { db } from "~/services/db"

/**
 * Live-count sources for sections with an obvious backing model — a missing href
 * simply hides the tile's badge. Claims counts PENDING only (the actionable review
 * queue, unified `PassportClaimRequest`, ADR 0036); everything else is a plain total.
 *
 * Extracted from the beta page (SESSION_0600) so the `/app` landing and the beta
 * `/app/beta/command-deck` route share ONE count source (no fork).
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

export type CommandDeckData = {
  /** Server-filtered reachable hrefs — same permission rules as the sidebar. */
  allowedHrefs: string[]
  /** Live counts keyed by href; missing/null = no badge. */
  counts: Record<string, number | null>
}

/**
 * Resolve the Command Deck's server props for `user`: the permission-filtered
 * section hrefs plus live counts for ONLY the reachable ones (RSC props reach the
 * client — never leak numbers for areas the filter hid). A failed count is a hidden
 * badge, never a broken page.
 */
export async function resolveCommandDeckData(
  user: SessionUser,
  hasLineageGrant: boolean,
): Promise<CommandDeckData> {
  const allowedHrefs = filterAdminSectionGroups(user, hasLineageGrant).flatMap(group =>
    group.items.map(item => item.href),
  )

  const countable = allowedHrefs.filter(href => COUNT_QUERIES[href] != null)
  let counts: Record<string, number | null>
  try {
    const resolved = await Promise.all(countable.map(href => COUNT_QUERIES[href]!()))
    counts = Object.fromEntries(countable.map((href, index) => [href, resolved[index] ?? null]))
  } catch {
    counts = Object.fromEntries(countable.map(href => [href, null]))
  }

  return { allowedHrefs, counts }
}
