import type { MetadataRoute } from "next"
import { robotsDisallowRoutesForBrand } from "~/config/seo"
import { getRequestBrand } from "~/lib/brand-context"
import { buildAbsoluteUrl, getRequestOrigin } from "~/lib/request-url"

export default async function robots(): Promise<MetadataRoute.Robots> {
  const [brand, origin] = await Promise.all([getRequestBrand(), getRequestOrigin()])
  const disallow = robotsDisallowRoutesForBrand(brand)

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      ...(disallow.length ? { disallow } : {}),
    },
    sitemap: buildAbsoluteUrl("/sitemap.xml", origin),
  }
}
