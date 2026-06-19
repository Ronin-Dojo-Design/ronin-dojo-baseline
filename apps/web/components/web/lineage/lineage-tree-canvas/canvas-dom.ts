"use client"

import { useEffect, useLayoutEffect } from "react"

// useLayoutEffect warns under SSR; the canvas is a client component but Next still renders its HTML
// on the server. Fall back to useEffect on the server so measurement stays pre-paint in the browser
// without the dev-only warning.
export const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect

/** Sum of `offsetLeft` from `element` up to (but excluding) `ancestor`, walking offsetParents. */
export function offsetLeftWithin(element: HTMLElement, ancestor: HTMLElement) {
  let offset = 0
  let node: HTMLElement | null = element

  while (node && node !== ancestor) {
    offset += node.offsetLeft
    node = node.offsetParent as HTMLElement | null
  }

  return offset
}
