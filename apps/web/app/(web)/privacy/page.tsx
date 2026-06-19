import type { Metadata } from "next"
import { getBrandSiteConfig } from "~/config/site"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { PrivacyPolicy } from "./_components/privacy-policy"

const PAGE_URL = "/privacy"
const PAGE_TITLE = "Privacy Policy"

const getData = async () => {
  const brand = await getRequestBrand()
  const brandConfig = getBrandSiteConfig(brand)
  const description = `How ${brandConfig.name} collects, uses, and safeguards information you provide.`
  return await getPageData(PAGE_URL, PAGE_TITLE, description, {
    breadcrumbs: [{ url: PAGE_URL, title: PAGE_TITLE }],
  })
}

export const generateMetadata = async (): Promise<Metadata> => {
  const { url, metadata } = await getData()
  return await getPageMetadata({ url, metadata })
}

export default async function PrivacyPolicyPage() {
  const { metadata } = await getData()
  const brand = await getRequestBrand()
  const { name: siteName } = getBrandSiteConfig(brand)

  return (
    <PrivacyPolicy
      brand={brand}
      siteName={siteName}
      title={metadata.title}
      description={metadata.description}
    />
  )
}
