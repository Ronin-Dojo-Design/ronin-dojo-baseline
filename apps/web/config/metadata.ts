import type { Metadata } from "next"
import type { Brand } from "~/.generated/prisma/client"
import { linksConfig } from "~/config/links"
import { getBrandSiteConfig, siteConfig } from "~/config/site"
import { getOpenGraphImageUrl } from "~/lib/opengraph"

/**
 * Build metadata config with brand-aware `og:site_name`.
 * When called without a brand, falls back to the static siteConfig default.
 */
export const getMetadataConfig = (brand?: Brand): Metadata => ({
  openGraph: {
    url: "/",
    siteName: brand ? getBrandSiteConfig(brand).name : siteConfig.name,
    locale: "en_US",
    type: "website",
    images: { url: getOpenGraphImageUrl({}), width: 1200, height: 630 },
  },
  twitter: {
    site: "@dirstarter",
    creator: "@piotrkulpinski",
    card: "summary_large_image",
  },
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": linksConfig.feed },
  },
})

/** @deprecated Use getMetadataConfig(brand) instead */
export const metadataConfig: Metadata = getMetadataConfig()
