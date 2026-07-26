import { createSerializer, type inferParserType, parseAsString } from "nuqs/server"
import { siteConfig } from "~/config/site"

const openGraphSearchParams = {
  title: parseAsString,
  description: parseAsString,
  faviconUrl: parseAsString,
}

export type OpenGraphParams = Partial<inferParserType<typeof openGraphSearchParams>>

/**
 * Celebration-card params (SESSION_0705, PL-027 renderer graduation) — the `/api/og`
 * `card=rank-promotion` variant. Absent on ordinary OG URLs; when present (and valid per
 * `parsePromotionCardParams`), the route renders the belt-colored `OgPromotionCard` instead
 * of the generic `OgBase`. Kept alongside the base params so there is ONE og URL contract.
 */
const promotionCardSearchParams = {
  card: parseAsString,
  name: parseAsString,
  beltName: parseAsString,
  beltColorHex: parseAsString,
  date: parseAsString,
  lineageLine: parseAsString,
}

/** The full `/api/og` search-param vocabulary: base OG params + the promotion-card variant. */
export const ogImageSearchParams = {
  ...openGraphSearchParams,
  ...promotionCardSearchParams,
}

/**
 * Get the URL for the OpenGraph image.
 * @param params - Base OG params (title/description/faviconUrl) and, optionally, the
 *   promotion-card variant params. Unknown keys are dropped by the serializer.
 * @returns The URL for the OpenGraph image.
 */
export const getOpenGraphImageUrl = (
  params: Record<string, string | null | undefined>,
  origin = siteConfig.url,
) => {
  const serialize = createSerializer(ogImageSearchParams)
  const searchParams = serialize(params)

  return `${origin}/api/og${searchParams}`
}
