"use client"

import { useEffect, useState } from "react"
import { env } from "~/env"
import { bblBodyFont, bblHeadingFont } from "~/lib/fonts"

/**
 * Black Belt Legacy pre-launch holding page (SESSION_0403).
 *
 * Rendered by the public `(web)` layout for the BBL brand while `BBL_COUNTDOWN`
 * is on, so `blackbeltlegacy.com` can be pointed at this deployment before the
 * full launch. Counts toward `NEXT_PUBLIC_BBL_LAUNCH_AT` when set; otherwise
 * shows "Launching soon". Matches the BBL landing voice (cinematic dark + red,
 * Poppins-evoking heading). Self-contained — no header/footer/app chrome.
 */

const LOGO = "/brand/blackbeltlegacy/bbl-logo-white.png"

type Remaining = { days: number; hours: number; minutes: number; seconds: number } | null

function computeRemaining(target: number): Remaining {
  const diff = target - Date.now()
  if (diff <= 0) return null
  const totalSeconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-4xl font-black tabular-nums text-white sm:text-6xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[0.6rem] font-bold uppercase tracking-[0.24em] text-white/45 sm:text-xs">
        {label}
      </span>
    </div>
  )
}

export function BblCountdown() {
  const launchAt = env.NEXT_PUBLIC_BBL_LAUNCH_AT
  const target = launchAt ? new Date(launchAt).getTime() : Number.NaN
  const hasTarget = Number.isFinite(target)

  // Start null to keep SSR/first-client paint identical (no hydration mismatch);
  // the real countdown fills in on mount.
  const [remaining, setRemaining] = useState<Remaining>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!hasTarget) return
    setMounted(true)
    setRemaining(computeRemaining(target))
    const id = setInterval(() => setRemaining(computeRemaining(target)), 1000)
    return () => clearInterval(id)
  }, [hasTarget, target])

  return (
    <main
      className={`${bblHeadingFont.variable} ${bblBodyFont.variable} relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#050505] px-6 py-16 text-center text-white [font-family:var(--font-bbl-body),system-ui,sans-serif]`}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-14rem] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-red-600/20 blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_30rem)]" />
      </div>

      <div className="relative z-10 flex max-w-2xl flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO} alt="Black Belt Legacy" width="120" height="69" className="h-16 w-auto" />

        <span className="mt-10 text-[0.7rem] font-black uppercase tracking-[0.28em] text-red-500">
          Honor the Lineage. Build the Future.
        </span>

        <h1 className="mt-5 text-balance text-4xl font-extrabold uppercase italic tracking-[0.01em] sm:text-6xl [font-family:var(--font-bbl-heading),system-ui,sans-serif]">
          A new home for the lineage is coming
        </h1>

        <p className="mt-5 max-w-xl text-pretty text-base/7 text-white/60">
          Black Belt Legacy is almost here — verified lineage, living profiles, and the legacy of
          Rigan Machado&apos;s family tree, all in one place.
        </p>

        <div className="mt-12 min-h-[4.5rem]">
          {hasTarget && mounted && remaining ? (
            <div className="flex items-start gap-5 sm:gap-8">
              <Unit value={remaining.days} label="Days" />
              <Unit value={remaining.hours} label="Hours" />
              <Unit value={remaining.minutes} label="Minutes" />
              <Unit value={remaining.seconds} label="Seconds" />
            </div>
          ) : (
            <span className="text-lg font-bold uppercase tracking-[0.2em] text-white/70">
              Launching soon
            </span>
          )}
        </div>
      </div>
    </main>
  )
}
