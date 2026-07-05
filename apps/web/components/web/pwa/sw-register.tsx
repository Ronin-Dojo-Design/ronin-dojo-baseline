"use client"

import { useEffect } from "react"

/**
 * Registers the hand-rolled PWA service worker (public/sw.js).
 * Production-only: registering in dev poisons Turbopack HMR with cached chunks.
 * Renders nothing — mounted once from the root layout.
 */
const SwRegister = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if (!("serviceWorker" in navigator)) return

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Registration failure is non-fatal — the site works without the SW.
    })
  }, [])

  return null
}

export { SwRegister }
