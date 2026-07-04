import type { Brand } from "~/.generated/prisma/client"
import { communityPostManyPayload, toCommunityPostMany } from "~/server/web/community/payloads"
import { db } from "~/services/db"

/**
 * Community feed queries (SESSION_0493, ADR 0042 Amendment 1). Every public read enforces
 * `status: PUBLISHED` — HIDDEN posts are excluded from the feed for EVERYONE and 404 on detail
 * for non-admins (post-moderation model; the "remember to filter or it leaks" bug class is closed
 * here, in one place).
 */

/**
 * The public feed: PUBLISHED + brand, newest first (the locked MVP sort).
 *
 * `take: FEED_TAKE` is a safety bound, not a pagination surface (D6). The MVP has NO posts yet, so a
 * cursor/pagination UI is YAGNI — but an unbounded `findMany` would materialize the whole table onto
 * every `/posts` render once volume arrives. This bounds it to the newest page's worth; cursor
 * pagination is the follow-up when real volume shows up. (SESSION_0495; Petey-ratified.)
 */
const FEED_TAKE = 100

export const findCommunityPosts = async (brand: Brand) => {
  const rows = await db.communityPost.findMany({
    where: { brand, status: "PUBLISHED" },
    select: communityPostManyPayload,
    orderBy: { createdAt: "desc" },
    take: FEED_TAKE,
  })

  return rows.map(toCommunityPostMany)
}

/**
 * Detail lookup. `includeHidden` is the ADMIN-ONLY escape hatch (moderators need to reach a hidden
 * post to unhide it); public callers MUST leave it false, which pins `status: PUBLISHED`.
 */
export const findCommunityPostBySlug = async (
  slug: string,
  brand: Brand,
  { includeHidden = false }: { includeHidden?: boolean } = {},
) => {
  const row = await db.communityPost.findFirst({
    where: { slug, brand, ...(includeHidden ? {} : { status: "PUBLISHED" as const }) },
    select: communityPostManyPayload,
  })

  return row ? toCommunityPostMany(row) : null
}

/** Approved styles for the create dialog's optional style select. */
export const findApprovedStyleOptions = async () => {
  return db.style.findMany({
    where: { status: "APPROVED" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}
