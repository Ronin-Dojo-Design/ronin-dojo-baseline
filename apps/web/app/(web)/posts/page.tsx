import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { cache } from "react"
import { ContentPostList } from "~/components/web/content-posts/content-post-list"
import { ContentTagFilter } from "~/components/web/content-posts/content-tag-filter"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { getBrandSiteConfig } from "~/config/site"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { generateBlog } from "~/lib/structured-data"
import {
  findPublishedContentPosts,
  findPublishedContentTags,
} from "~/server/web/content-posts/queries"

const namespace = "pages.blog"

const getData = cache(async (tagSlug?: string) => {
  const brand = await getRequestBrand()
  const brandConfig = getBrandSiteConfig(brand)
  const [posts, tags] = await Promise.all([
    findPublishedContentPosts(brand, tagSlug),
    findPublishedContentTags(brand),
  ])

  const t = await getTranslations()
  const url = "/posts"
  const title = t(`${namespace}.title`)
  const description = t(`${namespace}.description`, { siteName: brandConfig.name })

  const data = await getPageData(url, title, description, {
    breadcrumbs: [{ url, title }],
    structuredData: [generateBlog(url, title, description, [] as any)],
  })

  return { posts, tags, ...data }
})

export const generateMetadata = async (): Promise<Metadata> => {
  const { url, metadata } = await getData()
  return await getPageMetadata({ url, metadata })
}

export default async function ({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const { tag } = await searchParams
  const { posts, tags, metadata, breadcrumbs, structuredData } = await getData(tag)

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <Intro>
        <IntroTitle>{metadata.title}</IntroTitle>
        <IntroDescription>{metadata.description}</IntroDescription>
      </Intro>

      <ContentTagFilter tags={tags} activeTag={tag} />

      <ContentPostList posts={posts} />

      <StructuredData data={structuredData} />
    </>
  )
}
