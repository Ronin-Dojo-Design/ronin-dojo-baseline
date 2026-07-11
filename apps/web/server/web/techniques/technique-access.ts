import { Brand } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { getLineageProfileDetailRenderPolicyForUser } from "~/server/web/entitlements/lineage-tier-policy"
import { db } from "~/services/db"

/**
 * Whether the CURRENT viewer may watch a PREMIUM technique (SESSION_0525 freemium).
 *
 * Reuse-first — the SAME "is this viewer premium" answer the public profile rides: the
 * `canRenderRichMedia` gate of `getLineageProfileDetailRenderPolicyForUser` (premium/elite/legend
 * entitlement) OR the platform admin role OR the technique's own author (owner). No new authz
 * system — this composes the existing tier policy + role + a Passport-author check.
 *
 * `authorPassportIds` are the passports that authored the technique's video attachments (from the
 * `techniqueOnePayload` media). Free techniques never call this (the caller short-circuits on
 * `isPremium === false`), so this only runs on a premium watch.
 */
export async function resolveTechniqueViewerEntitled(
  authorPassportIds: readonly string[],
): Promise<boolean> {
  const session = await getServerSession()
  const userId = session?.user?.id ?? null
  if (!userId) {
    return false
  }

  // Admin always previews gated content (same as the profile rich-media gate).
  if (session?.user?.role === "admin") {
    return true
  }

  // Owner: the viewer's own Passport authored this technique's video.
  if (authorPassportIds.length > 0) {
    const passport = await db.passport.findFirst({
      where: { userId },
      select: { id: true },
    })
    if (passport && authorPassportIds.includes(passport.id)) {
      return true
    }
  }

  // Paid tier: premium/elite/legend unlock rich media (the SAME gate cover/video/social ride).
  const policy = await getLineageProfileDetailRenderPolicyForUser({ userId, brand: Brand.BBL })
  return policy.canRenderRichMedia
}
