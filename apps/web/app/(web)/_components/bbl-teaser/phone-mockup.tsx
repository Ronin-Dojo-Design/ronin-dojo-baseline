import { BBL_LOGO_WHITE } from "./bbl-teaser-types"

/**
 * A pure-CSS iPhone frame (no external frame image): rounded body, dark bezel, a
 * notch, and a single full-bleed hero photo on the "screen" with the BBL mark
 * subtly overlaid in the lower-left corner. Crazy-simple by design.
 */
export function PhoneMockup({ src, priority = false }: { src: string; priority?: boolean }) {
  return (
    <div className="w-full select-none rounded-[2.5rem] border border-white/10 bg-neutral-900 p-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-black/40">
      {/* Bezel */}
      <div className="relative aspect-9/19 overflow-hidden rounded-[2rem] bg-black">
        {/* Notch */}
        <div className="absolute left-1/2 top-2 z-20 h-5 w-1/3 -translate-x-1/2 rounded-full bg-black/90" />

        {/* Screen photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          aria-hidden
          loading={priority ? "eager" : "lazy"}
          className="absolute inset-0 size-full object-cover"
        />

        {/* Cinematic gradient so the logo reads on any photo */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20"
        />

        {/* Subtle BBL mark, lower-left — a CSS background (not an <img>) so the
            marquee adds no extra image elements beyond the hero photos. */}
        <div
          aria-hidden
          className="absolute bottom-3 left-3 z-10 h-5 w-12 bg-contain bg-left bg-no-repeat opacity-80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
          style={{ backgroundImage: `url(${BBL_LOGO_WHITE})` }}
        />
      </div>
    </div>
  )
}
