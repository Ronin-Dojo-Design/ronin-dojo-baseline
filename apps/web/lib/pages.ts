import type { Metadata } from "next"
import type { Thing } from "schema-dts"
import { metadataConfig } from "~/config/metadata"
import { getOpenGraphImageUrl, type OpenGraphParams } from "~/lib/opengraph"
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
 * Creates page metadata, breadcrumbs, and structured data for a page
 * @param url - The URL of the page
 * @param title - The title of the page
 * @param description - The description of the page
 * @param options - Optional metadata, breadcrumbs, and structured data
 */
export const getPageData = (
  url: string,
  title: string,
  description: string,
  options?: DataOptions,
) => {
  const metadata = { ...options?.metadata, title, description }
  const breadcrumbs = options?.breadcrumbs ?? []

  const structuredData = createGraph([
    getOrganization(),
    getWebSite(),
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
 * Get the metadata for a page
 * @param url - The URL of the page
 * @param title - The title of the page
 * @param description - The description of the page
 * @param metadata - The metadata for the page
 */
export const getPageMetadata = ({ url, ogImage, metadata }: GetPageMetadataProps) => {
  const defaultMetadata = Object.assign({}, metadataConfig, metadata)
  const { title, description, alternates, openGraph, ...rest } = defaultMetadata
  const ogImageUrl = getOpenGraphImageUrl(ogImage ?? { title: String(title), description })

  return {
    title,
    description,
    alternates: { ...alternates, canonical: url },
    openGraph: { ...openGraph, url, images: [{ url: ogImageUrl }] },
    ...rest,
  }
}
