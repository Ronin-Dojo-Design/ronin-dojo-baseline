"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { DashboardOnboarding } from "./dashboard-onboarding"
import type { OnboardingTier } from "./tier-features"

/** localStorage marker so a completed/skipped tour never auto-reopens. */
const STORAGE_KEY = "bbl:onboarding:dashboard:v1"

type DashboardOnboardingTourProps = {
  tier: OnboardingTier
}

/**
 * Decides whether the dashboard tour shows, mirroring the monorepo trigger:
 * auto-open on a first-time visit (no completion marker) and always re-open via
 * the `?tour=1` deep-link the sidebar "Onboarding" item points at. Completion
 * is remembered in localStorage (matching `DashboardOnboarding.jsx`) — no
 * migration. Starts closed and resolves on mount to avoid a hydration mismatch.
 */
export function DashboardOnboardingTour({ tier }: DashboardOnboardingTourProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isDeepLink = searchParams.get("tour") === "1"

  useEffect(() => {
    if (isDeepLink) {
      setOpen(true)
      return
    }
    let alreadyDone = false
    try {
      alreadyDone = window.localStorage.getItem(STORAGE_KEY) === "done"
    } catch {
      // Private mode / storage disabled — treat as a first visit (show once).
      alreadyDone = false
    }
    if (!alreadyDone) setOpen(true)
  }, [isDeepLink])

  const markDone = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "done")
    } catch {
      // Ignore storage failures; the tour simply may show again next visit.
    }
  }, [])

  // Drop the ?tour=1 param so a refresh doesn't re-trigger the deep-link.
  const clearDeepLink = useCallback(() => {
    if (!isDeepLink) return
    const params = new URLSearchParams(searchParams.toString())
    params.delete("tour")
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [isDeepLink, pathname, router, searchParams])

  const handleClose = useCallback(() => {
    markDone()
    clearDeepLink()
    setOpen(false)
  }, [markDone, clearDeepLink])

  return (
    <DashboardOnboarding
      open={open}
      onOpenChange={setOpen}
      onComplete={handleClose}
      onSkip={handleClose}
      tier={tier}
    />
  )
}
