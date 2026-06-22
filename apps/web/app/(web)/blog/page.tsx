import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { cache } from "react"
import { PostList } from "~/components/web/posts/post-list"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Brand } from "~/.generated/prisma/client"
import { getBrandSiteConfig } from "~/config/site"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { generateBlog } from "~/lib/structured-data"
import { findPublishedPosts } from "~/server/web/posts/queries"

// I18n page namespace
const namespace = "pages.blog"

// Get page data
const getData = cache(async () => {
  const brandConfig = getBrandSiteConfig(Brand.BBL)
  const posts = await findPublishedPosts(Brand.BBL)

  const t = await getTranslations()
  const url = "/blog"
  const title = t(`${namespace}.title`)
  const description = t(`${namespace}.description`, { siteName: brandConfig.name })

  const data = await getPageData(url, title, description, {
    breadcrumbs: [{ url, title }],
    structuredData: [generateBlog(url, title, description, posts)],
  })

  return { posts, ...data }
})

export const generateMetadata = async (): Promise<Metadata> => {
  const { url, metadata } = await getData()
  return await getPageMetadata({ url, metadata })
}

export default async function () {
  const { posts, metadata, breadcrumbs, structuredData } = await getData()

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <Intro>
        <IntroTitle>{metadata.title}</IntroTitle>
        <IntroDescription>{metadata.description}</IntroDescription>
      </Intro>

      <PostList posts={posts} />

      <StructuredData data={structuredData} />
    </>
  )
}
