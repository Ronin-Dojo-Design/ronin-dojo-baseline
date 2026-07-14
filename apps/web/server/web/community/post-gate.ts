import type { CommunityPostMany, CommunityPostRowForGate } from "~/server/web/community/payloads"

/**
 * SESSION_0537 (FI-028b) — the TYPE-ENCODED no-leak gate for per-post community freemium, the
 * community analogue of `server/web/techniques/technique-media-gate.ts#gateTechniqueMedia`.
 *
 * The no-leak invariant is encoded in the RETURN TYPE: a `locked: true` view's post has NO `content`,
 * `videoUrl`, or `imageUrl` field AT ALL, so no render branch — and no serialized prop — can emit the
 * gated body/media for an unentitled viewer. The type system, not just discipline, prevents the leak
 * (mirroring `LockedTileMedia` omitting `url`). The bounded server-derived `excerpt` is KEPT as the
 * conversion hook (operator grill Q2: teaser that keeps the excerpt; the no-leak invariant applies to
 * the FULL body + media only).
 *
 * `authorId` (the server-only owner-leg field on `CommunityPostRowForGate`) is DROPPED from BOTH
 * branches, so it never crosses to a client component either.
 *
 * Pure/synchronous — no DB, no session, no React. `entitled` is the pre-resolved answer from
 * `isCommunityPostViewerEntitled`, passed in.
 */

/**
 * The client-facing shape of a LOCKED premium post: identity + the excerpt hook, with the full body
 * and media OMITTED (type-encoded, not merely undefined). `isPremium` is pinned `true`.
 */
export type CommunityPostLocked = {
  id: string
  type: CommunityPostMany["type"]
  title: string
  slug: string
  excerpt: string
  isPremium: true
  isHidden: boolean
  createdAt: Date
  style: { id: string; name: string } | null
  authorName: string
  authorImage: string | null
}

/**
 * A gated community post view. The client branches on `locked`: `false` → the full `CommunityPostMany`
 * (body + media + an `isPremium` flag for the "Premium" badge); `true` → the `CommunityPostLocked`
 * teaser whose type cannot carry the gated fields.
 */
export type CommunityPostView =
  | { locked: false; post: CommunityPostMany }
  | { locked: true; post: CommunityPostLocked }

/**
 * Gate a single post for a viewer. `entitled` (free post, admin, author, or paid tier) → the full
 * post with `authorId` stripped; otherwise → the locked teaser with `content`/`videoUrl`/`imageUrl`
 * (and `authorId`) stripped server-side, impossible to re-add by construction.
 */
export function gateCommunityPost(
  post: CommunityPostRowForGate,
  entitled: boolean,
): CommunityPostView {
  // Drop the server-only owner-leg field before the row can cross to a client component.
  const { authorId: _authorId, ...clientPost } = post

  if (entitled) {
    return { locked: false, post: clientPost }
  }

  // Type-encoded strip: rebuild ONLY the locked shape — no `content`/`videoUrl`/`imageUrl` key exists
  // on it, so the gated body/media cannot be serialized into the client payload. Keep the excerpt.
  return {
    locked: true,
    post: {
      id: clientPost.id,
      type: clientPost.type,
      title: clientPost.title,
      slug: clientPost.slug,
      excerpt: clientPost.excerpt,
      isPremium: true,
      isHidden: clientPost.isHidden,
      createdAt: clientPost.createdAt,
      style: clientPost.style,
      authorName: clientPost.authorName,
      authorImage: clientPost.authorImage,
    },
  }
}
