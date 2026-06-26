import type { MetadataRoute } from "next"
import type { Brand } from "~/.generated/prisma/client"

type StaticRoute = {
  path: string
  priority: number
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>
}

const STATIC_SITEMAP_ROUTES: readonly StaticRoute[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/lineage", priority: 0.9, changeFrequency: "daily" },
  { path: "/lineage/join", priority: 0.8, changeFrequency: "weekly" },
  { path: "/directory", priority: 0.8, changeFrequency: "daily" },
  { path: "/members", priority: 0.7, changeFrequency: "daily" },
  { path: "/schools", priority: 0.75, changeFrequency: "daily" },
  { path: "/organizations", priority: 0.7, changeFrequency: "daily" },
  { path: "/organizations/new", priority: 0.45, changeFrequency: "monthly" },
  { path: "/events", priority: 0.65, changeFrequency: "daily" },
  { path: "/posts", priority: 0.65, changeFrequency: "daily" },
  { path: "/blog", priority: 0.65, changeFrequency: "daily" },
  { path: "/curriculum", priority: 0.75, changeFrequency: "weekly" },
  { path: "/techniques", priority: 0.75, changeFrequency: "weekly" },
  { path: "/techniques/graph", priority: 0.7, changeFrequency: "weekly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.2, changeFrequency: "yearly" },
]

// Single-brand collapse (SESSION_0447): BBL ships every feature, so the sitemap is
// the full static route set and robots disallows no feature routes. The `_brand`
// param is retained until the gated Stage-2 `Brand` enum drop.
export const sitemapRoutesForBrand = (_brand: Brand) => STATIC_SITEMAP_ROUTES

export const robotsDisallowRoutesForBrand = (_brand: Brand): string[] => []
