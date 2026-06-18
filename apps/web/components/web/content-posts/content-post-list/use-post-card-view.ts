import { useFormatter } from "next-intl"
import type { ContentPostMany } from "~/server/web/content-posts/payloads"

/**
 * Single derivation seam for both the grid card and the list row (recipe step 1:
 * logic out of JSX, shared so the two layouts never copy-paste their setup).
 * Returns only already-on-the-wire fields plus a pre-formatted date.
 */
export function usePostCardView(post: ContentPostMany) {
  const format = useFormatter()

  return {
    title: post.publicTitle ?? post.atom.title,
    postHref: `/posts/${post.publicSlug}`,
    author: post.atom.createdBy,
    discipline: post.atom.discipline,
    tags: post.atom.tags,
    thumbnailUrl: post.thumbnailUrl,
    hasVideo: !!post.videoUrl,
    excerpt: post.excerpt,
    dateTime: post.publishDate ? post.publishDate.toISOString() : undefined,
    dateLabel: post.publishDate ? format.dateTime(post.publishDate, { dateStyle: "medium" }) : null,
  }
}
