import { createSerializer, type inferParserType, parseAsString } from "nuqs/server"
import { siteConfig } from "~/config/site"

export const openGraphSearchParams = {
  title: parseAsString,
  description: parseAsString,
  faviconUrl: parseAsString,
}

export type OpenGraphParams = Partial<inferParserType<typeof openGraphSearchParams>>

/**
 * Get the URL for the OpenGraph image.
 * @param name - The name of the tool.
 * @param description - The description of the tool.
 * @param faviconUrl - The URL of the favicon.
 * @returns The URL for the OpenGraph image.
 */
export const getOpenGraphImageUrl = (params: Record<string, string | null | undefined>) => {
  const serialize = createSerializer(openGraphSearchParams)
  const searchParams = serialize(params)

  return `${siteConfig.url}/api/og${searchParams}`
}
