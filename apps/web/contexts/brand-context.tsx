"use client"

import { createContext, type PropsWithChildren, useContext } from "react"
import type { Brand } from "~/.generated/prisma/client"
import { getBrandSiteConfig } from "~/config/site"

type BrandContextValue = {
  brand: Brand
  name: string
  slug: string
  tagline: string
  description: string
  logoSrc: string
  faviconSrc: string
  ogImageSrc: string
  /**
   * DB-driven brand logo (`BrandSettings.logoUrl`), or null when the brand has
   * not uploaded one. Prefer this over the static `logoSrc` for chrome surfaces
   * (header / drawer) so an operator's uploaded mark — e.g. the BBL white logo —
   * is honored without a hardcoded asset path. Falls back to `logoSrc` in the
   * `<Logo>` primitive when null.
   */
  logoUrl: string | null
}

const BrandContext = createContext<BrandContextValue | null>(null)

/**
 * Read the active brand in any client component.
 *
 * The value is injected by `<BrandProvider>` in the root server layout (the
 * single-brand collapse resolves it to `Brand.BBL`). This avoids the need for
 * client components to call server-only APIs or parse cookies directly.
 */
export const useBrand = (): BrandContextValue => {
  const ctx = useContext(BrandContext)
  if (!ctx) {
    throw new Error("useBrand must be used within a <BrandProvider>")
  }
  return ctx
}

/**
 * Provider that surfaces the resolved brand to all client components.
 *
 * Usage (in a server layout):
 * ```tsx
 * <BrandProvider brand={Brand.BBL}>{children}</BrandProvider>
 * ```
 */
export const BrandProvider = ({
  brand,
  logoUrl = null,
  children,
}: PropsWithChildren<{ brand: Brand; logoUrl?: string | null }>) => {
  const config = getBrandSiteConfig(brand)
  const value: BrandContextValue = {
    brand,
    name: config.name,
    slug: config.slug,
    tagline: config.tagline,
    description: config.description,
    logoSrc: config.logoSrc,
    faviconSrc: config.faviconSrc,
    ogImageSrc: config.ogImageSrc,
    logoUrl,
  }

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
}
