import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { cache, Suspense } from "react"
import { StructuredData } from "~/components/web/structured-data"
import { TagListSkeleton } from "~/components/web/tags/tag-list"
import { TagQuery } from "~/components/web/tags/tag-query"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroTitle } from "~/components/web/ui/intro"
import { getBrandSiteConfig } from "~/config/site"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { generateCollectionPage } from "~/lib/structured-data"

// I18n page namespace
const namespace = "pages.tags"

// Get page data
const getData = cache(async () => {
  const brand = await getRequestBrand()
  const brandConfig = getBrandSiteConfig(brand)
  const t = await getTranslations()
  const url = "/tags"
  const title = t(`${namespace}.title`)
  const description = t(`${namespace}.description`, { siteName: brandConfig.name })

  return await getPageData(url, title, description, {
    breadcrumbs: [{ url, title: t("navigation.tags") }],
    structuredData: [generateCollectionPage(url, title, description)],
  })
})

export const generateMetadata = async (): Promise<Metadata> => {
  const { url, metadata } = await getData()
  return await getPageMetadata({ url, metadata })
}

export default async function (props: PageProps<"/tags">) {
  const { metadata, breadcrumbs, structuredData } = await getData()

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <Intro>
        <IntroTitle>{metadata.title}</IntroTitle>
      </Intro>

      <Suspense fallback={<TagListSkeleton />}>
        <TagQuery searchParams={props.searchParams} options={{ enableFilters: true }} />
      </Suspense>

      <StructuredData data={structuredData} />
    </>
  )
}
