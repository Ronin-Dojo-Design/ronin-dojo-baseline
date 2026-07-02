"use client"

import { LayoutGridIcon, ListIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { EmptyList } from "~/components/common/empty-list"
import { PostCard } from "~/components/web/posts/post-card"
import { PostRow } from "~/components/web/posts/post-row"
import { Grid } from "~/components/web/ui/grid"
import { Sticky } from "~/components/web/ui/sticky"
import { cx } from "~/lib/utils"
import type { PostMany } from "~/server/web/posts/payloads"

/**
 * PostFeed — the blog feed re-skin (SESSION_0492). Editorial-only adoption of the legacy BBLApp posts
 * feed LAYOUT (Reddit/YouTube-inspired: flair tabs + grid/list toggle in a sticky bar) over the existing
 * published `Post` articles. NO community mechanics (no votes, comments, create-post). Presentation only.
 *
 * Reuse-first: grid density = the existing `PostCard`/`ListingCard`; list density = `PostRow` (composes
 * the same L1 primitives). Flair tabs derive from the posts' `categories` — client-side filter, no query
 * change. Tokens-only, so it inherits the active theme (light by default; dark under system preference).
 */
type PostFeedProps = {
  posts: PostMany[]
}

const ALL = "all" as const
type View = "grid" | "list"

export const PostFeed = ({ posts }: PostFeedProps) => {
  const t = useTranslations()
  const [view, setView] = useState<View>("grid")
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

  const tabClassName = (active: boolean) =>
    cx(
      "inline-flex items-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      active
        ? "bg-primary text-primary-foreground"
        : "text-secondary-foreground hover:bg-muted hover:text-foreground",
    )

  const toggleClassName = (active: boolean) =>
    cx(
      "inline-flex items-center justify-center rounded-md p-1.5 transition-colors",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      active
        ? "bg-background text-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground",
    )

  return (
    <div className="flex w-full flex-col gap-6">
      <Sticky isOverlay className="border-b bg-background/80 backdrop-blur">
        <div className="flex items-center justify-between gap-4 py-3">
          {/* Flair tabs — "All" + one pill per distinct category. Only "All" when there are none. */}
          <div
            className="-mx-1 flex items-center gap-1 overflow-x-auto px-1"
            role="tablist"
            aria-label={t("posts.filter_by_flair")}
          >
            <button
              type="button"
              role="tab"
              aria-selected={flair === ALL}
              onClick={() => setFlair(ALL)}
              className={tabClassName(flair === ALL)}
            >
              {t("posts.flair_all")}
            </button>

            {flairs.map(({ slug, name }) => (
              <button
                key={slug}
                type="button"
                role="tab"
                aria-selected={flair === slug}
                onClick={() => setFlair(slug)}
                className={tabClassName(flair === slug)}
              >
                {name}
              </button>
            ))}
          </div>

          {/* Grid / list view toggle. */}
          <div className="flex shrink-0 items-center gap-1 rounded-lg border bg-muted p-1">
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
              aria-label={t("posts.grid_view")}
              className={toggleClassName(view === "grid")}
            >
              <LayoutGridIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              aria-label={t("posts.list_view")}
              className={toggleClassName(view === "list")}
            >
              <ListIcon className="size-4" />
            </button>
          </div>
        </div>
      </Sticky>

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
