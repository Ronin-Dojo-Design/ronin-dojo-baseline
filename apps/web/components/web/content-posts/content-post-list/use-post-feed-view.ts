import { useState } from "react"
import type { PostFeedView } from "./content-post-feed-types"

/**
 * Owns the feed's grid/list view state, keeping the toggle logic out of the
 * orchestrator's JSX (recipe step 1: logic in hooks). Grid is the eager default;
 * the list branch is lazy-loaded and unmounts when grid is active.
 */
export function usePostFeedView(initial: PostFeedView = "grid") {
  const [view, setView] = useState<PostFeedView>(initial)
  return { view, setView }
}
