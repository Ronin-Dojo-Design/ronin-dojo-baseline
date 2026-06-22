import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { cache } from "react"
import { ContentPostList } from "~/components/web/content-posts/content-post-list"
import { ContentTagFilter } from "~/components/web/content-posts/content-tag-filter"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Brand } from "~/.generated/prisma/client"
import { getBrandSiteConfig } from "~/config/site"
import { brandFontVariables } from "~/lib/fonts"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { generateBlog } from "~/lib/structured-data"
import { cx } from "~/lib/utils"
import {
  findPublishedContentPosts,
  findPublishedContentTags,
} from "~/server/web/content-posts/queries"

const namespace = "pages.blog"

const getData = cache(async (tagSlug?: string) => {
  const brandConfig = getBrandSiteConfig(Brand.BBL)
  const [posts, tags] = await Promise.all([
    findPublishedContentPosts(Brand.BBL, tagSlug),
    findPublishedContentTags(Brand.BBL),
  ])

  const t = await getTranslations()
  const url = "/posts"
  const title = t(`${namespace}.title`)
  const description = t(`${namespace}.description`, { siteName: brandConfig.name })

  const data = await getPageData(url, title, description, {
    breadcrumbs: [{ url, title }],
    structuredData: [generateBlog(url, title, description, [] as any)],
  })

  return { posts, tags, brand: Brand.BBL, ...data }
})

export const generateMetadata = async (): Promise<Metadata> => {
  const { url, metadata } = await getData()
  return await getPageMetadata({ url, metadata })
}

export default async function ({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
  const { tag } = await searchParams
  const { posts, tags, brand, metadata, breadcrumbs, structuredData } = await getData(tag)

  // Brand type seam (recipe step 2): on BBL the feed inherits Poppins/Inter via
  // these font vars; other brands keep the app font. `display: contents` keeps
  // the page's section rhythm intact (no extra layout box).
  return (
    <div className={cx("contents", brandFontVariables(brand))}>
      <Breadcrumbs items={breadcrumbs} />

      <Intro>
        <IntroTitle className="[font-family:var(--font-bbl-heading,var(--font-display))]!">
          {metadata.title}
        </IntroTitle>
        <IntroDescription>{metadata.description}</IntroDescription>
      </Intro>

      <ContentTagFilter tags={tags} activeTag={tag} />

      <ContentPostList posts={posts} isFiltered={!!tag} />

      <StructuredData data={structuredData} />
    </div>
  )
}
