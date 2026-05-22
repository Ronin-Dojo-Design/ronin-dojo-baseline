"use client"

import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import { EmptyList } from "~/components/common/empty-list"
import { ContentPostCard } from "~/components/web/content-posts/content-post-card"
import { Grid } from "~/components/web/ui/grid"
import type { ContentPostMany } from "~/server/web/content-posts/payloads"

type ContentPostListProps = ComponentProps<typeof Grid> & {
  posts: ContentPostMany[]
}

export const ContentPostList = ({ posts, ...props }: ContentPostListProps) => {
  const t = useTranslations()

  return (
    <Grid {...props}>
      {posts.map(post => (
        <ContentPostCard key={post.id} post={post} />
      ))}

      {!posts.length && <EmptyList>{t("posts.no_posts")}</EmptyList>}
    </Grid>
  )
}
