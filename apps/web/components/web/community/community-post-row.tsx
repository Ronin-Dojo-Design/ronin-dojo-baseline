"use client"

import { PlayIcon } from "lucide-react"
import Image from "next/image"
import { useFormatter } from "next-intl"
import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { CommunityPostActions } from "~/components/web/community/community-post-actions"
import { CommunityPostFlair } from "~/components/web/community/community-post-flair"
import {
  CommunityPremiumBadge,
  CommunityUnlockButton,
} from "~/components/web/community/community-premium"
import { Author } from "~/components/web/ui/author"
import { toVideoThumbnailUrl } from "~/lib/video-embed"
import type { CommunityPostView } from "~/server/web/community/post-gate"

/**
 * CommunityPostRow — LIST density for the community feed (SESSION_0493). Mirrors the editorial
 * `PostRow` composition (same L1 primitives: `Card` surface, `Badge`, `H4`, `Link`, `Author`).
 *
 * FI-028b: branches on the gated `CommunityPostView`. A LOCKED premium post drops the thumbnail (its
 * view carries no image), adds a lock badge + an "Unlock with Premium" CTA in place of the save/share
 * actions; an UNLOCKED premium post gains a "Premium" badge.
 */
type CommunityPostRowProps = {
  view: CommunityPostView
  isAdmin?: boolean
  /** Server-batched saved-state (D6). `undefined` → the Save button self-checks on mount. */
  initialSaved?: boolean
}

export const CommunityPostRow = ({
  view,
  isAdmin = false,
  initialSaved,
}: CommunityPostRowProps) => {
  const format = useFormatter()
  const post = view.post
  const locked = view.locked

  // List-density media parity with the grid card (SESSION_0557 Desi P2): a video-first post
  // without an uploaded image gets the provider thumbnail here too — the density toggle no longer
  // silently drops the post's media. YouTube only (Vimeo has no static thumbnail URL).
  const media = view.locked ? null : view.post
  const thumbnailUrl = media ? (media.imageUrl ?? toVideoThumbnailUrl(media.videoUrl)) : null
  const isVideoThumbnail = !!media && !media.imageUrl && !!thumbnailUrl

  return (
    <Card isRevealed className="flex-row items-stretch gap-4 overflow-clip p-4">
      {thumbnailUrl && (
        <Link
          href={`/posts/${post.slug}`}
          className="relative hidden aspect-video w-40 shrink-0 self-center overflow-clip rounded-md sm:block"
        >
          <Image
            src={thumbnailUrl}
            alt={post.title}
            fill
            className="object-cover"
            sizes="160px"
          />
          {/* Play glyph — decorative (the link carries the semantics); literal black/white scrim,
              the video-overlay convention on any theme (mirrors the grid card at row scale). */}
          {isVideoThumbnail && (
            <span aria-hidden className="absolute inset-0 grid place-items-center">
              <span className="grid size-8 place-items-center rounded-full bg-black/60 text-white">
                <PlayIcon className="size-3.5 fill-current" />
              </span>
            </span>
          )}
        </Link>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <CommunityPostFlair type={post.type} />

          {post.isPremium && <CommunityPremiumBadge />}

          {post.style && (
            <Badge variant="outline" size="sm">
              {post.style.name}
            </Badge>
          )}
        </div>

        <H4
          render={props => <h3 {...props}>{props.children}</h3>}
          className="min-w-0 truncate text-nowrap"
        >
          <Link href={`/posts/${post.slug}`}>{post.title}</Link>
        </H4>

        {post.excerpt && (
          <p className="line-clamp-1 text-sm/normal text-secondary-foreground text-pretty">
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <Author
            name={post.authorName}
            image={post.authorImage}
            note={
              <time dateTime={post.createdAt.toISOString()}>
                {format.dateTime(post.createdAt, { dateStyle: "medium" })}
              </time>
            }
            className="min-w-0"
          />

          {locked ? (
            <CommunityUnlockButton />
          ) : (
            <CommunityPostActions
              postId={post.id}
              slug={post.slug}
              title={post.title}
              text={post.excerpt}
              isHidden={post.isHidden}
              isAdmin={isAdmin}
              initialSaved={initialSaved}
            />
          )}
        </div>
      </div>
    </Card>
  )
}
