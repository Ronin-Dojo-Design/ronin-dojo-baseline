"use client"

import Image from "next/image"
import { useFormatter } from "next-intl"
import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { CommunityPostAdminMenu } from "~/components/web/community/community-post-admin-menu"
import { CommunityPostFlair } from "~/components/web/community/community-post-flair"
import { CommunityShareMenu } from "~/components/web/community/community-share-menu"
import { ListingSaveButton } from "~/components/web/listing/listing-save-button"
import { Author } from "~/components/web/ui/author"
import type { CommunityPostMany } from "~/server/web/community/payloads"

/**
 * CommunityPostRow — LIST density for the community feed (SESSION_0493). Mirrors the editorial
 * `PostRow` composition (same L1 primitives: `Card` surface, `Badge`, `H4`, `Link`, `Author`) —
 * thumbnail left; flair + title + one-line excerpt + byline/meta right. NOT a new card system.
 */
type CommunityPostRowProps = {
  post: CommunityPostMany
  isAdmin?: boolean
}

export const CommunityPostRow = ({ post, isAdmin = false }: CommunityPostRowProps) => {
  const format = useFormatter()

  return (
    <Card isRevealed className="flex-row items-stretch gap-4 overflow-clip p-4">
      {post.imageUrl && (
        <Link
          href={`/posts/${post.slug}`}
          className="relative hidden aspect-video w-40 shrink-0 self-center overflow-clip rounded-md sm:block"
        >
          <Image src={post.imageUrl} alt={post.title} fill className="object-cover" sizes="160px" />
        </Link>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <CommunityPostFlair type={post.type} />

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

          <div className="flex shrink-0 items-center gap-1">
            <ListingSaveButton subjectType="COMMUNITY_POST" subjectId={post.id} showLabel={false} />
            <CommunityShareMenu slug={post.slug} title={post.title} text={post.excerpt} />
            {isAdmin && <CommunityPostAdminMenu postId={post.id} isHidden={post.isHidden} />}
          </div>
        </div>
      </div>
    </Card>
  )
}
