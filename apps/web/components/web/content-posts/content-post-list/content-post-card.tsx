"use client"

import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardFooter, CardHeader } from "~/components/common/card"
import { Link } from "~/components/common/link"
import { cx } from "~/lib/utils"
import { type ContentPostCardProps, POST_BODY_FONT } from "./content-post-feed-types"
import { PostAuthor, PostCardMedia, PostCardTitle, PostTagList } from "./content-post-parts"
import { usePostCardView } from "./use-post-card-view"

/** Grid-view post card (the eager, default-view layout). Mirrors the legacy BBL
 * technique-post card IA — media w/ a video affordance, title, author, tags,
 * discipline + date — on this app's primitives + brand tokens. */
export const ContentPostCard = ({ post, className }: ContentPostCardProps) => {
  const view = usePostCardView(post)

  return (
    <Card className={cx("overflow-clip", POST_BODY_FONT, className)}>
      <PostCardMedia
        href={view.postHref}
        src={view.thumbnailUrl}
        alt={view.title}
        hasVideo={view.hasVideo}
        className="-m-5 mb-0 aspect-video w-[calc(100%+2.5rem)] max-w-none"
      />

      <CardHeader wrap={false}>
        <PostCardTitle href={view.postHref} title={view.title} />
      </CardHeader>

      {view.excerpt && (
        <Link href={view.postHref} className="block">
          <CardDescription>{view.excerpt}</CardDescription>
        </Link>
      )}

      <PostAuthor author={view.author} />

      <PostTagList tags={view.tags} />

      <PostCardFooter
        discipline={view.discipline}
        dateTime={view.dateTime}
        dateLabel={view.dateLabel}
      />
    </Card>
  )
}

/** Bottom meta row: discipline pill (left) + publish date (right). */
function PostCardFooter({
  discipline,
  dateTime,
  dateLabel,
}: {
  discipline: { name: string } | null
  dateTime: string | undefined
  dateLabel: string | null
}) {
  const items = [
    discipline ? (
      <Badge key="discipline" variant="soft" size="sm">
        {discipline.name}
      </Badge>
    ) : null,
    dateLabel ? (
      <time key="date" className="ml-auto" dateTime={dateTime}>
        {dateLabel}
      </time>
    ) : null,
  ].filter(Boolean)

  if (!items.length) {
    return null
  }

  return <CardFooter className="mt-auto w-full">{items}</CardFooter>
}
