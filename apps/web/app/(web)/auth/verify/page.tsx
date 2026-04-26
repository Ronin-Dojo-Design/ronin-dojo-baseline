import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { createLoader, parseAsString } from "nuqs/server"
import { cache } from "react"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { NavLink } from "~/components/web/ui/nav-link"
import { siteConfig } from "~/config/site"
import { getPageData, getPageMetadata } from "~/lib/pages"

// I18n page namespace
const namespace = "pages.auth.verify"

// Get page data
const getData = cache(async () => {
  const t = await getTranslations()
  const url = "/auth/verify"
  const title = t(`${namespace}.title`)
  const description = t(`${namespace}.description`, { siteName: siteConfig.name })

  return getPageData(url, title, description, {
    breadcrumbs: [{ url, title }],
  })
})

export const generateMetadata = async (): Promise<Metadata> => {
  const { url, metadata } = await getData()
  return getPageMetadata({ url, metadata })
}

export default async function ({ searchParams }: PageProps<"/auth/verify">) {
  const searchParamsLoader = createLoader({ email: parseAsString.withDefault("") })
  const { email } = await searchParamsLoader(searchParams)
  const { metadata } = await getData()
  const t = await getTranslations()

  return (
    <>
      <Intro>
        <IntroTitle size="h3">{metadata.title}</IntroTitle>

        <IntroDescription className="text-sm!">
          {t(`${namespace}.instructions`, { email })}
        </IntroDescription>
      </Intro>

      <p className="text-xs text-muted-foreground/75">
        {t.rich(`${namespace}.no_email`, {
          link: chunks => (
            <NavLink href="/auth/login" className="inline font-medium">
              {chunks}
            </NavLink>
          ),
        })}
      </p>
    </>
  )
}
