"use client"

import type { ComponentProps } from "react"
import { ListingSaveButton } from "~/components/web/listing/listing-save-button"

/**
 * ListingBookmarkButton — the tool Save button. SESSION_0397 folded it into a thin adapter over the
 * generic `ListingSaveButton` (subjectType TOOL), mirroring how `ToolCard` became an adapter over
 * `ListingCard` (ADR 0028). Renders byte-identical and persists through the same polymorphic Bookmark
 * path, so the live tool directory is unchanged while the duplicate button + tool-only actions retire.
 */
type ListingBookmarkButtonProps = Omit<
  ComponentProps<typeof ListingSaveButton>,
  "subjectType" | "subjectId"
> & {
  toolId: string
}

export const ListingBookmarkButton = ({ toolId, ...props }: ListingBookmarkButtonProps) => {
  return <ListingSaveButton subjectType="TOOL" subjectId={toolId} {...props} />
}
