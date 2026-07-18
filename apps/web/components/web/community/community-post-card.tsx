"use client"

import { PlayIcon } from "lucide-react"
import Image from "next/image"
import { useFormatter } from "next-intl"
import { Badge } from "~/components/common/badge"
import { CommunityPostActions } from "~/components/web/community/community-post-actions"
import { CommunityPostFlair } from "~/components/web/community/community-post-flair"
import {
  CommunityPremiumBadge,
  CommunityUnlockButton,
} from "~/components/web/community/community-premium"
import { ListingCard } from "~/components/web/listing/listing-card"
import { Author } from "~/components/web/ui/author"
import { toVideoThumbnailUrl } from "~/lib/video-embed"
import type { CommunityPostView } from "~/server/web/community/post-gate"

/**
 * CommunityPostCard — GRID density for the community feed (SESSION_0493). A thin adapter over the
 * ONE catalog `ListingCard` (doctrine §5), mirroring the editorial `PostCard`.
 *
 * FI-028b: the card takes a gated `CommunityPostView` and branches on `view.locked`. An UNLOCKED post
 * renders as before (plus a "Premium" badge when premium); a LOCKED premium post renders a teaser —
 * title + flair + excerpt + author + a lock badge + an "Unlock with Premium" CTA — with NO media
 * (the locked view's type has no image/video field at all; the no-leak strip happens server-side).
 */
type CommunityPostCardProps = {
  view: CommunityPostView
  isAdmin?: boolean
  /** Server-batched saved-state (D6). `undefined` → the Save button self-checks on mount. */
  initialSaved?: boolean
}

export const CommunityPostCard = ({
  view,
  isAdmin = false,
  initialSaved,
}: CommunityPostCardProps) => {
  const format = useFormatter()
  const post = view.post

  const authorFooter = (
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
  )

  const styleBadge = post.style ? (
    <Badge variant="outline" size="sm" className="self-start">
      {post.style.name}
    </Badge>
  ) : undefined

  if (view.locked) {
    // Teaser: no `mediaTop` (the locked view carries no image/video), a lock badge beside the flair,
    // and an "Unlock with Premium" CTA. The card link + View still point at the detail (also a teaser).
    return (
      <ListingCard
        href={`/posts/${post.slug}`}
        name={post.title}
        headerBadges={
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <CommunityPostFlair type={post.type} />
            <CommunityPremiumBadge />
          </div>
        }
        tagline={post.excerpt}
        statusBadges={styleBadge}
        footer={
          <>
            {authorFooter}
            <CommunityUnlockButton />
          </>
        }
      />
    )
  }

  // Unlocked (`view.post` narrows to the full shape here — carries the media fields). Video-first
  // posts without an uploaded image get the provider thumbnail as card media (Desi P1 — techniques
  // are video-first). YouTube only; Vimeo has no static thumbnail URL.
  const media = view.post
  const videoThumbnailUrl = media.imageUrl ? null : toVideoThumbnailUrl(media.videoUrl)

  const mediaTop = media.imageUrl ? (
    <Image
      src={media.imageUrl}
      alt={post.title}
      width={1200}
      height={630}
      // Grid slot is ~1/3 viewport on desktop — without `sizes` the 2400w retina candidate ships
      // to a ~400px slot (SESSION_0557 Desi P3; the row already passes `sizes="160px"`).
      sizes="(max-width: 640px) 100vw, 33vw"
      className="aspect-video w-full object-cover"
    />
  ) : videoThumbnailUrl ? (
    <div className="relative">
      <Image
        src={videoThumbnailUrl}
        alt={post.title}
        width={480}
        height={360}
        className="aspect-video w-full object-cover"
      />
      {/* Play glyph — decorative (the card link carries the semantics); the scrim is
          intentionally literal black/white, the video-overlay convention on any theme. */}
      <span aria-hidden className="absolute inset-0 grid place-items-center">
        <span className="grid size-12 place-items-center rounded-full bg-black/60 text-white">
          <PlayIcon className="size-5 fill-current" />
        </span>
      </span>
    </div>
  ) : undefined

  return (
    <ListingCard
      href={`/posts/${post.slug}`}
      name={post.title}
      mediaTop={mediaTop}
      headerBadges={
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <CommunityPostFlair type={post.type} />
          {post.isPremium && <CommunityPremiumBadge />}
        </div>
      }
      tagline={post.excerpt}
      statusBadges={styleBadge}
      footer={
        <>
          {authorFooter}

          <CommunityPostActions
            postId={post.id}
            slug={post.slug}
            title={post.title}
            text={post.excerpt}
            isHidden={post.isHidden}
            isAdmin={isAdmin}
            initialSaved={initialSaved}
          />
        </>
      }
    />
  )
}
