"use client"

import { useState, type RefObject } from "react"

const EXPORT_CROP_PADDING = 24

export type ExportRgb = { background: string; border: string; text: string }

type ExportStyleSnapshot = {
  element: HTMLElement | SVGElement
  fill: string | null
  stroke: string | null
  style: string | null
}

/**
 * Run `callback` with the export subtree temporarily forced onto html2canvas-safe inline styles,
 * then restore every touched attribute in a `finally`. html2canvas cannot parse Tailwind v4's
 * OKLab color-mix output, so this pins literal rgb()/hex values for the capture only. The per-
 * node-type capture RGB comes from `exportRgbFor` — those values MUST stay literal `rgb()`
 * strings (see `NODE_TYPE_STYLES.exportRgb` in technique-graph.tsx); do not tokenize them, or
 * html2canvas will fail to parse the color. Extracted from technique-graph.tsx (SESSION_0588,
 * Desi P2) to lift the PNG-export mass out of the component; behavior preserved byte-for-byte.
 */
const withExportSafeStyles = async <T>(
  root: HTMLElement,
  exportRgbFor: (type: string) => ExportRgb,
  callback: () => Promise<T>,
): Promise<T> => {
  const elements = [
    root,
    ...(Array.from(root.querySelectorAll("*")) as Array<HTMLElement | SVGElement>),
  ]
  const snapshots: ExportStyleSnapshot[] = elements.map(element => ({
    element,
    fill: element.getAttribute("fill"),
    stroke: element.getAttribute("stroke"),
    style: element.getAttribute("style"),
  }))

  const setStyle = (element: HTMLElement | SVGElement, property: string, value: string) => {
    element.style.setProperty(property, value, "important")
  }

  // html2canvas cannot parse Tailwind v4's OKLab color-mix output yet.
  for (const element of elements) {
    setStyle(element, "background-color", "transparent")
    setStyle(element, "background-image", "none")
    setStyle(element, "border-color", "rgb(203 213 225)")
    setStyle(element, "box-shadow", "none")
    setStyle(element, "caret-color", "rgb(17 24 39)")
    setStyle(element, "color", "rgb(17 24 39)")
    // Pin an export-safe stack for the capture only (snapshot/restore puts the app font back):
    // html2canvas measures text with whatever font is live, so a webfont mid-swap or a stack it
    // can't resolve shifts glyph metrics and clips node labels in the PNG.
    setStyle(
      element,
      "font-family",
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
    )
    setStyle(element, "outline-color", "rgb(148 163 184)")
    setStyle(element, "text-decoration-color", "rgb(17 24 39)")
    setStyle(element, "text-shadow", "none")
  }

  setStyle(root, "background-color", "rgb(255 255 255)")

  for (const node of Array.from(root.querySelectorAll<HTMLElement>("[data-graph-node-type]"))) {
    const style = exportRgbFor(node.dataset.graphNodeType ?? "")
    setStyle(node, "background-color", style.background)
    setStyle(node, "border-color", style.border)
    setStyle(node, "color", style.text)

    for (const child of Array.from(node.querySelectorAll<HTMLElement>("span"))) {
      setStyle(child, "color", style.text)
    }

    // WL-P2-65: html2canvas mis-renders the `-webkit-box`/`-webkit-line-clamp` truncation model
    // — it clips glyph TOPS on the name line even at today's label lengths, none of which
    // actually need the 2-line clamp (verified against the live layout JSON: longest label is 15
    // chars, well under one line at this node width). Disambiguation experiment (real captures,
    // one variable isolated at a time, real html2canvas) ruled out BOTH ledger candidates — the
    // font-family pin below and the fixed 64px node height/overflow both still clipped when
    // isolated. Only dropping BOTH the webkit-box display AND its own overflow-hidden fixed it —
    // an `overflow: hidden` + fixed `max-height` substitute (same visual cap, no webkit-box)
    // reproduced the SAME clip, so html2canvas's bug here is the overflow-clip calculation
    // itself, not `-webkit-box` specifically. `overflow: visible` is safe: the OUTER node button
    // keeps its own `overflow-hidden` for the (never-yet-hit) case of a future longer label.
    const label = node.querySelector<HTMLElement>('[class*="line-clamp"]')
    if (label) {
      setStyle(label, "display", "block")
      setStyle(label, "-webkit-line-clamp", "none")
      setStyle(label, "overflow", "visible")
    }
  }

  // Preserve the second tint channel in PNG exports. The generic OKLab-safety pass above clears
  // every background first, so each data-driven Rank.colorHex edge is restored explicitly here.
  for (const beltEdge of Array.from(
    root.querySelectorAll<HTMLElement>("[data-graph-belt-color]"),
  )) {
    const beltColor = beltEdge.dataset.graphBeltColor
    if (beltColor) setStyle(beltEdge, "background-color", beltColor)
  }

  // Keep the token-neutral contrast edge visible beside very light Rank colors (especially white
  // belt). The generic OKLab-safety pass clears token backgrounds, so restore this one explicitly.
  for (const hairline of Array.from(
    root.querySelectorAll<HTMLElement>("[data-graph-belt-hairline]"),
  )) {
    setStyle(hairline, "background-color", "rgb(203 213 225)")
  }

  for (const edge of Array.from(root.querySelectorAll<SVGPathElement>("[data-graph-edge-type]"))) {
    const style = exportRgbFor(edge.dataset.graphEdgeType ?? "")
    edge.setAttribute("fill", "none")
    edge.setAttribute("stroke", style.border)
    setStyle(edge, "stroke", style.border)
    setStyle(edge, "fill", "none")
  }

  try {
    return await callback()
  } finally {
    for (const snapshot of snapshots) {
      if (snapshot.style === null) snapshot.element.removeAttribute("style")
      else snapshot.element.setAttribute("style", snapshot.style)

      if (snapshot.fill === null) snapshot.element.removeAttribute("fill")
      else snapshot.element.setAttribute("fill", snapshot.fill)

      if (snapshot.stroke === null) snapshot.element.removeAttribute("stroke")
      else snapshot.element.setAttribute("stroke", snapshot.stroke)
    }
  }
}

/**
 * The PNG-export subsystem as a hook: owns `isExporting` and returns the `exportPng` handler the
 * toolbar's Download button calls. Crops to the drawn graph at the current pan/zoom and rasterizes
 * the export subtree via html2canvas under `withExportSafeStyles`. Extracted from technique-graph
 * .tsx (SESSION_0588, Desi P2) — behavior unchanged.
 */
export function useGraphPngExport({
  exportRef,
  pan,
  zoom,
  bounds,
  exportRgbFor,
}: {
  exportRef: RefObject<HTMLDivElement | null>
  pan: { x: number; y: number }
  zoom: number
  bounds: { width: number; height: number }
  exportRgbFor: (type: string) => ExportRgb
}) {
  const [isExporting, setIsExporting] = useState(false)

  const exportPng = async () => {
    const exportNode = exportRef.current
    if (!exportNode) return
    setIsExporting(true)
    try {
      // Fonts still loading would rasterize with fallback metrics — wait for the full set first.
      await document.fonts.ready
      const html2canvas = (await import("html2canvas")).default

      // Crop to the drawn graph (content bounds × zoom at the current pan, plus a margin)
      // instead of the full 72vh container, clamped to the visible viewport because
      // overflow-hidden clips anything panned outside it. html2canvas x/y are relative to the
      // captured element's own bounds. The content occupies [pan, pan + bounds × zoom] inside
      // the element, so a NEGATIVE pan shrinks the crop from the right/bottom edge too — the old
      // `bounds × zoom + padding` width overshot into trailing whitespace when panned negative.
      const cropX0 = Math.max(0, pan.x - EXPORT_CROP_PADDING)
      const cropY0 = Math.max(0, pan.y - EXPORT_CROP_PADDING)
      const cropX1 = Math.min(
        exportNode.clientWidth,
        pan.x + bounds.width * zoom + EXPORT_CROP_PADDING,
      )
      const cropY1 = Math.min(
        exportNode.clientHeight,
        pan.y + bounds.height * zoom + EXPORT_CROP_PADDING,
      )
      // Degenerate guard: content panned fully outside the viewport leaves an empty (or inverted)
      // crop rect — fall back to capturing the whole visible canvas instead of a 1×1 PNG.
      const cropIsDegenerate = cropX1 - cropX0 < 1 || cropY1 - cropY0 < 1
      const cropX = cropIsDegenerate ? 0 : cropX0
      const cropY = cropIsDegenerate ? 0 : cropY0
      const cropWidth = cropIsDegenerate ? exportNode.clientWidth : cropX1 - cropX0
      const cropHeight = cropIsDegenerate ? exportNode.clientHeight : cropY1 - cropY0

      const canvas = await withExportSafeStyles(exportNode, exportRgbFor, () =>
        html2canvas(exportNode, {
          backgroundColor: "#ffffff",
          logging: false,
          scale: 2,
          useCORS: true,
          x: cropX,
          y: cropY,
          width: Math.max(1, Math.ceil(cropWidth)),
          height: Math.max(1, Math.ceil(cropHeight)),
        }),
      )
      const link = document.createElement("a")
      link.download = "bjj-technique-graph.png"
      link.href = canvas.toDataURL("image/png")
      document.body.appendChild(link)
      link.click()
      link.remove()
    } finally {
      setIsExporting(false)
    }
  }

  return { isExporting, exportPng }
}
