import type { Metadata, Viewport } from "next"
import { headers } from "next/headers"
import { ThemeProvider } from "next-themes"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { Search } from "~/components/common/search"
import { Toaster } from "~/components/common/toaster"
import { TooltipProvider } from "~/components/common/tooltip"
import { SwRegister } from "~/components/web/pwa/sw-register"
import { metadataConfig } from "~/config/metadata"
import { getBrandSiteConfig } from "~/config/site"
import { BrandProvider } from "~/contexts/brand-context"
import { QueryProvider } from "~/contexts/query-context"
import { SearchProvider } from "~/contexts/search-context"
import { Brand } from "~/.generated/prisma/client"
import { brandThemeCss } from "~/lib/brand-theme"
import { bblBodyFont, bblHeadingFont, fontSans } from "~/lib/fonts"
import { getRequestOrigin } from "~/lib/request-url"
import { findBrandSettings } from "~/server/admin/brand-settings/queries"
import "./styles.css"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages, getTimeZone } from "next-intl/server"

export const generateMetadata = async (): Promise<Metadata> => {
  const origin = await getRequestOrigin()
  const brandConfig = getBrandSiteConfig(Brand.BBL)
  const brandSettings = await findBrandSettings(Brand.BBL)

  // DB asset URLs override static config/site.ts paths when present. The static
  // fallbacks are served from `public/` by Next (like app/manifest.ts's icons) and
  // are NOT synced to the CloudFront media origin — so they must stay RELATIVE
  // (resolved against `metadataBase` to this origin). Routing them through
  // resolvePublicMediaUrl() pointed the tab favicon / apple-touch-icon / og:image at
  // CloudFront paths that 403 (SESSION_0508). resolvePublicMediaUrl is for
  // user-uploaded R2/S3 media, not ship-with-the-app brand chrome.
  const faviconUrl = brandSettings?.faviconUrl ?? brandConfig.faviconSrc
  const ogImageUrl = brandSettings?.ogImageUrl ?? brandConfig.ogImageSrc

  return {
    metadataBase: new URL(origin),
    title: {
      template: `%s – ${brandConfig.name}`,
      default: `${brandConfig.tagline} – ${brandConfig.name}`,
    },
    description: brandConfig.description,
    icons: {
      // Browser tab: the crest (config/site.ts faviconSrc), DB-overridable.
      icon: [{ type: "image/png", url: faviconUrl }],
      // iOS home-screen (apple-touch-icon): the Route A logo tile, matching the
      // PWA install icon — legible at 180px where the crest's arced text isn't.
      apple: [
        {
          type: "image/png",
          sizes: "180x180",
          // Relative (served from public/), NOT CloudFront — see the faviconUrl note.
          url: "/images/brands/black-belt-legacy/apple-touch-icon.png",
        },
      ],
    },
    // Installable-PWA surface: the static manifest route (app/manifest.ts) +
    // the Apple web-app meta iOS needs for standalone add-to-home-screen.
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      title: "BBL",
      statusBarStyle: "black-translucent",
    },
    ...metadataConfig,
    openGraph: {
      ...metadataConfig.openGraph,
      siteName: brandConfig.name,
      images: ogImageUrl ? [{ url: ogImageUrl }] : metadataConfig.openGraph?.images,
    },
  }
}

// Browser-chrome theme color = the BBL always-dark shell — app/styles.css
// `[data-brand="BBL"] --color-chrome: hsl(0 0% 4%)` (#0a0a0a). Matches the
// manifest's theme_color (app/manifest.ts). Next merges this with its default
// viewport (width/initial-scale untouched).
export const viewport: Viewport = {
  themeColor: "#0a0a0a",
}

export default async function ({ children }: LayoutProps<"/">) {
  const locale = await getLocale()
  const messages = await getMessages()
  const timeZone = await getTimeZone()
  const brandSettings = await findBrandSettings(Brand.BBL)

  // Per-request CSP nonce (SESSION_0536) minted by proxy.ts and forwarded on the
  // `x-nonce` request header. next-themes applies it to its injected inline bootstrap
  // `<script>`, which is how `script-src` can drop `'unsafe-inline'`. The brand
  // `<style>` below needs no nonce — style-src keeps `'unsafe-inline'` (locked decision).
  const nonce = (await headers()).get("x-nonce") ?? undefined

  // Runtime --color-* override from DB-driven BrandSettings (HSL-guarded via the
  // shared helper — same path the [data-org] layout uses).
  const brandCss = brandThemeCss(`[data-brand="${Brand.BBL}"]`, brandSettings)
  const brandStyle = brandCss ? (
    <style id="brand-settings-css" dangerouslySetInnerHTML={{ __html: brandCss }} />
  ) : null

  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${bblHeadingFont.variable} ${bblBodyFont.variable} scroll-smooth`}
      data-scroll-behavior="smooth"
      data-brand={Brand.BBL}
      suppressHydrationWarning
    >
      <head>{brandStyle}</head>
      <body className="min-h-dvh flex flex-col bg-background text-foreground font-sans">
        <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
          <QueryProvider>
            <NuqsAdapter>
              <TooltipProvider delay={250}>
                <SearchProvider>
                  <BrandProvider brand={Brand.BBL} logoUrl={brandSettings?.logoUrl ?? null}>
                    <ThemeProvider
                      attribute="class"
                      defaultTheme="dark"
                      enableSystem={false}
                      disableTransitionOnChange
                      nonce={nonce}
                    >
                      {children}
                      <Toaster />
                      <Search />
                      <SwRegister />
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
