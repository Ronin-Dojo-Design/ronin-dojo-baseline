import { PlayIcon } from "lucide-react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"
import { POST_HEADING_FONT } from "./content-post-feed-types"

/**
 * Shared presentational atoms for the grid card and list row. Each is a small,
 * null-safe piece (the bjj-passport-card "file-local pieces" pattern, lifted to
 * the folder so both layouts consume one definition instead of copy-pasting).
 */

type Tag = { id: string; name: string; slug: string }

const PLAY_SIZE = {
  lg: { badge: "size-12", icon: "size-5" },
  sm: { badge: "size-9", icon: "size-4" },
} as const

/** Full-bleed (card) or contained (row) post thumbnail with a play affordance
 * when the post carries a video. Renders nothing when there's no thumbnail. */
export const PostCardMedia = ({
  href,
  src,
  alt,
  hasVideo,
  className,
  width = 1200,
  height = 630,
  play = "lg",
}: {
  href: string
  src: string | null
  alt: string
  hasVideo: boolean
  className?: string
  width?: number
  height?: number
  play?: keyof typeof PLAY_SIZE
}) => {
  if (!src) {
    return null
  }

  return (
    <Link href={href} className={cx("relative block overflow-clip bg-muted", className)}>
      <Image src={src} alt={alt} width={width} height={height} className="size-full object-cover" />
      {hasVideo && (
        <span aria-hidden className="absolute inset-0 flex items-center justify-center">
          <span
            className={cx(
              "flex items-center justify-center rounded-full bg-primary/90 text-background shadow-lg",
              PLAY_SIZE[play].badge,
            )}
          >
            <PlayIcon className={cx("translate-x-px fill-current", PLAY_SIZE[play].icon)} />
          </span>
        </span>
      )}
    </Link>
  )
}

/** Linked post heading, threading the BBL heading token. */
export const PostCardTitle = ({
  href,
  title,
  className,
}: {
  href: string
  title: string
  className?: string
}) => (
  <H4
    render={headingProps => <h3 {...headingProps}>{headingProps.children}</h3>}
    className={cx("leading-snug!", POST_HEADING_FONT, className)}
  >
    <Link href={href}>{title}</Link>
  </H4>
)

/** Author avatar + name chip. Null-safe — renders nothing without an author. */
export const PostAuthor = ({
  author,
  className,
}: {
  author: { name: string; image?: string | null } | null
  className?: string
}) => {
  if (!author) {
    return null
  }

  return (
    <Stack size="sm" wrap={false} className={cx("min-w-0", className)}>
      <Avatar className="size-6 rounded-full">
        {author.image && <AvatarImage src={author.image} alt={author.name} />}
        <AvatarFallback className="text-2xs">
          {author.name.slice(0, 1).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="truncate text-secondary-foreground text-sm">{author.name}</span>
    </Stack>
  )
}

/** Tag chips that link back into the feed's tag filter. Null-safe. */
export const PostTagList = ({ tags }: { tags: Tag[] }) => {
  if (!tags.length) {
    return null
  }

  return (
    <Stack size="sm" className="w-full" wrap>
      {tags.map(tag => (
        <Badge
          key={tag.id}
          variant="outline"
          render={<Link href={`/posts?tag=${encodeURIComponent(tag.slug)}`} />}
        >
          {tag.name}
        </Badge>
      ))}
    </Stack>
  )
}
