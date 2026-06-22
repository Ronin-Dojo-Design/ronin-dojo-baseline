import { LoaderIcon } from "lucide-react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { cache, Suspense } from "react"
import { Login } from "~/components/web/auth/login"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Brand } from "~/.generated/prisma/client"
import { getBrandSiteConfig } from "~/config/site"
import { getPageData, getPageMetadata } from "~/lib/pages"

// I18n page namespace
const namespace = "pages.auth.login"

// Get page data
const getData = cache(async () => {
  const brandConfig = getBrandSiteConfig(Brand.BBL)
  const t = await getTranslations()
  const url = "/auth/login"
  const title = t(`${namespace}.title`)
  const description = t(`${namespace}.description`, { siteName: brandConfig.name })

  return await getPageData(url, title, description, {
    breadcrumbs: [{ url, title }],
  })
})

export const generateMetadata = async (): Promise<Metadata> => {
  const { url, metadata } = await getData()
  return await getPageMetadata({ url, metadata })
}

export default async function () {
  const { metadata } = await getData()

  return (
    <>
      <Intro>
        <IntroTitle size="h3">{metadata.title}</IntroTitle>
        <IntroDescription className="md:text-sm">{metadata.description}</IntroDescription>
      </Intro>

      <Suspense fallback={<LoaderIcon className="animate-spin mx-auto" />}>
        <Login />
      </Suspense>
    </>
  )
}
