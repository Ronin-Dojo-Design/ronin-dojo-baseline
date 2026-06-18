"use client"

import type { ContentPostMany } from "~/server/web/content-posts/payloads"
import { ContentPostRow } from "./content-post-row"

/** Maps the feed into the list layout. This module is the single `next/dynamic`
 * boundary for list view — it (and the `ContentPostRow` it pulls in) only loads
 * when the reader switches away from the default grid, and unmounts on switch
 * back, so grid-only sessions never pay for the list-view JS. */
export const ContentPostRows = ({ posts }: { posts: ContentPostMany[] }) => {
  return (
    <div className="flex w-full flex-col gap-4">
      {posts.map(post => (
        <ContentPostRow key={post.id} post={post} />
      ))}
    </div>
  )
}
