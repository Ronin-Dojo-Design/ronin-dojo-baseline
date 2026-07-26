import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"
import { getTranslations } from "next-intl/server"
import { createLoader } from "nuqs/server"
import { OgBase } from "~/components/web/og/og-base"
import { OgPromotionCard } from "~/components/web/og/og-promotion-card"
import { parsePromotionCardParams } from "~/components/web/og/promotion-card-params"
import { getBrandSiteConfig, siteConfig } from "~/config/site"
import { Brand } from "~/.generated/prisma/client"
import { loadGoogleFont } from "~/lib/fonts"
import { resolvePublicMediaUrl } from "~/lib/media"
import { ogImageSearchParams } from "~/lib/opengraph"

export const GET = async (req: NextRequest) => {
  const t = await getTranslations()
  const brandConfig = getBrandSiteConfig(Brand.BBL)
  const loaded = createLoader(ogImageSearchParams)(req)
  const { title, description, faviconUrl } = loaded

  const imageOptions = {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Geist",
        data: await loadGoogleFont("Geist", 400),
        weight: 400,
        style: "normal",
      },
      {
        name: "GeistBold",
        data: await loadGoogleFont("Geist", 600),
        weight: 600,
        style: "normal",
      },
    ],
  } satisfies ConstructorParameters<typeof ImageResponse>[1]

  // `card=rank-promotion` variant (SESSION_0705, PL-027 renderer graduation): the belt-color
  // celebration card. `parsePromotionCardParams` is the null-safety seam — incomplete/legacy
  // URLs (title/description only) fall through to the generic OgBase below.
  const promotion = parsePromotionCardParams(loaded)
  if (promotion) {
    return new ImageResponse(
      <OgPromotionCard {...promotion} siteName={brandConfig.name} />,
      imageOptions,
    )
  }

  const params = {
    title: title ?? brandConfig.name,
    description: description ?? t("brand.description"),
    faviconUrl: faviconUrl ?? `${siteConfig.url}${resolvePublicMediaUrl(brandConfig.faviconSrc)}`,
    siteName: brandConfig.name,
    siteTagline: t("brand.tagline"),
  }

  return new ImageResponse(<OgBase {...params} />, imageOptions)
}
