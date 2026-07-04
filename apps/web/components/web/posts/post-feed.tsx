"use client"

import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { EmptyList } from "~/components/common/empty-list"
import { PostCard } from "~/components/web/posts/post-card"
import { PostRow } from "~/components/web/posts/post-row"
import {
  FeedFilterBar,
  type FeedFilterTab,
  type FeedView,
} from "~/components/web/ui/feed-filter-bar"
import { Grid } from "~/components/web/ui/grid"
import type { PostMany } from "~/server/web/posts/payloads"

/**
 * PostFeed — the blog feed re-skin (SESSION_0492). Editorial-only adoption of the legacy BBLApp posts
 * feed LAYOUT (Reddit/YouTube-inspired: flair tabs + grid/list toggle in a sticky bar) over the existing
 * published `Post` articles. NO community mechanics (no votes, comments, create-post). Presentation only.
 *
 * Reuse-first: grid density = the existing `PostCard`/`ListingCard`; list density = `PostRow` (composes
 * the same L1 primitives). Flair tabs derive from the posts' `categories` — client-side filter, no query
 * change. SESSION_0495 C2-1: the sticky bar is now the shared `FeedFilterBar` (deduped with
 * `CommunityFeed`), so `/blog` inherits the C1 mobile fixes for free.
 */
type PostFeedProps = {
  posts: PostMany[]
}

const ALL = "all" as const

export const PostFeed = ({ posts }: PostFeedProps) => {
  const t = useTranslations()
  const [view, setView] = useState<FeedView>("grid")
  const [flair, setFlair] = useState<string>(ALL)

  // Distinct flairs (categories) across the feed, ordered by first appearance. Falsy-safe: with zero
  // categories (the current single-post state) this is empty → only the "All" tab renders.
  const flairs = useMemo(() => {
    const seen = new Map<string, string>()
    for (const post of posts) {
      for (const category of post.categories) {
        if (category.slug && !seen.has(category.slug)) seen.set(category.slug, category.name)
      }
    }
    return [...seen.entries()].map(([slug, name]) => ({ slug, name }))
  }, [posts])

  const filtered = useMemo(() => {
    if (flair === ALL) return posts
    return posts.filter(post => post.categories.some(category => category.slug === flair))
  }, [posts, flair])

  const tabs: FeedFilterTab[] = [
    { value: ALL, label: t("posts.flair_all") },
    ...flairs.map(({ slug, name }) => ({ value: slug, label: name })),
  ]

  return (
    <div className="flex w-full flex-col gap-6">
      <FeedFilterBar
        tabs={tabs}
        activeTab={flair}
        onTabChange={setFlair}
        tablistLabel={t("posts.filter_by_flair")}
        view={view}
        onViewChange={setView}
        gridViewLabel={t("posts.grid_view")}
        listViewLabel={t("posts.list_view")}
      />

      {!filtered.length && <EmptyList>{t("posts.no_posts")}</EmptyList>}

      {!!filtered.length &&
        (view === "grid" ? (
          <Grid>
            {filtered.map(post => (
              <PostCard key={post.slug} post={post} />
            ))}
          </Grid>
        ) : (
          <div className="flex w-full flex-col gap-4">
            {filtered.map(post => (
              <PostRow key={post.slug} post={post} />
            ))}
          </div>
        ))}
    </div>
  )
}
