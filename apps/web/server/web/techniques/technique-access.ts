import { Brand } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { getLineageProfileDetailRenderPolicyForUser } from "~/server/web/entitlements/lineage-tier-policy"
import { db } from "~/services/db"

/**
 * Whether a GIVEN viewer may watch a PREMIUM technique (SESSION_0525 freemium) — the core,
 * session-free resolver so callers that already resolved the viewer (the profile loader) don't
 * re-read the session.
 *
 * Reuse-first — the SAME "is this viewer premium" answer the public profile rides: the
 * `canRenderRichMedia` gate of `getLineageProfileDetailRenderPolicyForUser` for the VIEWER's own
 * `userId` (premium/elite/legend entitlement) OR the platform admin role OR the content's own
 * author (owner — the viewer's Passport authored one of the `authorPassportIds`). No new authz
 * system — it composes the existing tier policy + role + a Passport-author check.
 *
 * `authorPassportIds` are the passports that authored the technique's video attachments; the watch
 * page passes the attachment authors, the profile rail passes the profile's own passport.
 */
export async function isTechniqueViewerEntitled({
  userId,
  role,
  authorPassportIds,
}: {
  userId: string | null
  role: string | null | undefined
  authorPassportIds: readonly string[]
}): Promise<boolean> {
  if (!userId) {
    return false
  }

  // Admin always previews gated content (same as the profile rich-media gate).
  if (role === "admin") {
    return true
  }

  // Owner: the viewer's own Passport authored this content.
  if (authorPassportIds.length > 0) {
    const passport = await db.passport.findFirst({
      where: { userId },
      select: { id: true },
    })
    if (passport && authorPassportIds.includes(passport.id)) {
      return true
    }
  }

  // Paid tier: premium/elite/legend unlock rich media (the SAME gate cover/video/social ride) —
  // keyed off the VIEWER's own entitlement, never the profile owner's tier.
  const policy = await getLineageProfileDetailRenderPolicyForUser({ userId, brand: Brand.BBL })
  return policy.canRenderRichMedia
}

/**
 * Session-reading wrapper for the technique WATCH page — resolves the current viewer, then
 * delegates to `isTechniqueViewerEntitled`. Free techniques never call this (the caller
 * short-circuits on `isPremium === false`), so this only runs on a premium watch.
 */
export async function resolveTechniqueViewerEntitled(
  authorPassportIds: readonly string[],
): Promise<boolean> {
  const session = await getServerSession()
  return isTechniqueViewerEntitled({
    userId: session?.user?.id ?? null,
    role: session?.user?.role,
    authorPassportIds,
  })
}
