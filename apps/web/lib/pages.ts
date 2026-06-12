import type { Metadata } from "next"
import type { Thing } from "schema-dts"
import { getMetadataConfig } from "~/config/metadata"
import { getRequestBrand } from "~/lib/brand-context"
import { getOpenGraphImageUrl, type OpenGraphParams } from "~/lib/opengraph"
import { getRequestOrigin } from "~/lib/request-url"
import {
  createGraph,
  generateBreadcrumbs,
  generateWebPage,
  getOrganization,
  getWebSite,
} from "~/lib/structured-data"

type DataOptions = {
  metadata?: Metadata
  breadcrumbs?: { url: string; title: string }[]
  structuredData?: Thing[]
}

/**
 * Creates page metadata, breadcrumbs, and structured data for a page.
 * Resolves the request brand internally for JSON-LD organization/website names.
 */
export const getPageData = async (
  url: string,
  title: string,
  description: string,
  options?: DataOptions,
) => {
  const brand = await getRequestBrand()
  const metadata = { ...options?.metadata, title, description }
  const breadcrumbs = options?.breadcrumbs ?? []

  const structuredData = createGraph([
    getOrganization(brand),
    getWebSite(brand),
    generateWebPage(url, title, description),
    generateBreadcrumbs(options?.breadcrumbs ?? []),
    ...(options?.structuredData ?? []),
  ])

  return { url, metadata, breadcrumbs, structuredData }
}

type GetPageMetadataProps = {
  url: string
  ogImage?: OpenGraphParams
  metadata?: Metadata
}

/**
 * Get the metadata for a page.
 * Resolves the request brand internally for og:site_name.
 */
export const getPageMetadata = async ({ url, ogImage, metadata }: GetPageMetadataProps) => {
  const brand = await getRequestBrand()
  const origin = await getRequestOrigin()
  const defaultMetadata = Object.assign({}, getMetadataConfig(brand), metadata)
  const { title, description, alternates, openGraph, twitter, ...rest } = defaultMetadata
  const ogTitle = String(title)
  const ogDescription = typeof description === "string" ? description : undefined
  const ogImageUrl = getOpenGraphImageUrl(
    ogImage ?? { title: ogTitle, description: ogDescription },
    origin,
  )

  return {
    title,
    description,
    alternates: { ...alternates, canonical: url },
    openGraph: {
      ...openGraph,
      title: ogTitle,
      description: ogDescription,
      url,
      images: [{ url: ogImageUrl }],
    },
    twitter: { ...twitter, title: ogTitle, description: ogDescription, images: [ogImageUrl] },
    ...rest,
  }
}
