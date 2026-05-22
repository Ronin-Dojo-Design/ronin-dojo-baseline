import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { cache } from "react"
import { ContentPostList } from "~/components/web/content-posts/content-post-list"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { siteConfig } from "~/config/site"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { findPublishedContentPosts } from "~/server/web/content-posts/queries"

const namespace = "pages.blog"

const getData = cache(async () => {
  const brand = await getRequestBrand()
  const posts = await findPublishedContentPosts(brand)

  const t = await getTranslations()
  const url = "/posts"
  const title = t(`${namespace}.title`)
  const description = t(`${namespace}.description`, { siteName: siteConfig.name })

  const data = getPageData(url, title, description, {
    breadcrumbs: [{ url, title }],
  })

  return { posts, ...data }
})

export const generateMetadata = async (): Promise<Metadata> => {
  const { url, metadata } = await getData()
  return getPageMetadata({ url, metadata })
}

export default async function () {
  const { posts, metadata, breadcrumbs } = await getData()

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <Intro>
        <IntroTitle>{metadata.title}</IntroTitle>
        <IntroDescription>{metadata.description}</IntroDescription>
      </Intro>

      <ContentPostList posts={posts} />
    </>
  )
}
