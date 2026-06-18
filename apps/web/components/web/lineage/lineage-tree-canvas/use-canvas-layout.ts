"use client"

import { useEffect, useRef, useState } from "react"
import { useIsomorphicLayoutEffect } from "./canvas-dom"
import { MOBILE_LIST_QUERY, RESPONSIVE_LAYOUT_QUERY } from "./lineage-tree-canvas-constants"
import type { LineageLayout } from "./lineage-tree-canvas-types"

/**
 * Owns the canvas layout mode + viewport detection.
 *
 * Seeds the default layout from the viewport (board below md, tree at/above md)
 * until the viewer explicitly toggles, tracks the <sm mobile-list breakpoint, and
 * detects a coarse pointer for the explore-hint copy. `layoutTouchedRef` lets the
 * toolbar mark an explicit pick so the responsive default stops overriding it.
 */
export function useCanvasLayout(defaultLayout: LineageLayout | undefined) {
  const [layout, setLayout] = useState<LineageLayout>(defaultLayout ?? "tree")
  const [isMobileListViewport, setIsMobileListViewport] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  const layoutTouchedRef = useRef(false)

  // Seed the default layout from the viewport until the viewer explicitly picks
  // a mode. This uses a layout effect so the mobile board default applies before
  // the tree auto-fit effect can seed zoom from a layout we are about to replace.
  useIsomorphicLayoutEffect(() => {
    if (defaultLayout || typeof window === "undefined" || !window.matchMedia) return

    const mediaQuery = window.matchMedia(RESPONSIVE_LAYOUT_QUERY)
    const applyResponsiveDefault = (matches: boolean) => {
      if (layoutTouchedRef.current) return
      setLayout(matches ? "tree" : "board")
    }

    applyResponsiveDefault(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      applyResponsiveDefault(event.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [defaultLayout])

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return

    const mediaQuery = window.matchMedia(MOBILE_LIST_QUERY)
    const updateMobileListViewport = (matches: boolean) => setIsMobileListViewport(matches)

    updateMobileListViewport(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      updateMobileListViewport(event.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  // Detect a coarse pointer (touch) to swap the explore hint label.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    setIsTouch(window.matchMedia("(pointer: coarse)").matches)
  }, [])

  return { layout, setLayout, isMobileListViewport, isTouch, layoutTouchedRef }
}
