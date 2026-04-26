import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { cache, Suspense } from "react"
import { ProductListSkeleton } from "~/components/web/products/product-list"
import { ProductQuery } from "~/components/web/products/product-query"
import { Stats } from "~/components/web/stats"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { siteConfig } from "~/config/site"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { isToolPublished } from "~/lib/tools"
import { toolOnePayload } from "~/server/web/tools/payloads"
import { db } from "~/services/db"

type Props = PageProps<"/submit/[slug]">

// I18n page namespace
const namespace = "pages.submit"

// Get page data
const getData = cache(async ({ params }: Props) => {
  const { slug } = await params

  const tool = await db.tool.findFirst({
    where: { slug, isFeatured: false },
    select: toolOnePayload,
  })

  if (!tool) {
    notFound()
  }

  const prefix = isToolPublished(tool) ? "feature" : "expedite"
  const t = await getTranslations()
  const name = tool.name
  const url = `/submit/${tool.slug}`
  const title = t(`${namespace}.${prefix}.title`, { name })
  const description = t(`${namespace}.${prefix}.description`, { name, siteName: siteConfig.name })

  const data = getPageData(url, title, description, {
    breadcrumbs: [{ url, title }],
  })

  return { tool, ...data }
})

export const generateMetadata = async (props: Props): Promise<Metadata> => {
  const { url, metadata } = await getData(props)
  return getPageMetadata({ url, metadata })
}

export default async function (props: Props) {
  const { tool, url, metadata } = await getData(props)
  const t = await getTranslations()
  const isPublished = isToolPublished(tool)

  return (
    <>
      <Intro alignment="center">
        <IntroTitle>{metadata.title}</IntroTitle>
        <IntroDescription>{metadata.description}</IntroDescription>
      </Intro>

      <Suspense fallback={<ProductListSkeleton />}>
        <ProductQuery
          searchParams={props.searchParams}
          checkoutData={{
            successUrl: `${url}/success`,
            cancelUrl: `${url}`,
            metadata: { tool: tool.slug },
          }}
          productFilter={({ name }) => {
            return name.includes("Listing") && (!isPublished || !name.includes("Expedited"))
          }}
          productMapper={({ name, ...product }) => {
            return { ...product, name: name.replace("Listing", "").trim() }
          }}
          buttonLabel={({ name, metadata }) => {
            if (name.includes("Free")) {
              return t(`${namespace}.current_package`)
            }

            if (isPublished) {
              return t(`${namespace}.upgrade_listing`)
            }

            return metadata.label ?? t(`${namespace}.choose_plan`, { name })
          }}
        />
      </Suspense>

      <Stats className="my-4" />
    </>
  )
}
