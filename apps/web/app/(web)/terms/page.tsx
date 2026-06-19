import type { Metadata } from "next"
import { getBrandSiteConfig } from "~/config/site"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { TermsPolicy } from "./_components/terms-policy"

const PAGE_URL = "/terms"
const PAGE_TITLE = "Terms of Service"

const getData = async () => {
  const brand = await getRequestBrand()
  const brandConfig = getBrandSiteConfig(brand)
  const description = `The rules and conditions that govern use of ${brandConfig.name}.`
  return await getPageData(PAGE_URL, PAGE_TITLE, description, {
    breadcrumbs: [{ url: PAGE_URL, title: PAGE_TITLE }],
  })
}

export const generateMetadata = async (): Promise<Metadata> => {
  const { url, metadata } = await getData()
  return await getPageMetadata({ url, metadata })
}

export default async function TermsOfServicePage() {
  const { metadata } = await getData()
  const brand = await getRequestBrand()
  const { name: siteName } = getBrandSiteConfig(brand)

  return (
    <TermsPolicy
      brand={brand}
      siteName={siteName}
      title={metadata.title}
      description={metadata.description}
    />
  )
}
