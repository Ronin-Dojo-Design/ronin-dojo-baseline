"use client"

import { useEffect, useState } from "react"

/**
 * Compact inline countdown for the teaser hero (SESSION_0411).
 *
 * The full-page `bbl-countdown.tsx` renders its own centered `min-h-dvh <main>`, so
 * it can't compose inside the teaser hero. This strip reuses the same
 * `NEXT_PUBLIC_BBL_LAUNCH_AT` target + the SSR-safe "start null, fill on mount"
 * pattern, but lays the units out as a small horizontal row that sits in the hero.
 * Only rendered when a launch target is set (the orchestrator gates on it).
 */

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
      <span className="text-2xl font-black tabular-nums text-foreground sm:text-3xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[0.55rem] font-bold uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

export function CountdownStrip({ launchAt }: { launchAt: string }) {
  const target = new Date(launchAt).getTime()
  const hasTarget = Number.isFinite(target)

  const [remaining, setRemaining] = useState<Remaining>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!hasTarget) return
    setMounted(true)
    setRemaining(computeRemaining(target))
    const id = setInterval(() => setRemaining(computeRemaining(target)), 1000)
    return () => clearInterval(id)
  }, [hasTarget, target])

  if (!hasTarget || !mounted || !remaining) {
    return (
      <span className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
        Launching soon
      </span>
    )
  }

  return (
    <div className="flex items-start gap-4 sm:gap-6">
      <Unit value={remaining.days} label="Days" />
      <Unit value={remaining.hours} label="Hours" />
      <Unit value={remaining.minutes} label="Minutes" />
      <Unit value={remaining.seconds} label="Seconds" />
    </div>
  )
}
