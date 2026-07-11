import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { PostCard } from "~/components/web/posts/post-card"
import { Grid } from "~/components/web/ui/grid"
import type { PostMany } from "~/server/web/posts/payloads"
import { BBL_ROUTES } from "../bbl-landing-content"
import { SectionHeading } from "./landing-chrome"

/**
 * Live staff-blog card gallery for the BBL landing (SESSION_0525 E3). Renders the most
 * recent published `Post`s — fetched by the orchestrator (`index.tsx`) via
 * `findPublishedPosts(Brand.BBL)` — directly below the community-feed CTA. Reuse-first:
 * the same `PostCard`/`ListingCard` the `/blog` feed uses, in the shared `Grid`.
 * Renders nothing when there are no published posts, so the landing degrades cleanly.
 */
export const BblBlogGallery = ({ posts }: { posts: PostMany[] }) => {
  if (!posts.length) return null
  const featured = posts.slice(0, 6)

  return (
    <section className="w-full space-y-8">
      <SectionHeading
        eyebrow="From the Blog"
        title="Stories from the Legacy"
        description="Promotions, history, and lineage news from the Black Belt Legacy network."
      />
      <Grid>
        {featured.map(post => (
          <PostCard key={post.slug} post={post} />
        ))}
      </Grid>
      <div className="w-full text-center">
        <Button size="lg" variant="secondary" render={<Link href={BBL_ROUTES.posts} />}>
          Read the Blog
        </Button>
      </div>
    </section>
  )
}
