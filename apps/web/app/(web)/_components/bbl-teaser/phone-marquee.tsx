import { type MarqueeColumn } from "./bbl-teaser-types"
import { PhoneMockup } from "./phone-mockup"

/**
 * Three vertical columns of iPhone mockups that auto-scroll as a seamless infinite
 * marquee. Crazy-simple: pure CSS `@keyframes translateY` over content that is
 * duplicated once, so the -50% loop point is visually identical to the start.
 *
 * - PAUSE ON HOVER via `:hover { animation-play-state: paused }`.
 * - Alternating direction + slightly different speed per column for visual life.
 * - `prefers-reduced-motion: reduce` disables the animation (static stack) — matches
 *   the repo's reduced-motion idiom with a plain CSS media query (no JS needed; this
 *   is a server component).
 *
 * The keyframes/animation live in a scoped <style> tag so the marquee needs no
 * Tailwind-config or global-CSS changes.
 */
export function PhoneMarquee({ columns }: { columns: MarqueeColumn[] }) {
  return (
    <div
      aria-hidden
      className="bbl-marquee pointer-events-none relative grid h-full grid-cols-3 gap-3 sm:gap-4"
    >
      <style>{MARQUEE_CSS}</style>

      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className="overflow-hidden">
          {/* The track is the content duplicated once; the -50% loop is seamless. */}
          <div
            className="bbl-marquee__track pointer-events-auto flex flex-col gap-3 sm:gap-4"
            style={{
              animationDuration: `${column.durationSec}s`,
              animationDirection: column.direction === "down" ? "reverse" : "normal",
            }}
          >
            {[...column.images, ...column.images].map((src, imageIndex) => (
              <PhoneMockup
                key={`${columnIndex}-${imageIndex}`}
                src={src}
                priority={columnIndex === 0 && imageIndex === 0}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const MARQUEE_CSS = `
@keyframes bbl-marquee-scroll {
  from { transform: translateY(0); }
  to { transform: translateY(-50%); }
}
.bbl-marquee__track {
  animation-name: bbl-marquee-scroll;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}
.bbl-marquee:hover .bbl-marquee__track {
  animation-play-state: paused;
}
@media (prefers-reduced-motion: reduce) {
  .bbl-marquee__track {
    animation: none;
  }
}
`
