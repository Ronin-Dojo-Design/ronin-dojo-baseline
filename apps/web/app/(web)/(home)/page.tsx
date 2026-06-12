import { getTranslations } from "next-intl/server"
import { cache } from "react"
import { Brand } from "~/.generated/prisma/client"
import { BblLanding } from "~/app/(web)/(home)/bbl/bbl-landing"
import { BottomCTA } from "~/app/(web)/(home)/bottom-cta"
import { FeatureCards } from "~/app/(web)/(home)/feature-cards"
import { Hero } from "~/app/(web)/(home)/hero"
import { ValueProp } from "~/app/(web)/(home)/value-prop"
import { StructuredData } from "~/components/web/structured-data"
import { getBrandSiteConfig, siteConfig } from "~/config/site"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageData } from "~/lib/pages"

// Get page data
const getData = cache(async () => {
  const t = await getTranslations()
  const brand = await getRequestBrand()
  const brandConfig = getBrandSiteConfig(brand)
  const title = `${brandConfig.name} - ${t("brand.tagline")}`
  const description = t("brand.description")

  return await getPageData(siteConfig.url, title, description)
})

export default async function (_props: PageProps<"/">) {
  const { structuredData } = await getData()
  const brand = await getRequestBrand()

  // BBL gets its dedicated landing (legacy content, current primitives — SESSION_0367).
  if (brand === Brand.BBL) {
    return (
      <>
        <BblLanding />
        <StructuredData data={structuredData} />
      </>
    )
  }

  return (
    <>
      <Hero />
      <FeatureCards />
      <ValueProp />
      <BottomCTA />
      <StructuredData data={structuredData} />
    </>
  )
}
