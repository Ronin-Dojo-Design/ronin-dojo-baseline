import type { MetadataRoute } from "next"
import type { Brand } from "~/.generated/prisma/client"
import { brandHasFeature, type BrandFeature, FEATURE_ROUTE_PREFIXES } from "~/config/brand-features"

type StaticRoute = {
  path: string
  feature?: BrandFeature
  priority: number
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>
}

const STATIC_SITEMAP_ROUTES: readonly StaticRoute[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/lineage", feature: "lineage", priority: 0.9, changeFrequency: "daily" },
  { path: "/lineage/join", feature: "lineage", priority: 0.8, changeFrequency: "weekly" },
  { path: "/directory", feature: "directory", priority: 0.8, changeFrequency: "daily" },
  { path: "/members", feature: "members", priority: 0.7, changeFrequency: "daily" },
  { path: "/schools", feature: "schools", priority: 0.75, changeFrequency: "daily" },
  { path: "/organizations", feature: "organizations", priority: 0.7, changeFrequency: "daily" },
  {
    path: "/organizations/new",
    feature: "organizations",
    priority: 0.45,
    changeFrequency: "monthly",
  },
  { path: "/events", feature: "events", priority: 0.65, changeFrequency: "daily" },
  { path: "/posts", feature: "posts", priority: 0.65, changeFrequency: "daily" },
  { path: "/blog", feature: "blog", priority: 0.65, changeFrequency: "daily" },
  { path: "/curriculum", feature: "curriculum", priority: 0.75, changeFrequency: "weekly" },
  { path: "/techniques", feature: "techniques", priority: 0.75, changeFrequency: "weekly" },
  {
    path: "/techniques/graph",
    feature: "techniques",
    priority: 0.7,
    changeFrequency: "weekly",
  },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.2, changeFrequency: "yearly" },
]

export const sitemapRoutesForBrand = (brand: Brand) =>
  STATIC_SITEMAP_ROUTES.filter(route => !route.feature || brandHasFeature(brand, route.feature))

export const robotsDisallowRoutesForBrand = (brand: Brand) =>
  FEATURE_ROUTE_PREFIXES.filter(([, feature]) => !brandHasFeature(brand, feature)).map(
    ([route]) => `${route}/`,
  )
