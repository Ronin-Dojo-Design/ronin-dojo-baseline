import type { Post } from "content-collections"
import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import { EmptyList } from "~/components/web/empty-list"
import { PostCard } from "~/components/web/posts/post-card"
import { Grid } from "~/components/web/ui/grid"

type PostListProps = ComponentProps<typeof Grid> & {
  posts: Post[]
}

export const PostList = ({ posts, ...props }: PostListProps) => {
  const t = useTranslations()

  return (
    <Grid {...props}>
      {posts.map(post => (
        <PostCard key={post._meta.path} post={post} />
      ))}

      {!posts.length && <EmptyList>{t("posts.no_posts")}</EmptyList>}
    </Grid>
  )
}
