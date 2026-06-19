import { headers } from "next/headers"
import { Brand } from "~/.generated/prisma/client"

/**
 * Single source of truth for host -> Brand resolution.
 *
 * Single-brand collapse: every request is BBL. HOST_TO_BRAND and resolveBrand
 * are kept for edge-safe usage but always resolve to Brand.BBL. getRequestBrand
 * returns Brand.BBL unconditionally — no header injection, no host switching.
 *
 * Rule: never re-implement this map elsewhere. MB-002 brand-scope hardening
 * depends on a single resolution path.
 */

export const HOST_TO_BRAND: Record<string, Brand> = {
  "blackbeltlegacy.com": Brand.BBL,
  "bbl.local": Brand.BBL,
  localhost: Brand.BBL,
}

export const DEFAULT_BRAND: Brand = Brand.BBL

/**
 * Origins Better Auth must trust.
 *
 * ADR 0004/0006: Better Auth defaults to trusting only `BETTER_AUTH_URL`'s host,
 * so auth requests from a non-default brand host fail the origin check. Listing
 * trusted origins explicitly fixes magic-link callbackURL validation and OAuth
 * redirects.
 */
export const BRAND_TRUSTED_ORIGINS: string[] = [
  "https://blackbeltlegacy.com",
  "http://bbl.local:3000",
  "http://bbl.local",
  "http://localhost:3000",
]

/** Edge-safe: always returns Brand.BBL (single-brand deployment). */
export const resolveBrand = (_host?: string | null): Brand => Brand.BBL

/** Edge-safe: derive an absolute request origin from forwarded headers. */
export const resolveRequestOrigin = (requestHeaders: Headers) => {
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")
  if (!host) return null

  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")
  let protocol: string
  if (forwardedProtocol) {
    protocol = forwardedProtocol.split(",")[0]?.trim() || "https"
  } else {
    const normalizedHost = host.toLowerCase()
    protocol =
      normalizedHost.startsWith("localhost") ||
      normalizedHost.startsWith("127.0.0.1") ||
      normalizedHost.includes(".local")
        ? "http"
        : "https"
  }

  return `${protocol}://${host}`
}

/** Always returns Brand.BBL — single-brand deployment. */
export const getRequestBrand = async (): Promise<Brand> => Brand.BBL

export const getRequestOrigin = async () => {
  return resolveRequestOrigin(await headers())
}
