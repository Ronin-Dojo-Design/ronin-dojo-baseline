import { env } from "~/env"
import { bblBodyFont, bblHeadingFont } from "~/lib/fonts"
import { HERO_IMAGES, type MarqueeColumn } from "./bbl-teaser-types"
import { CountdownStrip } from "./countdown-strip"
import { EmailCapture } from "./email-capture"
import { PhoneMarquee } from "./phone-marquee"

/**
 * Black Belt Legacy launch teaser (SESSION_0411).
 *
 * Replaces the bare "Launching soon" countdown with a cinematic dark hero: three
 * auto-scrolling columns of iPhone mockups (a full-bleed background band) behind a
 * prominent headline + tagline + a WORKING email capture. Rendered by the public
 * `(web)` layout for the BBL brand while `BBL_COUNTDOWN` is on. Self-contained — no
 * app header/footer/chrome — matching the BBL landing voice (`bbl-countdown.tsx`).
 *
 * The optional countdown still shows when `NEXT_PUBLIC_BBL_LAUNCH_AT` is set (as a
 * compact inline strip); the teaser stands alone otherwise. The full-page
 * `bbl-countdown.tsx` stays importable for the pre-teaser holding-page path.
 *
 * Folder module (component-launch-sweep recipe): this orchestrator is the only
 * export; the marquee / mockup / capture / countdown-strip parts are private.
 */

// Distribute the 10 hero photos across the three columns — each photo used once,
// no column repeats the whole set — so the marquee shows ~10 phones, not 60. The
// columns get slightly different speeds + alternating directions for visual life.
const pick = (indexes: number[]): string[] => indexes.map(index => HERO_IMAGES[index]!)

const COLUMNS: MarqueeColumn[] = [
  { images: pick([0, 3, 6, 9]), durationSec: 40, direction: "up" },
  { images: pick([1, 4, 7]), durationSec: 48, direction: "down" },
  { images: pick([2, 5, 8]), durationSec: 44, direction: "up" },
]

export function BblTeaserPage() {
  const launchAt = env.NEXT_PUBLIC_BBL_LAUNCH_AT

  return (
    <main
      className={`${bblHeadingFont.variable} ${bblBodyFont.variable} relative min-h-dvh overflow-x-clip bg-[#050505] text-white [font-family:var(--font-bbl-body),system-ui,sans-serif]`}
    >
      {/* Phone marquee — full-bleed background band, right-weighted on desktop. */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-full opacity-30 sm:w-3/5 sm:opacity-45 lg:w-1/2"
      >
        <div className="h-full px-4 [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)]">
          <PhoneMarquee columns={COLUMNS} />
        </div>
        {/* Fade the marquee into the dark hero on the left edge. */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent sm:via-[#050505]/40" />
      </div>

      {/* Red glow, matching the countdown. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10rem] top-[-12rem] h-[40rem] w-[40rem] rounded-full bg-red-600/20 blur-[160px]" />
      </div>

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col justify-center px-6 py-10 sm:px-10">
        <div className="max-w-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/blackbeltlegacy/bbl-logo-white.png"
            alt="Black Belt Legacy"
            width="120"
            height="69"
            className="h-14 w-auto"
          />

          <span className="mt-8 block text-[0.7rem] font-black uppercase tracking-[0.28em] text-red-500">
            Honor the Lineage. Build the Future.
          </span>

          <h1 className="mt-4 text-balance text-4xl font-extrabold uppercase italic tracking-[0.01em] sm:text-6xl [font-family:var(--font-bbl-heading),system-ui,sans-serif]">
            A new home for the lineage is coming
          </h1>

          <p className="mt-5 max-w-lg text-pretty text-base/7 text-white/60">
            Black Belt Legacy is almost here — verified lineage, living profiles, and the legacy of
            Rigan Machado&apos;s family tree, all in one place.
          </p>

          {launchAt && (
            <div className="mt-7">
              <CountdownStrip launchAt={launchAt} />
            </div>
          )}

          <div className="mt-7">
            <EmailCapture />
          </div>
        </div>
      </div>
    </main>
  )
}
