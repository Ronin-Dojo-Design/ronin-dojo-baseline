import type { MetadataRoute } from "next"
import { Brand } from "~/.generated/prisma/client"
import { buildAbsoluteUrl, getRequestOrigin } from "~/lib/request-url"
import { sitemapRoutesForBrand } from "~/config/seo"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await getRequestOrigin()
  const now = new Date()

  return sitemapRoutesForBrand(Brand.BBL).map(route => ({
    url: buildAbsoluteUrl(route.path, origin),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
