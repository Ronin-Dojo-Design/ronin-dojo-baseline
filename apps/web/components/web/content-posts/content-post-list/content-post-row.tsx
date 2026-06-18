"use client"

import { Badge } from "~/components/common/badge"
import { Card, CardDescription } from "~/components/common/card"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"
import { type ContentPostCardProps, POST_BODY_FONT } from "./content-post-feed-types"
import { PostAuthor, PostCardMedia, PostCardTitle, PostTagList } from "./content-post-parts"
import { usePostCardView } from "./use-post-card-view"

/** List-view post row — the horizontal counterpart of `ContentPostCard`,
 * mirroring the legacy technique-post list layout. Lives behind the lazy list
 * branch (loaded only when the reader toggles to list view). */
export const ContentPostRow = ({ post, className }: ContentPostCardProps) => {
  const view = usePostCardView(post)

  return (
    <Card className={cx("w-full flex-row gap-4", POST_BODY_FONT, className)}>
      <PostCardMedia
        href={view.postHref}
        src={view.thumbnailUrl}
        alt={view.title}
        hasVideo={view.hasVideo}
        play="sm"
        width={320}
        height={180}
        className="hidden aspect-video w-40 shrink-0 self-start rounded-md sm:block"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <PostCardTitle href={view.postHref} title={view.title} className="text-lg!" />

        <PostRowMeta
          author={view.author}
          discipline={view.discipline}
          dateTime={view.dateTime}
          dateLabel={view.dateLabel}
        />

        {view.excerpt && <CardDescription>{view.excerpt}</CardDescription>}

        <PostTagList tags={view.tags} />
      </div>
    </Card>
  )
}

/** Inline meta line for the row: author + discipline + date. */
function PostRowMeta({
  author,
  discipline,
  dateTime,
  dateLabel,
}: {
  author: { name: string; image?: string | null } | null
  discipline: { name: string } | null
  dateTime: string | undefined
  dateLabel: string | null
}) {
  return (
    <Stack size="sm" className="text-muted-foreground text-sm" wrap>
      <PostAuthor author={author} />
      {discipline && (
        <Badge variant="soft" size="sm">
          {discipline.name}
        </Badge>
      )}
      {dateLabel && <time dateTime={dateTime}>{dateLabel}</time>}
    </Stack>
  )
}
