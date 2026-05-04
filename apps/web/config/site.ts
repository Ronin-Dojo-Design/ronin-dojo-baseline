import { getDomain } from "@primoui/utils"
import type { Brand } from "~/.generated/prisma/client"
import { env } from "~/env"

type BrandSiteConfig = {
  name: string
  slug: string
  tagline: string
  description: string
  email: string
  url: string
  domain: string
}

const brandConfigs: Record<Brand, Pick<BrandSiteConfig, "name" | "slug" | "tagline" | "description">> = {
  BASELINE_MARTIAL_ARTS: {
    name: "Baseline Martial Arts",
    slug: "baseline-martial-arts",
    tagline: "Train Smart. Fight Ready. Community First.",
    description: "A modern martial arts school platform for programs, tournaments, belt testing, and community.",
  },
  RONIN_DOJO_DESIGN: {
    name: "Ronin Dojo Design",
    slug: "ronin-dojo-design",
    tagline: "White-Label Dojo Management, Built for Growth.",
    description: "The platform behind every dojo. Multi-brand martial arts SaaS for school owners and organizations.",
  },
  BBL: {
    name: "Black Belt Legacy",
    slug: "black-belt-legacy",
    tagline: "Honor the Lineage. Build the Future.",
    description: "Preserving martial arts heritage through lineage tracking, curriculum, and certifications.",
  },
  WEKAF: {
    name: "WEKAF USA",
    slug: "wekaf-usa",
    tagline: "World Eskrima Kali Arnis Federation — USA Chapter.",
    description: "Official tournament management, athlete registration, and rankings for Filipino martial arts.",
  },
}

/**
 * Get brand-specific site config. Use this in server components/actions
 * where you have the brand from `getRequestBrand()`.
 */
export const getBrandSiteConfig = (brand: Brand): BrandSiteConfig => {
  const brandConfig = brandConfigs[brand]
  return {
    ...brandConfig,
    email: env.NEXT_PUBLIC_SITE_EMAIL,
    url: env.NEXT_PUBLIC_SITE_URL,
    domain: getDomain(env.NEXT_PUBLIC_SITE_URL),
  }
}

/**
 * Default site config — backward compatible. Falls back to Baseline Martial Arts
 * for contexts where brand isn't resolved yet (static imports, build-time).
 */
export const siteConfig = {
  name: "Baseline Martial Arts",
  slug: "baseline-martial-arts",
  email: env.NEXT_PUBLIC_SITE_EMAIL,
  url: env.NEXT_PUBLIC_SITE_URL,
  domain: getDomain(env.NEXT_PUBLIC_SITE_URL),
}
