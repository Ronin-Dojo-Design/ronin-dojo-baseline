import dynamic from "next/dynamic"
import { Brand } from "~/.generated/prisma/client"
import { getBrandSiteConfig } from "~/config/site"
import { bblBodyFont as bodyFont, bblHeadingFont as headingFont } from "~/lib/fonts"
import { cx } from "~/lib/utils"
import { findBrandSettings } from "~/server/admin/brand-settings/queries"
import { BblReveal } from "../bbl-reveal"
import { BblCelebration } from "./bbl-celebration"
import { BblFaq } from "./bbl-faq"
import { BblFeatures } from "./bbl-features"
import { BblFinalCta } from "./bbl-final-cta"
import { BblHeritage } from "./bbl-heritage"
import { BblHero } from "./bbl-hero"
import { BblPromos } from "./bbl-promos"
import { getStaticBblRankColors } from "./bbl-rank-colors"
import { getPromotionMarqueeRows } from "./bbl-promotion-marquee-data"
import { BblRedBeltCelebration } from "./bbl-red-belt-celebration"
import { BblTestimonials } from "./bbl-testimonials"
import { BblTimeline } from "./bbl-timeline"
import { BblTreeTeaser } from "./bbl-tree-teaser"
import { BblValueProps } from "./bbl-value-props"
import { dirtyDozen, heritageContent, heroContent, timeline } from "../bbl-landing-content"

/**
 * Black Belt Legacy landing page — the colocated folder module's public barrel
 * (component-launch-sweep recipe). Content/IA from the legacy
 * `BlackBeltLegacyLanding.jsx`, rebuilt on current primitives with brand tokens
 * (brand colors resolve from `BrandSettings` via `app/layout.tsx`; belt colors are
 * `Rank.colorHex` data via `<BeltSwatch>`). Rendered by the home page only when the
 * request brand is BBL.
 *
 * Thin orchestrator: it fetches on-the-wire data (marquee rosters + `BrandSettings`),
 * composes the extracted section files, and lazy-loads the heavy below-the-fold
 * sections — it owns no section presentation itself. One section per file.
 */

// Lazy boundaries: the heaviest below-the-fold sections — the two embla carousels
// (Dirty Dozen, promotion marquee) and the YouTube embed — only load their chunk
// once reached. The hero (above the fold) stays eager. SSR is kept (no `ssr: false`)
// so the marketing content still server-renders for SEO.
const BblVideo = dynamic(() => import("./bbl-video").then(m => m.BblVideo))
const BblDirtyDozen = dynamic(() => import("./bbl-dirty-dozen").then(m => m.BblDirtyDozen))
const BblPromotionMarquee = dynamic(() =>
  import("./bbl-promotion-marquee").then(m => m.BblPromotionMarquee),
)

export const BblLanding = async () => {
  const staticRankLabels = [
    heroContent.card.badge,
    heritageContent.badge,
    ...dirtyDozen.map(member => member.rank),
    ...timeline.map(entry => entry.rank),
  ]

  const [marqueeRows, brandSettings, staticRankColors] = await Promise.all([
    getPromotionMarqueeRows(),
    findBrandSettings(Brand.BBL),
    getStaticBblRankColors(staticRankLabels),
  ])
  const brandLogoUrl = brandSettings?.logoUrl ?? null
  const brandName = getBrandSiteConfig(Brand.BBL).name

  const sections = [
    <BblHero key="hero" rankColors={staticRankColors} />,
    <BblVideo key="video" />,
    <BblDirtyDozen key="dirty-dozen" rankColors={staticRankColors} />,
    <BblHeritage key="heritage" rankColors={staticRankColors} />,
    <BblValueProps key="value-props" />,
    <BblFeatures key="features" />,
    <BblTimeline key="timeline" rankColors={staticRankColors} />,
    <BblRedBeltCelebration key="red-belt" logoUrl={brandLogoUrl} brandName={brandName} />,
    ...(marqueeRows.length > 0 ? [<BblPromotionMarquee key="marquee" rows={marqueeRows} />] : []),
    <BblTestimonials key="testimonials" />,
    <BblFaq key="faq" />,
    <BblFinalCta key="final-cta" />,
    <BblCelebration key="celebration" logoUrl={brandLogoUrl} brandName={brandName} />,
    <BblTreeTeaser key="tree" />,
    <BblPromos key="promos" />,
  ]

  return (
    <div
      className={cx(
        headingFont.variable,
        bodyFont.variable,
        "flex w-full flex-col gap-y-12 pb-10 md:gap-y-20 lg:gap-y-28",
        // Legacy type treatment: Poppins italic extrabold uppercase headings, Inter body.
        "[font-family:var(--font-bbl-body)]",
        "[&_:is(h1,h2)]:[font-family:var(--font-bbl-heading)]! [&_:is(h1,h2)]:uppercase [&_:is(h1,h2)]:italic [&_:is(h1,h2)]:font-extrabold! [&_:is(h1,h2)]:tracking-[0.02em]",
        "[&_:is(h3,h4)]:[font-family:var(--font-bbl-heading)]!",
      )}
    >
      {sections.map((node, index) => (
        <BblReveal key={node.key} delay={index === 0 ? 0 : 0.08}>
          {node}
        </BblReveal>
      ))}
    </div>
  )
}
