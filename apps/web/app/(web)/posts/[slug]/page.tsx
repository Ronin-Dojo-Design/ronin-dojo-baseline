import { getReadTime } from "@dirstack/utils"
import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { notFound } from "next/navigation"
import { getFormatter, getTranslations } from "next-intl/server"
import { cache, Suspense } from "react"
import Markdown from "react-markdown"
import { Link } from "~/components/common/link"
import { Prose } from "~/components/common/prose"
import { Stack } from "~/components/common/stack"
import { AdCard, AdCardSkeleton } from "~/components/web/ads/ad-card"
import { Nav } from "~/components/web/nav"
import { StructuredData } from "~/components/web/structured-data"
import { TableOfContents } from "~/components/web/table-of-contents"
import { Author } from "~/components/web/ui/author"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Favicon } from "~/components/web/ui/favicon"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { Tag } from "~/components/web/ui/tag"
import { getRequestBrand } from "~/lib/brand-context"
import { brandFontVariables } from "~/lib/fonts"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { generateArticle } from "~/lib/structured-data"
import { cx } from "~/lib/utils"
import { findPublishedContentPostBySlug } from "~/server/web/content-posts/queries"

export const dynamicParams = true

// Lazy boundary (recipe step 3): the media carousel pulls in Embla. It is only
// mounted when the post actually carries media (see `hasMedia` below), so
// text-only posts never request the carousel chunk; media posts code-split it
// behind a same-aspect skeleton to hold layout.
const ContentPostMediaCarousel = dynamic(
  () =>
    import("~/components/web/content-posts/content-post-media-carousel").then(
      m => m.ContentPostMediaCarousel,
    ),
  { loading: () => <div className="aspect-video w-full animate-pulse rounded-lg bg-muted" /> },
)

type Props = {
  params: Promise<{ slug: string }>
}

const getData = cache(async ({ params }: Props) => {
  const { slug } = await params
  const brand = await getRequestBrand()
  const post = await findPublishedContentPostBySlug(slug, brand)

  if (!post) {
    notFound()
  }

  const t = await getTranslations()
  const url = `/posts/${post.publicSlug}`
  const title = post.publicTitle ?? post.atom.title
  const description = post.excerpt ?? ""
  const body = post.renderedCopy ?? post.atom.longFormCopy ?? ""
  const articleImageUrl =
    post.thumbnailUrl ??
    post.atom.mediaAttachments.find(({ media }) => media.type === "IMAGE")?.media.url

  const data = await getPageData(url, title, description, {
    breadcrumbs: [
      { url: "/posts", title: t("navigation.blog") },
      { url, title },
    ],
    structuredData: [
      generateArticle(url, {
        title,
        description,
        content: body,
        publishedAt: post.publishDate,
        updatedAt: post.updatedAt ?? new Date(),
        imageUrl: articleImageUrl,
        author: post.atom.createdBy,
      }),
    ],
  })

  return { post, body, brand, ...data }
})

export const generateMetadata = async (props: Props): Promise<Metadata> => {
  const { url, metadata } = await getData(props)
  return await getPageMetadata({ url, metadata })
}

export default async function (props: Props) {
  const { post, body, brand, breadcrumbs, structuredData } = await getData(props)
  const t = await getTranslations()
  const format = await getFormatter()

  const displayTitle = post.publicTitle ?? post.atom.title
  const carouselMedia = post.atom.mediaAttachments.map(({ media }) => media)
  const hasMedia = carouselMedia.length > 0 || !!post.thumbnailUrl

  // Brand type seam (recipe step 2): BBL inherits Poppins/Inter via these font
  // vars; other brands keep the app font. `display: contents` preserves the
  // page's section rhythm.
  return (
    <div className={cx("contents", brandFontVariables(brand))}>
      <Breadcrumbs items={breadcrumbs} />

      <Intro>
        <IntroTitle className="[font-family:var(--font-bbl-heading,var(--font-display))]!">
          {displayTitle}
        </IntroTitle>
        {post.excerpt && <IntroDescription>{post.excerpt}</IntroDescription>}

        {post.atom.createdBy && (
          <Author
            prefix={t("posts.written_by")}
            note={
              <>
                {post.publishDate && (
                  <time dateTime={post.publishDate.toISOString()}>
                    {format.dateTime(post.publishDate, { dateStyle: "long" })}
                  </time>
                )}
                <span className="px-1.5">&bull;</span>
                <span>{t("posts.read_time", { count: getReadTime(body) })}</span>
              </>
            }
            className="mt-4"
            name={post.atom.createdBy.name}
            image={post.atom.createdBy.image}
          />
        )}

        {!!post.atom.tags.length && (
          <Stack size="sm" className="mt-4" wrap>
            {post.atom.tags.map(tag => (
              <Tag
                key={tag.id}
                render={<Link href={`/posts?tag=${encodeURIComponent(tag.slug)}`} />}
              >
                {tag.name}
              </Tag>
            ))}
          </Stack>
        )}
      </Intro>

      <Section>
        <Section.Content>
          {hasMedia && (
            <ContentPostMediaCarousel
              media={carouselMedia}
              title={displayTitle}
              fallbackImageUrl={post.thumbnailUrl}
            />
          )}

          <Prose>
            <Markdown>{body}</Markdown>
          </Prose>
        </Section.Content>

        <Section.Sidebar className="max-h-(--sidebar-max-height)">
          <Suspense fallback={<AdCardSkeleton />}>
            <AdCard type="BlogPost" />
          </Suspense>

          {!!post.atom.tools.length && (
            <TableOfContents
              title={t("posts.tools_mentioned")}
              headings={post.atom.tools.map(({ slug, name, faviconUrl }) => ({
                id: slug,
                level: 1,
                text: (
                  <Stack size="sm" wrap={false}>
                    <Favicon src={faviconUrl} title={name} className="size-4" />
                    <span className="truncate">{name}</span>
                  </Stack>
                ),
              }))}
            />
          )}
        </Section.Sidebar>
      </Section>

      <Nav title={displayTitle} className="self-start" />

      <StructuredData data={structuredData} />
    </div>
  )
}
