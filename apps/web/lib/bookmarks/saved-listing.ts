import type { BookmarkSubjectTypeInput } from "~/server/web/bookmarks/schema"

/**
 * SavedListing — SESSION_0397 presentation shape for a single saved bookmark on the dashboard
 * "Saved" tab. Pure/normalized so every subject type (Tool / person-Passport / Organization /
 * Technique / Post / LineageTree) renders through the one shared `ListingCard`. The server mapper
 * (`server/web/bookmarks/saved.ts`) reads only already-public card fields per subject.
 */
export type SavedListingMedia = "favicon" | "avatar" | "none"

export type SavedListing = {
  /** Bookmark id — stable React key. */
  key: string
  subjectType: BookmarkSubjectTypeInput
  /** The subject's own id (toolId/passportId/organizationId/...) — drives the Save toggle. */
  subjectId: string
  href: string
  name: string
  tagline: string | null
  description: string | null
  imageUrl: string | null
  initials: string
  /** Media affordance: square favicon (tools), round avatar (people), or none. */
  media: SavedListingMedia
}
