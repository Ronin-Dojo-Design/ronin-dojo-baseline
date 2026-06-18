"use client"

import dynamic from "next/dynamic"
import { Note } from "~/components/common/note"
import { Grid } from "~/components/web/ui/grid"
import type { ContentPostMany } from "~/server/web/content-posts/payloads"
import { ContentPostCard } from "./content-post-card"
import { ContentPostEmpty } from "./content-post-empty"
import { PostFeedToolbar } from "./post-feed-toolbar"
import { usePostFeedView } from "./use-post-feed-view"

// Lazy boundary (recipe step 3): the list-view branch — the rows container plus
// the `ContentPostRow` it imports — is `next/dynamic`'d. Grid is the eager
// default; the list JS only loads on the first toggle to list, and the branch
// unmounts when grid is reselected (genuine inactive-branch unmount, not a
// keep-mounted split).
const ContentPostRows = dynamic(() => import("./content-post-rows").then(m => m.ContentPostRows), {
  loading: () => <Note className="text-muted-foreground text-sm">Loading…</Note>,
})

type ContentPostListProps = {
  posts: ContentPostMany[]
  /** True when a tag filter is applied — drives the empty-state's "view all" CTA. */
  isFiltered?: boolean
}

/**
 * Public barrel + orchestrator for the `/posts` feed (the colocated folder
 * module's only export). Thin by design: owns the grid/list view state and
 * composes the toolbar, the eager grid, the lazy list, and the empty state. All
 * presentation lives in the sub-parts; all card brand-tokens are threaded by the
 * BBL-aware page wrapper (`brandFontVariables`).
 *
 * @see docs/runbooks/component-launch-sweep-recipe.md
 */
export const ContentPostList = ({ posts, isFiltered = false }: ContentPostListProps) => {
  const { view, setView } = usePostFeedView()

  if (!posts.length) {
    return <ContentPostEmpty isFiltered={isFiltered} />
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <PostFeedToolbar count={posts.length} view={view} onViewChange={setView} />

      {view === "grid" ? (
        <Grid>
          {posts.map(post => (
            <ContentPostCard key={post.id} post={post} />
          ))}
        </Grid>
      ) : (
        <ContentPostRows posts={posts} />
      )}
    </div>
  )
}
