/**
 * Shared types + asset constants for the BBL launch teaser (SESSION_0411).
 *
 * The hero images live in `public/brand/blackbeltlegacy/images/hero/` (copied from
 * the legacy monorepo). The teaser renders them inside CSS iPhone mockups that
 * auto-scroll as a seamless vertical marquee.
 */

export const BBL_LOGO_WHITE = "/brand/blackbeltlegacy/bbl-logo-white.png"

const HERO_BASE = "/brand/blackbeltlegacy/images/hero"

/** Hero photos shown inside the phone mockups (order is the visual deal-out order). */
export const HERO_IMAGES: readonly string[] = [
  `${HERO_BASE}/hero-belt-on-mat.jpg`,
  `${HERO_BASE}/hero-black_belt_and_blue_belt_BBL.jpg`,
  `${HERO_BASE}/hero-black_belt_teaching_class.jpg`,
  `${HERO_BASE}/hero-judo-clinch.jpg`,
  `${HERO_BASE}/hero-no-gi-x.jpg`,
  `${HERO_BASE}/hero-bbl-technical-standup.jpg`,
  `${HERO_BASE}/hero-black_belt_tying.jpg`,
  `${HERO_BASE}/hero-instructor_tying_belt_on-student.jpg`,
  `${HERO_BASE}/hero-judo-clinch-2.jpg`,
  `${HERO_BASE}/hero-judo-clinch-3.jpg`,
]

/** One auto-scrolling column of phone mockups. */
export type MarqueeColumn = {
  images: string[]
  /** Seconds for one full loop — slightly different per column for visual life. */
  durationSec: number
  /** Scroll direction; alternating columns drift opposite ways. */
  direction: "up" | "down"
}
