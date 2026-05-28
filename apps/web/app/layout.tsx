import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { Search } from "~/components/common/search"
import { Toaster } from "~/components/common/toaster"
import { TooltipProvider } from "~/components/common/tooltip"
import { metadataConfig } from "~/config/metadata"
import { getBrandSiteConfig, siteConfig } from "~/config/site"
import { BrandProvider } from "~/contexts/brand-context"
import { SearchProvider } from "~/contexts/search-context"
import { getRequestBrand } from "~/lib/brand-context"
import { fontSans } from "~/lib/fonts"
import "./styles.css"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages, getTimeZone, getTranslations } from "next-intl/server"

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations()
  const brand = await getRequestBrand()
  const brandConfig = getBrandSiteConfig(brand)

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      template: `%s – ${brandConfig.name}`,
      default: `${brandConfig.tagline} – ${brandConfig.name}`,
    },
    description: brandConfig.description,
    icons: { icon: [{ type: "image/png", url: "/favicon.png" }] },
    ...metadataConfig,
  }
}

export default async function ({ children }: LayoutProps<"/">) {
  const locale = await getLocale()
  const messages = await getMessages()
  const timeZone = await getTimeZone()
  const brand = await getRequestBrand()

  return (
    <html
      lang="en"
      className={`${fontSans.variable} scroll-smooth`}
      data-scroll-behavior="smooth"
      data-brand={brand}
      suppressHydrationWarning
    >
      <body className="min-h-dvh flex flex-col bg-background text-foreground font-sans">
        <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
          <NuqsAdapter>
            <TooltipProvider delay={250}>
              <SearchProvider>
                <BrandProvider brand={brand}>
                  <ThemeProvider attribute="class" disableTransitionOnChange>
                    {children}
                    <Toaster />
                    <Search />
                  </ThemeProvider>
                </BrandProvider>
              </SearchProvider>
            </TooltipProvider>
          </NuqsAdapter>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
