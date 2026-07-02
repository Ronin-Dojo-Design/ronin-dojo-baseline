"use client"

import { getReadTime } from "@dirstack/utils"
import Image from "next/image"
import { useFormatter, useTranslations } from "next-intl"
import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { ListingSaveButton } from "~/components/web/listing/listing-save-button"
import { Author } from "~/components/web/ui/author"
import type { PostMany } from "~/server/web/posts/payloads"

/**
 * PostRow — the LIST-view density for the blog feed (SESSION_0492). NOT a new card system: it composes
 * the same L1 primitives the grid card uses (`Card` surface, `Author`, `Badge`, `Link`) into a compact
 * horizontal row — thumbnail left; flair badge + title + one-line excerpt + byline + meta right. The
 * grid density stays `PostCard`/`ListingCard`; this is the toggle's alternate layout, tokens-only so it
 * inherits the active theme (light by default, dark under system preference).
 */
type PostRowProps = {
  post: PostMany
}

export const PostRow = ({ post }: PostRowProps) => {
  const t = useTranslations()
  const format = useFormatter()

  const flair = post.categories.at(0)
  const readTime = getReadTime(post.plainText || post.content)

  return (
    <Card isRevealed className="flex-row items-stretch gap-4 overflow-clip p-4">
      {post.imageUrl && (
        <Link
          href={`/blog/${post.slug}`}
          className="relative hidden aspect-video w-40 shrink-0 self-center overflow-clip rounded-md sm:block"
        >
          <Image src={post.imageUrl} alt={post.title} fill className="object-cover" sizes="160px" />
        </Link>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {flair && (
          <Badge variant="outline" size="sm" className="self-start">
            {flair.name}
          </Badge>
        )}

        <H4
          render={props => <h3 {...props}>{props.children}</h3>}
          className="min-w-0 truncate text-nowrap"
        >
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </H4>

        {post.description && (
          <p className="line-clamp-1 text-sm/normal text-secondary-foreground text-pretty">
            {post.description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          {post.author?.name && (
            <Author name={post.author.name} image={post.author.image} className="min-w-0" />
          )}

          <div className="flex shrink-0 items-center gap-3">
            {post.publishedAt && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <time dateTime={post.publishedAt.toISOString()}>
                  {format.dateTime(post.publishedAt, { dateStyle: "medium" })}
                </time>
                <span aria-hidden>·</span>
                <span>{t("posts.read_time", { count: readTime })}</span>
              </div>
            )}

            <ListingSaveButton subjectType="POST" subjectId={post.id} showLabel={false} />
          </div>
        </div>
      </div>
    </Card>
  )
}
