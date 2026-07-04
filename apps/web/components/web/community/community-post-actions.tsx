"use client"

import { CommunityPostAdminMenu } from "~/components/web/community/community-post-admin-menu"
import { CommunityShareMenu } from "~/components/web/community/community-share-menu"
import { ListingSaveButton } from "~/components/web/listing/listing-save-button"

/**
 * CommunityPostActions — the Save / Share / (admin) Moderate control cluster for a community post
 * (SESSION_0495 C1-5). Extracted from the verbatim trio that `community-post-card`, `community-post-row`,
 * and the post detail page each pasted. ONE site = the vote-readiness move: the phase-2 vote control
 * (ADR 0042 Amendment 1) lands here once and appears on every surface, instead of a fourth paste.
 *
 * `showSaveLabel` matches the two densities: the grid card + list row show the icon only (space); the
 * detail sidebar shows the "Save" label. Admin moderation only mounts for an admin viewer.
 */
type CommunityPostActionsProps = {
  postId: string
  slug: string
  title: string
  /** Short teaser for native-share / email bodies. */
  text?: string
  isHidden?: boolean
  isAdmin?: boolean
  /** Show the "Save" text (detail sidebar) vs icon-only (feed card/row). */
  showSaveLabel?: boolean
  /**
   * Server-batched saved-state (D6). Passed straight to `ListingSaveButton`: a boolean skips the
   * per-mount `checkBookmarkSubject`; `undefined` (the default) keeps the self-check (the detail
   * page, which renders a single post, has no batch and stays on the self-check).
   */
  initialSaved?: boolean
}

export const CommunityPostActions = ({
  postId,
  slug,
  title,
  text,
  isHidden = false,
  isAdmin = false,
  showSaveLabel = false,
  initialSaved,
}: CommunityPostActionsProps) => {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <ListingSaveButton
        subjectType="COMMUNITY_POST"
        subjectId={postId}
        showLabel={showSaveLabel}
        initialSaved={initialSaved}
      />
      <CommunityShareMenu slug={slug} title={title} text={text} />
      {isAdmin && <CommunityPostAdminMenu postId={postId} isHidden={isHidden} />}
    </div>
  )
}
