import { getReadTime } from "@dirstack/utils"
import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getFormatter, getTranslations } from "next-intl/server"
import { cache, Suspense } from "react"
import Markdown from "react-markdown"
import { Prose } from "~/components/common/prose"
import { AdCard, AdCardSkeleton } from "~/components/web/ads/ad-card"
import { Nav } from "~/components/web/nav"
import { StructuredData } from "~/components/web/structured-data"
import { Author } from "~/components/web/ui/author"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { generateArticle } from "~/lib/structured-data"
import { findPublishedContentPostBySlug } from "~/server/web/content-posts/queries"

export const dynamicParams = true

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

  const data = getPageData(url, title, description, {
    breadcrumbs: [
      { url: "/posts", title: t("navigation.blog") },
      { url, title },
    ],
    structuredData: [generateArticle(url, {
      id: post.id,
      title,
      description,
      content: body,
      plainText: body,
      slug: post.publicSlug,
      status: "Published" as any,
      brand: post.brand,
      publishedAt: post.publishDate,
      createdAt: post.createdAt ?? new Date(),
      updatedAt: post.updatedAt ?? new Date(),
      imageUrl: post.thumbnailUrl,
      authorId: post.atom.createdBy?.id ?? "",
      author: post.atom.createdBy,
    } as any)],
  })

  return { post, body, ...data }
})

export const generateMetadata = async (props: Props): Promise<Metadata> => {
  const { url, metadata } = await getData(props)
  return getPageMetadata({ url, metadata })
}

export default async function (props: Props) {
  const { post, body, breadcrumbs, structuredData } = await getData(props)
  const t = await getTranslations()
  const format = await getFormatter()

  const displayTitle = post.publicTitle ?? post.atom.title

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <Intro>
        <IntroTitle>{displayTitle}</IntroTitle>
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
                <span>
                  {t("posts.read_time", { count: getReadTime(body) })}
                </span>
              </>
            }
            className="mt-4"
            name={post.atom.createdBy.name}
            image={post.atom.createdBy.image || null}
          />
        )}
      </Intro>

      <Section>
        <Section.Content>
          {post.thumbnailUrl && (
            <Image
              src={post.thumbnailUrl}
              alt={displayTitle}
              width={1200}
              height={630}
              loading="eager"
              className="w-full h-auto aspect-video object-cover rounded-lg"
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
        </Section.Sidebar>
      </Section>

      <Nav title={displayTitle} className="self-start" />

      <StructuredData data={structuredData} />
    </>
  )
}
