import { Brand } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { getLineageProfileDetailRenderPolicyForUser } from "~/server/web/entitlements/lineage-tier-policy"

/**
 * SESSION_0537 (FI-028b) — the VIEWER-keyed read resolver for per-post community freemium, the
 * community analogue of `server/web/techniques/technique-access.ts#isTechniqueViewerEntitled`.
 *
 * Split in two by design:
 *   - `resolveCommunityViewerContext` reads the session ONCE and computes the two viewer-GLOBAL legs
 *     (admin, paid tier) for a whole feed render — a premium post's OWNER leg is a per-post field
 *     compare (no query), so the feed never issues N per-post lookups.
 *   - `isCommunityPostViewerEntitled` is a pure, synchronous per-post check that composes that
 *     context with the post's own `isPremium`/`authorId`.
 *
 * Decoupled from the CREATE gate (`canCreateCommunityPostForUser`) so "who may post" and "who may
 * read a premium post" can diverge later. NO new authz system — it rides the SAME
 * `canRenderRichMedia` tier gate the profile/technique rich-media surfaces already use, plus the role
 * and a field-compare owner leg.
 */

/** The viewer-global legs, resolved once per request for a whole feed. */
export type CommunityViewerContext = {
  /** The signed-in user's id, or `null` for a logged-out visitor (never entitled to a premium post). */
  userId: string | null
  /** Platform admin — always previews gated content (same as the profile/technique rich-media gate). */
  isAdmin: boolean
  /** The viewer's OWN paid-tier rich-media entitlement (premium/elite/legend). `false` when anon. */
  hasPaidTier: boolean
}

/**
 * Resolve the current viewer's community read context ONCE. `getServerSession` is request-cached, so
 * calling this alongside the page's other session reads costs no extra roundtrip; the tier lookup is
 * skipped entirely for anon viewers (they can never unlock a premium post).
 */
export async function resolveCommunityViewerContext(): Promise<CommunityViewerContext> {
  const session = await getServerSession()
  const userId = session?.user?.id ?? null
  const isAdmin = session?.user?.role === "admin"

  const hasPaidTier = userId
    ? (await getLineageProfileDetailRenderPolicyForUser({ userId, brand: Brand.BBL }))
        .canRenderRichMedia
    : false

  return { userId, isAdmin, hasPaidTier }
}

/**
 * Is THIS viewer entitled to read a given post's full body + media? Pure/synchronous — the owner leg
 * is a direct `authorId === userId` compare (no Passport lookup, unlike the technique gate), and the
 * admin/paid legs come from the pre-resolved context.
 *
 *   free post            → everyone (incl. anon)
 *   premium + admin      → yes
 *   premium + author     → yes (the post's own author)
 *   premium + paid tier  → yes
 *   premium + anon/free  → NO (locked)
 */
export function isCommunityPostViewerEntitled(
  post: { isPremium: boolean; authorId: string },
  ctx: CommunityViewerContext,
): boolean {
  if (!post.isPremium) {
    return true
  }
  if (ctx.isAdmin) {
    return true
  }
  if (ctx.userId && post.authorId === ctx.userId) {
    return true
  }
  return ctx.hasPaidTier
}
