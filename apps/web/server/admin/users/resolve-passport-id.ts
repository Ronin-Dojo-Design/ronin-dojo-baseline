import { db } from "~/services/db"

/**
 * WL-P2-41(b) — legacy `/app/users/{userId}` bookmark fallback (SESSION_0701).
 *
 * The people detail route was re-keyed from User ids to Passport ids (the ADR 0045 person-detail
 * consolidation), so a pre-re-key bookmark or externally shared `/app/users/{userId}` URL fell
 * straight to `notFound()` — an accepted admin-internal tradeoff at SESSION_0515, hardened now.
 * `Passport.userId` is `@unique` (one account ↔ one passport), so an old USER-keyed URL resolves
 * to at most one passport; the page redirects to the passport-keyed URL when this returns an id.
 */

type PassportClient = typeof db

export async function resolvePassportIdByUserId(
  userId: string,
  client: PassportClient = db,
): Promise<string | null> {
  if (!userId) return null
  const passport = await client.passport.findUnique({
    where: { userId },
    select: { id: true },
  })
  return passport?.id ?? null
}
