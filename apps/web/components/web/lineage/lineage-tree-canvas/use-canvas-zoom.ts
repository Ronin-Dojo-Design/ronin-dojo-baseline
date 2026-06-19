"use client"

import { useEffect, useRef, useState } from "react"
import type { CanvasMember } from "~/lib/lineage/canvas-model"
import { offsetLeftWithin } from "./canvas-dom"
import { clampScale } from "./lineage-tree-canvas-constants"
import type { LineageLayout } from "./lineage-tree-canvas-types"

/**
 * Owns the tree-layout zoom + scroll viewport: scale state, one-shot auto-fit,
 * two-finger pinch-to-zoom, and the post-fit root auto-pan. Owns `scrollRef` /
 * `contentRef` (returned for the orchestrator to attach). `resetAutoFit` lets the
 * Tree toggle re-run the fit + pan after a layout switch.
 */
export function useCanvasZoom({
  layout,
  isMobileListViewport,
  editMode,
  rootMembers,
}: {
  layout: LineageLayout
  isMobileListViewport: boolean
  editMode: boolean
  rootMembers: CanvasMember[]
}) {
  const [scale, setScale] = useState(1)
  const [autoFitPass, setAutoFitPass] = useState(0)
  const [isPinching, setIsPinching] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const scaleRef = useRef(scale)
  const autoFittedRef = useRef(false)
  const autoPannedRef = useRef(false)

  // Mirror scale into a ref so the pinch listener can read it without re-binding.
  useEffect(() => {
    scaleRef.current = scale
  }, [scale])

  // Auto-fit the tree to the viewport width once when tree mode is active.
  // Only ever shrinks to fit (never enlarges past 1.0), and does not run while
  // board mode is active so board's compact layout cannot seed tree zoom.
  // CSS transforms don't affect layout, so contentRef.scrollWidth is the
  // unscaled natural tree width.
  useEffect(() => {
    if (layout !== "tree" || isMobileListViewport) return

    const scrollEl = scrollRef.current
    const contentEl = contentRef.current
    if (!scrollEl || !contentEl) return

    function autoFit() {
      if (autoFittedRef.current || !scrollEl || !contentEl) return
      const containerWidth = scrollEl.clientWidth
      const naturalWidth = contentEl.scrollWidth
      if (!containerWidth || !naturalWidth) return
      autoFittedRef.current = true
      setScale(clampScale(Math.min(1, containerWidth / naturalWidth)))
      setAutoFitPass(pass => pass + 1)
    }

    const raf = requestAnimationFrame(autoFit)
    const observer = new ResizeObserver(() => {
      if (!autoFittedRef.current) autoFit()
    })
    observer.observe(scrollEl)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [layout, isMobileListViewport])

  // Two-finger pinch-to-zoom (touch only). Disabled in edit mode so it never
  // fights the @dnd-kit drag editor or drag-scroll. Single-finger touch falls
  // through to native scroll for panning.
  useEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl || editMode) return

    let startDistance = 0
    let startScale = 1
    let active = false

    function touchDistance(touches: TouchList) {
      const a = touches[0]
      const b = touches[1]
      if (!a || !b) return 0
      return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
    }

    function onTouchStart(event: TouchEvent) {
      if (event.touches.length !== 2) return
      active = true
      startDistance = touchDistance(event.touches)
      startScale = scaleRef.current
      setIsPinching(true)
    }

    function onTouchMove(event: TouchEvent) {
      if (!active || event.touches.length !== 2) return
      event.preventDefault()
      const ratio = touchDistance(event.touches) / (startDistance || 1)
      setScale(clampScale(startScale * ratio))
    }

    function endPinch(event: TouchEvent) {
      if (active && event.touches.length < 2) {
        active = false
        setIsPinching(false)
      }
    }

    scrollEl.addEventListener("touchstart", onTouchStart, { passive: false })
    scrollEl.addEventListener("touchmove", onTouchMove, { passive: false })
    scrollEl.addEventListener("touchend", endPinch)
    scrollEl.addEventListener("touchcancel", endPinch)

    return () => {
      scrollEl.removeEventListener("touchstart", onTouchStart)
      scrollEl.removeEventListener("touchmove", onTouchMove)
      scrollEl.removeEventListener("touchend", endPinch)
      scrollEl.removeEventListener("touchcancel", endPinch)
    }
  }, [editMode])

  // After auto-fit, horizontally pan the scroll container so the configured
  // root chain starts in view. This is especially important on narrow mobile
  // viewports where the wide Dirty Dozen branch can otherwise put the root
  // card off-screen at scrollLeft=0.
  useEffect(() => {
    if (layout !== "tree" || isMobileListViewport || autoFitPass === 0 || autoPannedRef.current) {
      return
    }

    const scrollEl = scrollRef.current
    const contentEl = contentRef.current
    const rootMember = rootMembers[0]
    if (!scrollEl || !contentEl || !rootMember) return

    const raf = requestAnimationFrame(() => {
      const rootEl = document.getElementById(`lineage-member-${rootMember.id}`)
      const targetEl =
        rootEl?.querySelector<HTMLElement>('button[aria-label^="Open lineage profile"]') ?? rootEl
      if (!targetEl) return

      const scaleValue = scaleRef.current || 1
      const targetCenter =
        (offsetLeftWithin(targetEl, contentEl) + targetEl.offsetWidth / 2) * scaleValue
      const targetScrollLeft = targetCenter - scrollEl.clientWidth / 2
      const maxScrollLeft = scrollEl.scrollWidth - scrollEl.clientWidth

      scrollEl.scrollLeft = Math.max(0, Math.min(maxScrollLeft, targetScrollLeft))
      autoPannedRef.current = true
    })

    return () => cancelAnimationFrame(raf)
  }, [layout, isMobileListViewport, autoFitPass, rootMembers])

  // The Tree toggle re-arms the one-shot auto-fit + auto-pan so a return to tree
  // re-fits to the viewport instead of keeping a stale board-era scale.
  const resetAutoFit = () => {
    autoFittedRef.current = false
    autoPannedRef.current = false
  }

  return { scale, setScale, scrollRef, contentRef, isPinching, resetAutoFit }
}
