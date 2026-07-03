"use client"

import Image from "next/image"
import { useFormatter } from "next-intl"
import { Badge } from "~/components/common/badge"
import { CommunityPostAdminMenu } from "~/components/web/community/community-post-admin-menu"
import { CommunityPostFlair } from "~/components/web/community/community-post-flair"
import { CommunityShareMenu } from "~/components/web/community/community-share-menu"
import { ListingCard } from "~/components/web/listing/listing-card"
import { ListingSaveButton } from "~/components/web/listing/listing-save-button"
import { Author } from "~/components/web/ui/author"
import type { CommunityPostMany } from "~/server/web/community/payloads"

/**
 * CommunityPostCard — GRID density for the community feed (SESSION_0493). A thin adapter over the
 * ONE catalog `ListingCard` (doctrine §5), mirroring the editorial `PostCard`: `mediaTop` rich
 * density when an image exists, type flair in `headerBadges`, server-derived excerpt as `tagline`,
 * style as an outline `statusBadges` chip, and a custom footer — author + date left; save / share /
 * (admin) moderation right. NO vote controls (locked MVP cut — absent, not grayed).
 */
type CommunityPostCardProps = {
  post: CommunityPostMany
  isAdmin?: boolean
}

export const CommunityPostCard = ({ post, isAdmin = false }: CommunityPostCardProps) => {
  const format = useFormatter()

  return (
    <ListingCard
      href={`/posts/${post.slug}`}
      name={post.title}
      mediaTop={
        post.imageUrl ? (
          <Image
            src={post.imageUrl}
            alt={post.title}
            width={1200}
            height={630}
            className="aspect-video w-full object-cover"
          />
        ) : undefined
      }
      headerBadges={<CommunityPostFlair type={post.type} className="ml-auto shrink-0" />}
      tagline={post.excerpt}
      statusBadges={
        post.style ? (
          <Badge variant="outline" size="sm" className="self-start">
            {post.style.name}
          </Badge>
        ) : undefined
      }
      footer={
        <>
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

          <div className="flex shrink-0 items-center gap-1">
            <ListingSaveButton subjectType="COMMUNITY_POST" subjectId={post.id} showLabel={false} />
            <CommunityShareMenu slug={post.slug} title={post.title} text={post.excerpt} />
            {isAdmin && <CommunityPostAdminMenu postId={post.id} isHidden={post.isHidden} />}
          </div>
        </>
      }
    />
  )
}
