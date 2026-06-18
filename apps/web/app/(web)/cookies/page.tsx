import type { Metadata } from "next"
import { getBrandSiteConfig } from "~/config/site"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { CookiesPolicy } from "./_components/cookies-policy"

const PAGE_URL = "/cookies"
const PAGE_TITLE = "Cookies Policy"

const getData = async () => {
  const brand = await getRequestBrand()
  const brandConfig = getBrandSiteConfig(brand)
  const description = `What cookies ${brandConfig.name} sets, why, and how long they last.`
  return await getPageData(PAGE_URL, PAGE_TITLE, description, {
    breadcrumbs: [{ url: PAGE_URL, title: PAGE_TITLE }],
  })
}

export const generateMetadata = async (): Promise<Metadata> => {
  const { url, metadata } = await getData()
  return await getPageMetadata({ url, metadata })
}

export default async function CookiesPolicyPage() {
  const { metadata } = await getData()
  const brand = await getRequestBrand()
  const { name: siteName } = getBrandSiteConfig(brand)

  return (
    <CookiesPolicy
      brand={brand}
      siteName={siteName}
      title={metadata.title}
      description={metadata.description}
    />
  )
}
