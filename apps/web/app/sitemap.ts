import type { MetadataRoute } from "next"
import { getRequestBrand } from "~/lib/brand-context"
import { buildAbsoluteUrl, getRequestOrigin } from "~/lib/request-url"
import { sitemapRoutesForBrand } from "~/config/seo"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [brand, origin] = await Promise.all([getRequestBrand(), getRequestOrigin()])
  const now = new Date()

  return sitemapRoutesForBrand(brand).map(route => ({
    url: buildAbsoluteUrl(route.path, origin),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
