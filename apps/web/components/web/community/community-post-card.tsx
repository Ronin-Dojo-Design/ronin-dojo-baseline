"use client"

import { LockKeyholeIcon, PlayIcon } from "lucide-react"
import Image from "next/image"
import { useFormatter, useTranslations } from "next-intl"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { CommunityPostActions } from "~/components/web/community/community-post-actions"
import { CommunityPostFlair } from "~/components/web/community/community-post-flair"
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

/** The paid-tier upgrade funnel — the same route the composer/technique upgrade CTAs link to. */
const UPGRADE_HREF = "/lineage/join"

export const CommunityPostCard = ({
  view,
  isAdmin = false,
  initialSaved,
}: CommunityPostCardProps) => {
  const format = useFormatter()
  const t = useTranslations("community")
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
            <Badge variant="warning" size="sm" prefix={<LockKeyholeIcon />}>
              {t("premium_badge")}
            </Badge>
          </div>
        }
        tagline={post.excerpt}
        statusBadges={styleBadge}
        footer={
          <>
            {authorFooter}
            {/* Cards/rows use a `secondary` Unlock CTA (the detail panel uses `primary`) — a
                deliberate funnel-weight hierarchy: the detail is the conversion surface. */}
            <Button
              size="sm"
              variant="secondary"
              prefix={<LockKeyholeIcon />}
              render={<Link href={UPGRADE_HREF} />}
            >
              {t("unlock_cta")}
            </Button>
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
          {post.isPremium && (
            <Badge variant="warning" size="sm" prefix={<LockKeyholeIcon />}>
              {t("premium_badge")}
            </Badge>
          )}
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
