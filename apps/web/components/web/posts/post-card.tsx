"use client"

import { getReadTime } from "@primoui/utils"
import type { Post } from "content-collections"
import Image from "next/image"
import { useFormatter, useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import { Card, CardDescription, CardFooter, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"

type PostCardProps = ComponentProps<typeof Card> & {
  post: Post
}

export const PostCard = ({ className, post, ...props }: PostCardProps) => {
  const t = useTranslations()
  const format = useFormatter()

  return (
    <Card className="overflow-clip" asChild {...props}>
      <Link href={`/blog/${post._meta.path}`}>
        {post.image && (
          <Image
            src={post.image}
            alt={post.title}
            width={1200}
            height={630}
            className="-m-5 mb-0 w-[calc(100%+2.5rem)] max-w-none aspect-video object-cover"
          />
        )}

        <CardHeader wrap={false}>
          <H4 as="h3" className="leading-snug!">
            {post.title}
          </H4>
        </CardHeader>

        {post.description && <CardDescription>{post.description}</CardDescription>}

        {post.publishedAt && (
          <CardFooter className="mt-auto">
            <time dateTime={post.publishedAt.toISOString()}>
              {format.dateTime(post.publishedAt, { dateStyle: "medium" })}
            </time>
            <span>&bull;</span>
            <span>{t("posts.read_time", { count: getReadTime(post.content) })}</span>
          </CardFooter>
        )}
      </Link>
    </Card>
  )
}
