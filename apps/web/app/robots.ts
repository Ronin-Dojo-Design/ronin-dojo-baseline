import type { MetadataRoute } from "next"
import { Brand } from "~/.generated/prisma/client"
import { robotsDisallowRoutesForBrand } from "~/config/seo"
import { buildAbsoluteUrl, getRequestOrigin } from "~/lib/request-url"

export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await getRequestOrigin()
  const disallow = robotsDisallowRoutesForBrand(Brand.BBL)

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      ...(disallow.length ? { disallow } : {}),
    },
    sitemap: buildAbsoluteUrl("/sitemap.xml", origin),
  }
}
