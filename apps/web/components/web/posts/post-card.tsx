"use client"

import { getReadTime } from "@dirstack/utils"
import Image from "next/image"
import { useFormatter, useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import type { Post } from "~/.generated/prisma/client"
import { ListingCard } from "~/components/web/listing/listing-card"

/**
 * PostCard — a thin adapter over `ListingCard` (doctrine §5; SESSION_0470). The blog hero uses the
 * `mediaTop` rich density (full-bleed image) and the `footer` slot for `date · read-time`, instead of
 * the default View+Save footer — same ONE catalog card, blog-tuned. No bespoke card markup.
 */
type PostCardProps = Omit<ComponentProps<typeof ListingCard>, "href" | "name"> & {
  post: Post
}

export const PostCard = ({ post, ...props }: PostCardProps) => {
  const t = useTranslations()
  const format = useFormatter()

  return (
    <ListingCard
      href={`/blog/${post.slug}`}
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
      tagline={post.description}
      footer={
        post.publishedAt ? (
          <>
            <time dateTime={post.publishedAt.toISOString()}>
              {format.dateTime(post.publishedAt, { dateStyle: "medium" })}
            </time>
            <span>
              {t("posts.read_time", { count: getReadTime(post.plainText || post.content) })}
            </span>
          </>
        ) : undefined
      }
      {...props}
    />
  )
}
