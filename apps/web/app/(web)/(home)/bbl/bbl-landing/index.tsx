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

// `showHero` / `holdingPage` adapt the landing for the pre-launch holding page: the
// teaser supplies the hero there (so the landing's own hero is dropped), every gated
// BBL route is suppressed via `hideAction`, and the pure-CTA / celebration sections
// that only make sense post-launch are omitted entirely.
export const BblLanding = async ({
  showHero = true,
  holdingPage = false,
}: { showHero?: boolean; holdingPage?: boolean } = {}) => {
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
    ...(showHero ? [<BblHero key="hero" rankColors={staticRankColors} />] : []),
    <BblVideo key="video" />,
    <BblDirtyDozen key="dirty-dozen" rankColors={staticRankColors} hideAction={holdingPage} />,
    <BblHeritage key="heritage" rankColors={staticRankColors} hideAction={holdingPage} />,
    <BblValueProps key="value-props" />,
    <BblFeatures key="features" />,
    ...(holdingPage ? [] : [<BblTimeline key="timeline" rankColors={staticRankColors} />]),
    ...(holdingPage
      ? []
      : [<BblRedBeltCelebration key="red-belt" logoUrl={brandLogoUrl} brandName={brandName} />]),
    ...(marqueeRows.length > 0
      ? [<BblPromotionMarquee key="marquee" rows={marqueeRows} hideAction={holdingPage} />]
      : []),
    <BblTestimonials key="testimonials" />,
    <BblFaq key="faq" />,
    ...(holdingPage ? [] : [<BblFinalCta key="final-cta" />]),
    ...(holdingPage
      ? []
      : [<BblCelebration key="celebration" logoUrl={brandLogoUrl} brandName={brandName} />]),
    ...(holdingPage ? [] : [<BblTreeTeaser key="tree" />]),
    <BblPromos key="promos" hideAction={holdingPage} />,
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
