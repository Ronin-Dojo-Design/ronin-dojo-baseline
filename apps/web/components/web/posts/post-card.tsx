"use client"

import { getReadTime } from "@dirstack/utils"
import Image from "next/image"
import { useFormatter, useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import { ListingCard } from "~/components/web/listing/listing-card"
import { ListingSaveButton } from "~/components/web/listing/listing-save-button"
import type { PostMany } from "~/server/web/posts/payloads"

/**
 * PostCard — a thin adapter over `ListingCard` (doctrine §5; SESSION_0470). The blog hero uses the
 * `mediaTop` rich density (full-bleed image), the `categories` slot for flair badges (SESSION_0492) and
 * a custom `footer` slot: `date · read-time` on the left, the shared `ListingSaveButton` (subjectType
 * POST) on the right — same ONE catalog card, blog-tuned. No bespoke card markup.
 */
type PostCardProps = Omit<ComponentProps<typeof ListingCard>, "href" | "name" | "categories"> & {
  post: PostMany
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
      categories={post.categories}
      footer={
        <>
          <div className="flex items-center gap-2">
            {post.publishedAt && (
              <time dateTime={post.publishedAt.toISOString()}>
                {format.dateTime(post.publishedAt, { dateStyle: "medium" })}
              </time>
            )}
            <span>
              {t("posts.read_time", { count: getReadTime(post.plainText || post.content) })}
            </span>
          </div>

          <ListingSaveButton subjectType="POST" subjectId={post.id} showLabel={false} />
        </>
      }
      {...props}
    />
  )
}
