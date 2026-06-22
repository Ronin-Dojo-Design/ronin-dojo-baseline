import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { cache } from "react"
import { Brand } from "~/.generated/prisma/client"
import { StructuredData } from "~/components/web/structured-data"
import { getBrandSiteConfig } from "~/config/site"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { generateAboutPage } from "~/lib/structured-data"
import { AboutContent } from "./_components/about-content"

// I18n page namespace
const namespace = "pages.about"

// Get page data
const getData = cache(async () => {
  const brandConfig = getBrandSiteConfig(Brand.BBL)
  const t = await getTranslations()
  const url = "/about"
  const title = t(`${namespace}.title`)
  const description = t(`${namespace}.description`, { siteName: brandConfig.name })

  return await getPageData(url, title, description, {
    breadcrumbs: [{ url, title }],
    structuredData: [generateAboutPage(url, title, description)],
  })
})

export const generateMetadata = async (): Promise<Metadata> => {
  const { url, metadata } = await getData()
  return await getPageMetadata({ url, metadata })
}

export default async function () {
  const { metadata, structuredData } = await getData()
  const { name: siteName } = getBrandSiteConfig(Brand.BBL)

  return (
    <>
      <AboutContent
        brand={Brand.BBL}
        siteName={siteName}
        title={metadata.title}
        description={metadata.description}
      />

      <StructuredData data={structuredData} />
    </>
  )
}
