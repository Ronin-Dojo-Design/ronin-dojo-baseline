import { cache } from "react"
import { Brand } from "~/.generated/prisma/client"
import { BblJoinLanding } from "~/app/(web)/(home)/bbl-join-landing"
import { StructuredData } from "~/components/web/structured-data"
import { getBrandSiteConfig, siteConfig } from "~/config/site"
import { getPageData } from "~/lib/pages"

// Get page data
const getData = cache(async () => {
  const brandConfig = getBrandSiteConfig(Brand.BBL)
  const title = `${brandConfig.name} - ${brandConfig.tagline}`
  const description = brandConfig.description

  return await getPageData(siteConfig.url, title, description)
})

export default async function (_props: PageProps<"/">) {
  const { structuredData } = await getData()

  // BBL home = the /lineage/join composition promoted to the main page (SESSION_0416).
  return (
    <>
      <BblJoinLanding />
      <StructuredData data={structuredData} />
    </>
  )
}
