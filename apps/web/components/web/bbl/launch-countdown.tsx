"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useBrand } from "~/contexts/brand-context"
import { getBblLaunchTarget } from "~/lib/bbl-launch"

/**
 * Black Belt Legacy launch countdown / coming-soon screen.
 *
 * Ported from the monorepo BBLApp `LaunchCountdown.jsx` onto Baseline primitives:
 * brand-themed via the active brand's CSS tokens (`text-primary`, `bg-background`)
 * and the brand logo from `useBrand()`. The target instant comes from
 * `NEXT_PUBLIC_BBL_LAUNCH_AT` (see lib/bbl-launch.ts). Rendered by the
 * `/coming-soon` page that the middleware rewrites BBL public routes to.
 */

const DAY_MS = 86_400_000
const HOUR_MS = 3_600_000
const MINUTE_MS = 60_000

type CountdownParts = { days: number; hours: number; minutes: number; seconds: number }

const partsFromRemaining = (remainingMs: number): CountdownParts => {
  const clamped = Math.max(0, remainingMs)
  return {
    days: Math.floor(clamped / DAY_MS),
    hours: Math.floor((clamped % DAY_MS) / HOUR_MS),
    minutes: Math.floor((clamped % HOUR_MS) / MINUTE_MS),
    seconds: Math.floor((clamped % MINUTE_MS) / 1000),
  }
}

const pad2 = (value: number) => String(value).padStart(2, "0")

const Unit = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <div className="text-4xl sm:text-5xl md:text-7xl font-bold text-primary tabular-nums">
      {value}
    </div>
    <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
  </div>
)

const Separator = () => (
  <div className="text-4xl sm:text-5xl md:text-7xl font-bold text-muted-foreground/40">:</div>
)

export const LaunchCountdown = () => {
  const { name, tagline, logoSrc } = useBrand()
  const target = getBblLaunchTarget()

  // Start null so server and first client render match (no Date-based hydration
  // mismatch); the real time is set on mount.
  const [nowMs, setNowMs] = useState<number | null>(null)

  useEffect(() => {
    setNowMs(Date.now())
    const timer = setInterval(() => setNowMs(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const targetMs = target?.getTime() ?? null
  const hasLaunched = targetMs !== null && nowMs !== null && nowMs >= targetMs
  const parts = targetMs !== null && nowMs !== null ? partsFromRemaining(targetMs - nowMs) : null

  const targetLabel = target
    ? target.toLocaleString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      })
    : null

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background px-6 py-16 text-foreground">
      <Image
        src={logoSrc}
        alt={`${name} logo`}
        width={120}
        height={120}
        className="h-24 w-auto"
        priority
        unoptimized
      />

      <div className="max-w-2xl text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">{name}</h1>
        <p className="mt-2 text-muted-foreground">{tagline}</p>
      </div>

      {hasLaunched || targetMs === null ? (
        <div className="text-center">
          <p className="text-xl font-semibold text-primary">We&apos;re live.</p>
          <a
            href="/?preview=1"
            className="mt-3 inline-block text-sm underline text-muted-foreground"
          >
            Enter the site
          </a>
        </div>
      ) : (
        <>
          <p className="text-sm uppercase tracking-widest text-muted-foreground">Launching in</p>
          <div className="flex items-center justify-center gap-3 md:gap-6">
            <Unit value={parts ? String(parts.days) : "—"} label="Days" />
            <Separator />
            <Unit value={parts ? pad2(parts.hours) : "—"} label="Hours" />
            <Separator />
            <Unit value={parts ? pad2(parts.minutes) : "—"} label="Minutes" />
            <Separator />
            <Unit value={parts ? pad2(parts.seconds) : "—"} label="Seconds" />
          </div>
          {targetLabel ? (
            <p className="text-sm text-muted-foreground">Full launch — {targetLabel}</p>
          ) : null}
        </>
      )}
    </main>
  )
}
