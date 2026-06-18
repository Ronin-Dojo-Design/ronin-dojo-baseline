import type { ContentPostMany } from "~/server/web/content-posts/payloads"

/** The two presentation layouts the feed toggles between (grid is the default). */
export type PostFeedView = "grid" | "list"

/** Brand type-seam classes (recipe step 2): a card consumes the BBL font tokens,
 * degrading to the app font when no BBL ancestor defines them. The consumer page
 * provides the tokens via `brandFontVariables`. */
export const POST_HEADING_FONT = "[font-family:var(--font-bbl-heading,var(--font-display))]!"
export const POST_BODY_FONT = "[font-family:var(--font-bbl-body,var(--font-sans))]"

export type ContentPostCardProps = {
  post: ContentPostMany
  className?: string
}
