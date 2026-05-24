"use client"

import Image from "next/image"
import { useFormatter } from "next-intl"
import type { ComponentProps } from "react"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardFooter, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import type { ContentPostMany } from "~/server/web/content-posts/payloads"

type ContentPostCardProps = ComponentProps<typeof Card> & {
  post: ContentPostMany
}

export const ContentPostCard = ({ post, ...props }: ContentPostCardProps) => {
  const format = useFormatter()
  const title = post.publicTitle ?? post.atom.title
  const postHref = `/posts/${post.publicSlug}`

  return (
    <Card className="overflow-clip" {...props}>
      {post.thumbnailUrl && (
        <Link href={postHref} className="-m-5 mb-0 block w-[calc(100%+2.5rem)] max-w-none">
          <Image
            src={post.thumbnailUrl}
            alt={title}
            width={1200}
            height={630}
            className="aspect-video w-full object-cover"
          />
        </Link>
      )}

      <CardHeader wrap={false}>
        <H4 render={props => <h3 {...props}>{props.children}</h3>} className="leading-snug!">
          <Link href={postHref}>{title}</Link>
        </H4>
      </CardHeader>

      {post.excerpt && (
        <Link href={postHref} className="block">
          <CardDescription>{post.excerpt}</CardDescription>
        </Link>
      )}

      {!!post.atom.tags.length && (
        <Stack size="sm" className="w-full" wrap>
          {post.atom.tags.map(tag => (
            <Badge
              key={tag.id}
              variant="outline"
              render={<Link href={`/posts?tag=${encodeURIComponent(tag.slug)}`} />}
            >
              {tag.name}
            </Badge>
          ))}
        </Stack>
      )}

      {post.publishDate && (
        <CardFooter className="mt-auto">
          <time dateTime={post.publishDate.toISOString()}>
            {format.dateTime(post.publishDate, { dateStyle: "medium" })}
          </time>
        </CardFooter>
      )}
    </Card>
  )
}
