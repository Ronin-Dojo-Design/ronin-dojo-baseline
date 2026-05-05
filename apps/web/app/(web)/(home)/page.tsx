import { getTranslations } from "next-intl/server"
import { cache } from "react"
import { BottomCTA } from "~/app/(web)/(home)/bottom-cta"
import { FeatureCards } from "~/app/(web)/(home)/feature-cards"
import { Hero } from "~/app/(web)/(home)/hero"
import { ValueProp } from "~/app/(web)/(home)/value-prop"
import { StructuredData } from "~/components/web/structured-data"
import { siteConfig } from "~/config/site"
import { getPageData } from "~/lib/pages"

// Get page data
const getData = cache(async () => {
  const t = await getTranslations()
  const title = `${siteConfig.name} - ${t("brand.tagline")}`
  const description = t("brand.description")

  return getPageData(siteConfig.url, title, description)
})

export default async function (props: PageProps<"/">) {
  const { structuredData } = await getData()

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
