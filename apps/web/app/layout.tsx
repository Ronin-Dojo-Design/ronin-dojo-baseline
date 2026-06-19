import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { Search } from "~/components/common/search"
import { Toaster } from "~/components/common/toaster"
import { TooltipProvider } from "~/components/common/tooltip"
import { metadataConfig } from "~/config/metadata"
import { getBrandSiteConfig } from "~/config/site"
import { BrandProvider } from "~/contexts/brand-context"
import { QueryProvider } from "~/contexts/query-context"
import { SearchProvider } from "~/contexts/search-context"
import { getRequestBrand } from "~/lib/brand-context"
import { brandThemeCss } from "~/lib/brand-theme"
import { bblBodyFont, bblHeadingFont, fontSans } from "~/lib/fonts"
import { resolvePublicMediaUrl } from "~/lib/media"
import { getRequestOrigin } from "~/lib/request-url"
import { findBrandSettings } from "~/server/admin/brand-settings/queries"
import "./styles.css"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages, getTimeZone } from "next-intl/server"

export const generateMetadata = async (): Promise<Metadata> => {
  const brand = await getRequestBrand()
  const origin = await getRequestOrigin()
  const brandConfig = getBrandSiteConfig(brand)
  const brandSettings = await findBrandSettings(brand)

  // DB asset URLs override static config/site.ts paths when present
  const faviconUrl = brandSettings?.faviconUrl ?? resolvePublicMediaUrl(brandConfig.faviconSrc)
  const ogImageUrl = brandSettings?.ogImageUrl ?? resolvePublicMediaUrl(brandConfig.ogImageSrc)

  return {
    metadataBase: new URL(origin),
    title: {
      template: `%s – ${brandConfig.name}`,
      default: `${brandConfig.tagline} – ${brandConfig.name}`,
    },
    description: brandConfig.description,
    icons: { icon: [{ type: "image/png", url: faviconUrl }] },
    ...metadataConfig,
    openGraph: {
      ...metadataConfig.openGraph,
      siteName: brandConfig.name,
      images: ogImageUrl ? [{ url: ogImageUrl }] : metadataConfig.openGraph?.images,
    },
  }
}

export default async function ({ children }: LayoutProps<"/">) {
  const locale = await getLocale()
  const messages = await getMessages()
  const timeZone = await getTimeZone()
  const brand = await getRequestBrand()
  const brandSettings = await findBrandSettings(brand)

  // Runtime --color-* override from DB-driven BrandSettings (HSL-guarded via the
  // shared helper — same path the [data-org] layout uses).
  const brandCss = brandThemeCss(`[data-brand="${brand}"]`, brandSettings)
  const brandStyle = brandCss ? (
    <style id="brand-settings-css" dangerouslySetInnerHTML={{ __html: brandCss }} />
  ) : null

  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${bblHeadingFont.variable} ${bblBodyFont.variable} scroll-smooth`}
      data-scroll-behavior="smooth"
      data-brand={brand}
      suppressHydrationWarning
    >
      <head>{brandStyle}</head>
      <body className="min-h-dvh flex flex-col bg-background text-foreground font-sans">
        <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
          <QueryProvider>
            <NuqsAdapter>
              <TooltipProvider delay={250}>
                <SearchProvider>
                  <BrandProvider brand={brand} logoUrl={brandSettings?.logoUrl ?? null}>
                    <ThemeProvider attribute="class" disableTransitionOnChange>
                      {children}
                      <Toaster />
                      <Search />
                    </ThemeProvider>
                  </BrandProvider>
                </SearchProvider>
              </TooltipProvider>
            </NuqsAdapter>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
