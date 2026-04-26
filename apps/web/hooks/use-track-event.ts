"use client"

import { usePlausible } from "next-plausible"
import { isDev } from "~/env"

/**
 * Custom hook that tracks events on the client side using Plausible.
 */
export const useTrackEvent = () => {
  const plausible = usePlausible()

  const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
    if (isDev) {
      console.log("Tracking event:", eventName, properties)
      return
    }

    // Track event with Plausible
    plausible(eventName, { props: properties })
  }

  return trackEvent
}
