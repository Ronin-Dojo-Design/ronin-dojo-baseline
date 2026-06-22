import type { Metadata } from "next"
import { Brand } from "~/.generated/prisma/client"
import { getBrandSiteConfig } from "~/config/site"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { TermsPolicy } from "./_components/terms-policy"

const PAGE_URL = "/terms"
const PAGE_TITLE = "Terms of Service"

const getData = async () => {
  const brandConfig = getBrandSiteConfig(Brand.BBL)
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
  const { name: siteName } = getBrandSiteConfig(Brand.BBL)

  return (
    <TermsPolicy
      brand={Brand.BBL}
      siteName={siteName}
      title={metadata.title}
      description={metadata.description}
    />
  )
}
