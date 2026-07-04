import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getFormatter, getTranslations } from "next-intl/server"
import { cache } from "react"
import { Badge } from "~/components/common/badge"
import { Stack } from "~/components/common/stack"
import { CommunityPostActions } from "~/components/web/community/community-post-actions"
import { CommunityPostFlair } from "~/components/web/community/community-post-flair"
import { ExternalLink } from "~/components/web/external-link"
import { Markdown } from "~/components/web/markdown"
import { Author } from "~/components/web/ui/author"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { Brand } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { isAdmin } from "~/lib/authz"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { toVideoEmbedUrl } from "~/lib/video-embed"
import { findCommunityPostBySlug } from "~/server/web/community/queries"

export const dynamicParams = true

type Props = PageProps<"/posts/[slug]">

/**
 * Community post detail (SESSION_0493, ADR 0042 Amendment 1). HIDDEN posts 404 for everyone except
 * admins — the admin escape hatch exists so a moderator can reach the post to unhide it.
 */
const getData = cache(async ({ params }: Props) => {
  const { slug } = await params
  const session = await getServerSession()
  const viewerIsAdmin = isAdmin(session?.user)

  const post = await findCommunityPostBySlug(slug, Brand.BBL, { includeHidden: viewerIsAdmin })

  if (!post) {
    notFound()
  }

  const t = await getTranslations()
  const url = `/posts/${post.slug}`

  const data = await getPageData(url, post.title, post.excerpt, {
    breadcrumbs: [
      { url: "/posts", title: t("navigation.posts") },
      { url, title: post.title },
    ],
  })

  return { post, viewerIsAdmin, ...data }
})

export const generateMetadata = async (props: Props): Promise<Metadata> => {
  const { url, metadata } = await getData(props)
  return await getPageMetadata({ url, metadata })
}

export default async function (props: Props) {
  const { post, viewerIsAdmin, breadcrumbs } = await getData(props)
  const t = await getTranslations("community")
  const format = await getFormatter()
  const videoEmbedUrl = toVideoEmbedUrl(post.videoUrl)

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <Intro>
        <Stack size="sm">
          <CommunityPostFlair type={post.type} />

          {post.style && (
            <Badge variant="outline" size="sm">
              {post.style.name}
            </Badge>
          )}

          {post.isHidden && (
            <Badge variant="danger" size="sm">
              {t("hidden_badge")}
            </Badge>
          )}
        </Stack>

        <IntroTitle>{post.title}</IntroTitle>

        <Author
          prefix={t("posted_by")}
          name={post.authorName}
          image={post.authorImage}
          note={
            <time dateTime={post.createdAt.toISOString()}>
              {format.dateTime(post.createdAt, { dateStyle: "long" })}
            </time>
          }
          className="mt-4"
        />
      </Intro>

      <Section>
        <Section.Content>
          {post.imageUrl && (
            <Image
              src={post.imageUrl}
              alt={post.title}
              width={1200}
              height={630}
              priority
              sizes="(min-width: 768px) 66vw, 100vw"
              className="w-full h-auto aspect-video object-cover rounded-lg"
            />
          )}

          <Markdown code={post.content} />

          {/* YouTube/Vimeo links embed via the existing `toVideoEmbedUrl` seam (FI-007 precedent
              on the directory profile); anything else falls back to an external link. */}
          {videoEmbedUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-black">
              <iframe
                src={videoEmbedUrl}
                title={post.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          )}

          {post.videoUrl && !videoEmbedUrl && (
            <ExternalLink href={post.videoUrl} className="font-medium text-primary">
              {t("watch_video")}
            </ExternalLink>
          )}
        </Section.Content>

        <Section.Sidebar>
          <CommunityPostActions
            postId={post.id}
            slug={post.slug}
            title={post.title}
            text={post.excerpt}
            isHidden={post.isHidden}
            isAdmin={viewerIsAdmin}
            showSaveLabel
          />
        </Section.Sidebar>
      </Section>
    </>
  )
}
