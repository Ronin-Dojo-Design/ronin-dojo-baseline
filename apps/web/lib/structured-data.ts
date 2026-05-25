import type {
  AboutPage,
  AggregateRating,
  Article,
  Blog,
  BreadcrumbList,
  CollectionPage,
  FAQPage,
  Graph,
  ItemList,
  Organization,
  SoftwareApplication,
  WebPage,
  WebSite,
} from "schema-dts"
import { siteConfig } from "~/config/site"
import type { ToolMany, ToolOne } from "~/server/web/tools/payloads"

export interface ArticleData {
  title: string
  description?: string | null
  publishedAt?: Date | null
  updatedAt: Date
  author?: { name: string } | null
  imageUrl?: string | null
  content: string
}

type StructuredDataListItem = {
  name: string
  url: string
  description?: string | null
  id?: string
  provider?: StructuredDataEntityReference | null
  creator?: StructuredDataEntityReference | StructuredDataEntityReference[] | null
  about?: StructuredDataEntityReference | StructuredDataEntityReference[] | null
  address?: StructuredDataPostalAddress | null
}

type GenericStructuredDataType = "Thing" | "CreativeWork" | "Course" | "Organization" | "WebPage"
type StructuredDataEntityType = GenericStructuredDataType | "Person"

export type StructuredDataEntityReference = {
  "@type"?: StructuredDataEntityType
  "@id": string
  name?: string
  url?: string
}

export type StructuredDataPostalAddress = {
  streetAddress?: string | null
  addressLocality?: string | null
  addressRegion?: string | null
  postalCode?: string | null
  addressCountry?: string | null
}

type StructuredDataEntityInput = {
  type: StructuredDataEntityType
  url: string
  name: string
  description?: string | null
  id?: string
  fragment?: string
  provider?: StructuredDataEntityReference | null
  creator?: StructuredDataEntityReference | StructuredDataEntityReference[] | null
  about?: StructuredDataEntityReference | StructuredDataEntityReference[] | null
  address?: StructuredDataPostalAddress | null
}

type StructuredDataPageOptions = {
  id?: string
  breadcrumb?: StructuredDataEntityReference | null
  isPartOf?: StructuredDataEntityReference | null
  provider?: StructuredDataEntityReference | null
  creator?: StructuredDataEntityReference | StructuredDataEntityReference[] | null
  about?: StructuredDataEntityReference | StructuredDataEntityReference[] | null
  mainEntity?: StructuredDataEntityReference | null
}

/**
 * Converts relative URL to absolute URL
 */
const toAbsoluteUrl = (path: string): string => {
  return path.startsWith("http") ? path : `${siteConfig.url}${path}`
}

const toSchemaFragment = (value: string) => {
  return value.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
}

export const generateSchemaId = (url: string, fragment: string): string => {
  return `${toAbsoluteUrl(url)}#${fragment}`
}

const getDefaultWebSiteReference = (): StructuredDataEntityReference => ({
  "@id": `${siteConfig.url}/#/schema/website/1`,
})

const normalizeEntityReference = (
  value?: StructuredDataEntityReference | null,
): StructuredDataEntityReference | undefined => {
  if (!value) return undefined

  return {
    ...value,
    url: value.url ? toAbsoluteUrl(value.url) : undefined,
  }
}

const normalizeEntityReferences = (
  value?: StructuredDataEntityReference | StructuredDataEntityReference[] | null,
): StructuredDataEntityReference | StructuredDataEntityReference[] | undefined => {
  if (!value) return undefined

  if (Array.isArray(value)) {
    const normalized = value
      .map(item => normalizeEntityReference(item))
      .filter((item): item is StructuredDataEntityReference => Boolean(item))
    return normalized.length > 0 ? normalized : undefined
  }

  return normalizeEntityReference(value)
}

const normalizePostalAddress = (address?: StructuredDataPostalAddress | null) => {
  if (!address) return undefined

  const normalized = {
    "@type": "PostalAddress",
    ...(address.streetAddress && { streetAddress: address.streetAddress }),
    ...(address.addressLocality && { addressLocality: address.addressLocality }),
    ...(address.addressRegion && { addressRegion: address.addressRegion }),
    ...(address.postalCode && { postalCode: address.postalCode }),
    ...(address.addressCountry && { addressCountry: address.addressCountry }),
  }

  return Object.keys(normalized).length > 1 ? normalized : undefined
}

export const generateSchemaReference = (
  type: StructuredDataEntityType,
  url: string,
  name: string,
  fragment = toSchemaFragment(type),
): StructuredDataEntityReference => {
  const absoluteUrl = toAbsoluteUrl(url)
  return {
    "@type": type,
    "@id": `${absoluteUrl}#${fragment}`,
    name,
    url: absoluteUrl,
  }
}

export const generateStructuredDataEntity = ({
  type,
  url,
  name,
  description,
  id,
  fragment,
  provider,
  creator,
  about,
  address,
}: StructuredDataEntityInput) => {
  const absoluteUrl = toAbsoluteUrl(url)

  return {
    "@type": type,
    "@id": id ?? `${absoluteUrl}#${fragment ?? toSchemaFragment(type)}`,
    name,
    url: absoluteUrl,
    description: description || undefined,
    provider: normalizeEntityReference(provider),
    creator: normalizeEntityReferences(creator),
    about: normalizeEntityReferences(about),
    address: normalizePostalAddress(address),
  }
}

const getPageRelationshipFields = (
  absoluteUrl: string,
  options: StructuredDataPageOptions = {},
) => ({
  "@id": options.id ?? `${absoluteUrl}#collection`,
  isPartOf: normalizeEntityReference(options.isPartOf) ?? getDefaultWebSiteReference(),
  breadcrumb:
    options.breadcrumb === null
      ? undefined
      : (normalizeEntityReference(options.breadcrumb) ?? { "@id": `${absoluteUrl}#breadcrumb` }),
  provider: normalizeEntityReference(options.provider),
  creator: normalizeEntityReferences(options.creator),
  about: normalizeEntityReferences(options.about),
  mainEntity: normalizeEntityReference(options.mainEntity),
})

/**
 * Generates a random rating between 4.5 and 5.0
 */
export const generateRating = (seed: string): number => {
  const hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const normalized = (hash % 50) / 100 // 0 to 0.5
  return Math.round((4.5 + normalized) * 10) / 10 // 4.5 to 5.0, rounded to 1 decimal
}

/**
 * Generates a random review count between 100 and 1000
 */
export const generateReviewCount = (seed: string): number => {
  const hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const baseCount = 100 + (hash % 900) // 100 to 1000

  return baseCount
}

/**
 * Gets the organization schema reference
 */
export const getOrganization = (): Organization => ({
  "@type": "Organization",
  "@id": `${siteConfig.url}/#/schema/organization/1`,
  name: siteConfig.name,
  url: siteConfig.url,
})

/**
 * Gets the website schema reference
 */
export const getWebSite = (): WebSite => ({
  "@type": "WebSite",
  "@id": `${siteConfig.url}/#/schema/website/1`,
  name: siteConfig.name,
  url: siteConfig.url,
})

/**
 * Generates breadcrumb list schema with automatic ID
 */
export const generateBreadcrumbs = (
  items: Array<{ title: string; url: string }>,
): BreadcrumbList => {
  const lastUrl = items[items.length - 1]?.url || ""
  const absoluteLastUrl = toAbsoluteUrl(lastUrl)
  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteLastUrl}#breadcrumb`,
    itemListElement: [{ url: siteConfig.url, title: "Home" }, ...items].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.title,
      item: toAbsoluteUrl(item.url),
    })),
  }
}

/**
 * Generates aggregate rating schema
 */
export const generateAggregateRating = (
  tool: ToolOne | { name: string; stars?: number },
): AggregateRating => {
  const rating = generateRating(tool.name)
  const reviewCount = generateReviewCount(tool.name)

  return {
    "@type": "AggregateRating",
    ratingValue: rating.toString(),
    bestRating: "5",
    ratingCount: reviewCount,
  }
}

/**
 * Generates software application schema for a tool
 */
export const generateSoftwareApplication = (tool: ToolOne | ToolMany): SoftwareApplication => {
  const toolUrl = toAbsoluteUrl(`/${tool.slug}`)
  const schema: SoftwareApplication = {
    "@type": "SoftwareApplication",
    "@id": `${toolUrl}#software`,
    name: tool.name,
    url: toolUrl,
    description: tool.description || tool.tagline || undefined,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Windows, macOS, Linux, Web",
    aggregateRating: generateAggregateRating(tool),
    publisher: getOrganization(),
  }

  // Add screenshots (only on ToolOne)
  if ("screenshotUrl" in tool && tool.screenshotUrl) {
    schema.screenshot = {
      "@type": "ImageObject",
      url: tool.screenshotUrl,
      width: "1280",
      height: "720",
    }
  }

  // Add logo/icon
  if (tool.faviconUrl) {
    schema.image = tool.faviconUrl
  }

  return schema
}

/**
 * Generates collection page schema
 */
export const generateCollectionPage = (
  url: string,
  name: string,
  description?: string,
  options: StructuredDataPageOptions = {},
): CollectionPage => {
  const absoluteUrl = toAbsoluteUrl(url)
  return {
    "@type": "CollectionPage",
    ...getPageRelationshipFields(absoluteUrl, options),
    url: absoluteUrl,
    name,
    description,
  } as CollectionPage
}

/**
 * Generates collection page schema with items
 */
export const generateCollectionPageWithItems = (
  url: string,
  name: string,
  description: string | null,
  items: StructuredDataListItem[],
  options: StructuredDataPageOptions = {},
): CollectionPage => {
  const absoluteUrl = toAbsoluteUrl(url)
  return {
    "@type": "CollectionPage",
    ...getPageRelationshipFields(absoluteUrl, options),
    name,
    description: description || undefined,
    url: absoluteUrl,
    hasPart: items.map(item => ({
      "@type": "SoftwareApplication",
      name: item.name,
      url: toAbsoluteUrl(item.url),
      description: item.description || undefined,
    })),
  } as CollectionPage
}

/**
 * Generates collection page schema with generic non-tool items.
 *
 * Keep `generateCollectionPageWithItems` for real Tool/SoftwareApplication
 * collections. Martial arts pages such as lineage, programs, and organizations
 * should not advertise their cards as software.
 */
export const generateCollectionPageWithGenericItems = (
  url: string,
  name: string,
  description: string | null,
  items: StructuredDataListItem[],
  itemType: GenericStructuredDataType = "Thing",
  options: StructuredDataPageOptions = {},
): CollectionPage => {
  const absoluteUrl = toAbsoluteUrl(url)
  return {
    "@type": "CollectionPage",
    ...getPageRelationshipFields(absoluteUrl, options),
    name,
    description: description || undefined,
    url: absoluteUrl,
    hasPart: items.map(item =>
      generateStructuredDataEntity({
        type: itemType,
        url: item.url,
        name: item.name,
        description: item.description,
        id: item.id,
        provider: item.provider,
        creator: item.creator,
        about: item.about,
        address: item.address,
      }),
    ),
  } as CollectionPage
}

/**
 * Generates item list schema
 */
export const generateItemList = (items: StructuredDataListItem[], name?: string): ItemList => ({
  "@type": "ItemList",
  name,
  numberOfItems: items.length,
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "SoftwareApplication",
      name: item.name,
      url: toAbsoluteUrl(item.url),
      description: item.description || undefined,
    },
  })),
})

/**
 * Generates item list schema for non-tool collections.
 */
export const generateGenericItemList = (
  items: StructuredDataListItem[],
  name?: string,
  itemType: GenericStructuredDataType = "Thing",
): ItemList =>
  ({
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: generateStructuredDataEntity({
        type: itemType,
        url: item.url,
        name: item.name,
        description: item.description,
        id: item.id,
        provider: item.provider,
        creator: item.creator,
        about: item.about,
        address: item.address,
      }),
    })),
  }) as ItemList

/**
 * Generates FAQ schema
 */
export const generateFAQ = (questions: Array<{ question: string; answer: string }>): FAQPage => ({
  "@type": "FAQPage",
  mainEntity: questions.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  })),
})

/**
 * Generates article/blog posting schema
 */
export const generateArticle = (url: string, post: ArticleData): Article => {
  const { title, description, publishedAt, author, imageUrl, content } = post

  return {
    "@type": "Article",
    headline: title,
    description: description || undefined,
    url: toAbsoluteUrl(url),
    datePublished: publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    publisher: getOrganization(),
    author: author
      ? {
          "@type": "Person",
          name: author.name,
        }
      : getOrganization(),
    image: imageUrl
      ? {
          "@type": "ImageObject",
          url: imageUrl,
          width: "1200",
          height: "630",
        }
      : undefined,
    wordCount: content.split(/\s+/).length,
    inLanguage: "en-US",
  }
}

/**
 * Generates WebPage schema
 */
export const generateWebPage = (
  url: string,
  name: string,
  description?: string | null,
  aboutId?: string,
): WebPage => {
  const absoluteUrl = toAbsoluteUrl(url)
  return {
    "@type": "WebPage",
    "@id": absoluteUrl,
    url: absoluteUrl,
    name,
    description: description || undefined,
    isPartOf: { "@id": `${siteConfig.url}/#/schema/website/1` },
    breadcrumb: { "@id": `${absoluteUrl}#breadcrumb` },
    ...(aboutId && { about: { "@id": aboutId } }),
    inLanguage: "en-US",
  }
}

/**
 * Generates blog schema (for blog listing pages)
 */
export const generateBlog = (
  url: string,
  name: string,
  description: string | undefined,
  posts: Array<{
    title: string
    description?: string | null
    slug: string
    publishedAt?: Date | null
  }>,
): Blog => {
  const absoluteUrl = toAbsoluteUrl(url)
  return {
    "@type": "Blog",
    "@id": absoluteUrl,
    url: absoluteUrl,
    name,
    description,
    blogPost: posts.slice(0, 10).map(post => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description || undefined,
      url: toAbsoluteUrl(`/blog/${post.slug}`),
      datePublished: post.publishedAt?.toISOString(),
    })),
  }
}

/**
 * Generates about page schema
 */
export const generateAboutPage = (url: string, name: string, description?: string): AboutPage => {
  const absoluteUrl = toAbsoluteUrl(url)
  return {
    "@type": "AboutPage",
    "@id": `${absoluteUrl}#aboutpage`,
    url: absoluteUrl,
    name,
    description,
  }
}

/**
 * Helper to create a graph of multiple schemas
 */
export const createGraph = (schemas: Array<any>): Graph => ({
  "@context": "https://schema.org",
  "@graph": schemas,
})
