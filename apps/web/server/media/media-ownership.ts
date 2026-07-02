/**
 * Caller-supplied `mediaId` ownership guard (SESSION_0492 FIX 2, HIGH).
 *
 * Several member-facing seams accept a `mediaId` the client supplies and persist it
 * (promotion-claim evidence, belt-milestone media attachments). Without a check, a
 * caller can point at ANY Media row — including another member's private
 * (`isPublic = false`) media — disclosing it to reviewers / attaching it to the
 * attacker's own record; a nonexistent id would surface as a raw Prisma P2003 500.
 *
 * This is the ONE place that maps `(mediaId, userId)` → the owned Media row. The
 * owner column on `Media` is `uploadedById` (see `prisma/schema.prisma`). Returns
 * `null` when the media does not exist OR is owned by someone else — a single opaque
 * "not yours" result, so callers surface it as their own domain error (a friendly
 * NOT_FOUND, never a 500), and the check never distinguishes missing-vs-foreign to a
 * caller. Error-agnostic on purpose: each seam owns its error shape (oRPC `ORPCError`
 * vs a plain domain `Error`), so this helper only resolves — it never throws.
 */

// biome-ignore lint/suspicious/noExplicitAny: Prisma client / tx surface (callers pass ctx.db or tx).
type Db = any

/**
 * Resolve a caller-supplied `mediaId` to its Media row IFF it exists AND the calling
 * user owns it (`uploadedById === userId`). Returns the `{ id }` row or `null`.
 */
export async function resolveOwnedMedia(
  db: Db,
  mediaId: string,
  userId: string,
): Promise<{ id: string } | null> {
  const media = await db.media.findUnique({
    where: { id: mediaId },
    select: { id: true, uploadedById: true },
  })
  if (!media || media.uploadedById !== userId) {
    return null
  }
  return { id: media.id }
}
