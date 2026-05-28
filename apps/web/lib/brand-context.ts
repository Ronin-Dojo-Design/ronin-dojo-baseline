import { headers } from "next/headers"
import { Brand } from "~/.generated/prisma/client"

/**
 * Single source of truth for host -> Brand resolution.
 *
 * - `HOST_TO_BRAND` and `resolveBrand` are edge-safe (no `next/headers`) and
 *   are imported by `proxy.ts` (Next.js middleware).
 * - `getRequestBrand` is server-action / server-component only and reads the
 *   `x-brand` header that `proxy.ts` injects, falling back to host parsing if
 *   the middleware did not run for this request path.
 *
 * Rule: never re-implement this map elsewhere. Importers must come back here.
 * MB-002 brand-scope hardening depends on a single resolution path.
 */

export const HOST_TO_BRAND: Record<string, Brand> = {
  // Production / public domains
  "ronindojodesign.com": Brand.RONIN_DOJO_DESIGN,
  "baselinemartialarts.com": Brand.BASELINE_MARTIAL_ARTS,
  "blackbeltlegacy.com": Brand.BBL,
  "wekafusa.com": Brand.WEKAF,

  // Local dev convention
  "ronindojo.local": Brand.RONIN_DOJO_DESIGN,
  "baseline.local": Brand.BASELINE_MARTIAL_ARTS,
  "bbl.local": Brand.BBL,
  "wekaf.local": Brand.WEKAF,

  // localhost defaults to Baseline during MVP build
  localhost: Brand.BASELINE_MARTIAL_ARTS,
}

export const DEFAULT_BRAND: Brand = Brand.RONIN_DOJO_DESIGN

const BRANDS = new Set<string>(Object.values(Brand))

const isBrand = (value: string | null | undefined): value is Brand => {
  return !!value && BRANDS.has(value)
}

const getHeaderHost = (requestHeaders: Headers) => {
  return requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")
}

const getHeaderProtocol = (requestHeaders: Headers, host: string) => {
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")
  if (forwardedProtocol) return forwardedProtocol.split(",")[0]?.trim() || "https"

  const normalizedHost = host.toLowerCase()
  if (
    normalizedHost.startsWith("localhost") ||
    normalizedHost.startsWith("127.0.0.1") ||
    normalizedHost.includes(".local")
  ) {
    return "http"
  }

  return "https"
}

/** Edge-safe: derive brand from a raw host string. Used by middleware. */
export const resolveBrand = (host: string | null | undefined): Brand => {
  if (!host) return DEFAULT_BRAND
  const bare = host
    .split(":")[0]
    ?.toLowerCase()
    .replace(/^www\./, "")
  return (bare && HOST_TO_BRAND[bare]) || DEFAULT_BRAND
}

/** Edge-safe: derive an absolute request origin from forwarded headers. */
export const resolveRequestOrigin = (requestHeaders: Headers) => {
  const host = getHeaderHost(requestHeaders)
  if (!host) return null

  return `${getHeaderProtocol(requestHeaders, host)}://${host}`
}

/**
 * Resolve the brand for the current server request.
 *
 * The middleware injects `x-brand` after host resolution and overwrites any
 * client-supplied value, so this header is trusted. If the header is missing
 * (request path excluded from the middleware matcher), we fall back to host
 * parsing — but production audit should treat that as a code smell.
 */
export const getRequestBrand = async (): Promise<Brand> => {
  const requestHeaders = await headers()
  const headerBrand = requestHeaders.get("x-brand")

  if (isBrand(headerBrand)) {
    return headerBrand
  }

  return resolveBrand(requestHeaders.get("host"))
}

export const getRequestOrigin = async () => {
  return resolveRequestOrigin(await headers())
}
