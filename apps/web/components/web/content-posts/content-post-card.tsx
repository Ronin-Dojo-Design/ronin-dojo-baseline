"use client"

import Image from "next/image"
import { useFormatter } from "next-intl"
import type { ComponentProps } from "react"
import { Card, CardDescription, CardFooter, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import type { ContentPostMany } from "~/server/web/content-posts/payloads"

type ContentPostCardProps = ComponentProps<typeof Card> & {
  post: ContentPostMany
}

export const ContentPostCard = ({ post, ...props }: ContentPostCardProps) => {
  const format = useFormatter()
  const title = post.publicTitle ?? post.atom.title

  return (
    <Card className="overflow-clip" render={<Link href={`/posts/${post.publicSlug}`} />} {...props}>
      {post.thumbnailUrl && (
        <Image
          src={post.thumbnailUrl}
          alt={title}
          width={1200}
          height={630}
          className="-m-5 mb-0 w-[calc(100%+2.5rem)] max-w-none aspect-video object-cover"
        />
      )}

      <CardHeader wrap={false}>
        <H4 render={props => <h3 {...props}>{props.children}</h3>} className="leading-snug!">
          {title}
        </H4>
      </CardHeader>

      {post.excerpt && <CardDescription>{post.excerpt}</CardDescription>}

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
