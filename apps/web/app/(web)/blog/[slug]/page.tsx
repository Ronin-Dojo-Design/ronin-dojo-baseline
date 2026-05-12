import { getReadTime } from "@primoui/utils"
import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getFormatter, getTranslations } from "next-intl/server"
import { cache, Suspense } from "react"
import Markdown from "react-markdown"
import { Stack } from "~/components/common/stack"
import { AdCard, AdCardSkeleton } from "~/components/web/ads/ad-card"
import { Nav } from "~/components/web/nav"
import { StructuredData } from "~/components/web/structured-data"
import { TableOfContents } from "~/components/web/table-of-contents"
import { Author } from "~/components/web/ui/author"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Favicon } from "~/components/web/ui/favicon"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Prose } from "~/components/common/prose"
import { Section } from "~/components/web/ui/section"
import { blogConfig } from "~/config/blog"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { generateArticle } from "~/lib/structured-data"
import { findPublishedPostBySlug } from "~/server/web/posts/queries"

export const dynamicParams = true

type Props = PageProps<"/blog/[slug]">

// Get page data
const getData = cache(async ({ params }: Props) => {
  const { slug } = await params
  const brand = await getRequestBrand()
  const post = await findPublishedPostBySlug(slug, brand)

  if (!post) {
    notFound()
  }

  const t = await getTranslations()
  const url = `/blog/${post.slug}`

  const data = getPageData(url, post.title, post.description ?? "", {
    breadcrumbs: [
      { url: "/blog", title: t("navigation.blog") },
      { url, title: post.title },
    ],
    structuredData: [generateArticle(url, post)],
  })

  return { post, ...data }
})

export const generateMetadata = async (props: Props): Promise<Metadata> => {
  const { url, metadata } = await getData(props)
  return getPageMetadata({ url, metadata })
}

export default async function (props: Props) {
  const { post, breadcrumbs, structuredData } = await getData(props)
  const t = await getTranslations()
  const format = await getFormatter()

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <Intro>
        <IntroTitle>{post.title}</IntroTitle>
        <IntroDescription>{post.description}</IntroDescription>

        {post.author && (
          <Author
            prefix={t("posts.written_by")}
            note={
              <>
                {post.publishedAt && (
                  <time dateTime={post.publishedAt.toISOString()}>
                    {format.dateTime(post.publishedAt, { dateStyle: "long" })}
                  </time>
                )}
                <span className="px-1.5">&bull;</span>
                <span>{t("posts.read_time", { count: getReadTime(post.plainText || post.content) })}</span>
              </>
            }
            className="mt-4"
            name={post.author.name}
            image={post.author.image || ""}
          />
        )}
      </Intro>

      <Section>
        <Section.Content>
          {post.imageUrl && (
            <Image
              src={post.imageUrl}
              alt={post.title}
              width={1200}
              height={630}
              loading="eager"
              className="w-full h-auto aspect-video object-cover rounded-lg"
            />
          )}

          <Prose>
            <Markdown>{post.content}</Markdown>
          </Prose>
        </Section.Content>

        <Section.Sidebar className="max-h-(--sidebar-max-height)">
          <Suspense fallback={<AdCardSkeleton />}>
            <AdCard type="BlogPost" />
          </Suspense>

          {blogConfig.toolsMentioned.enabled && !!post.tools.length && (
            <TableOfContents
              title={t("posts.tools_mentioned")}
              headings={[
                ...post.tools.map(({ slug, name, faviconUrl }) => ({
                  id: slug,
                  level: 1,
                  text: (
                    <Stack size="sm" wrap={false}>
                      <Favicon src={faviconUrl} title={name} className="size-4" />
                      <span className="truncate">{name}</span>
                    </Stack>
                  ),
                })),
              ]}
            />
          )}
        </Section.Sidebar>
      </Section>

      <Nav title={post.title} className="self-start" />

      <StructuredData data={structuredData} />
    </>
  )
}
