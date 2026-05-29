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
}

const BrandContext = createContext<BrandContextValue | null>(null)

/**
 * Read the active brand in any client component.
 *
 * The value is injected by `<BrandProvider>` in the root server layout
 * after `getRequestBrand()` resolves the brand from the middleware-set
 * `x-brand` header. This avoids the need for client components to call
 * server-only APIs or parse cookies directly.
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
 * const brand = await getRequestBrand()
 * <BrandProvider brand={brand}>{children}</BrandProvider>
 * ```
 */
export const BrandProvider = ({ brand, children }: PropsWithChildren<{ brand: Brand }>) => {
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
  }

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
}
