"use client"

import {
  DownloadIcon,
  FocusIcon,
  MinusIcon,
  PlusIcon,
  RotateCcwIcon,
  WorkflowIcon,
} from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/common/dialog"
import { Prose } from "~/components/common/prose"
import { Stack } from "~/components/common/stack"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/common/tooltip"
import { cx } from "~/lib/utils"
import type {
  BjjTechniqueGraph,
  BjjTechniqueGraphEdge,
  BjjTechniqueGraphNode,
} from "~/server/web/techniques/graph-query"
import { deriveNodeTooltip } from "~/server/web/techniques/node-tooltip"

const NODE_WIDTH = 168
const NODE_HEIGHT = 64
const CANVAS_PADDING = 96
const ZOOM_MIN = 0.35
const ZOOM_MAX = 1.8
const ZOOM_STEP = 0.12
const PAN_STEP = 48
const EXPORT_CROP_PADDING = 24

type GraphNodeType = BjjTechniqueGraphNode["type"]
type FilterValue = "all" | GraphNodeType

const NODE_TYPES: { value: FilterValue; label: string; dotClass: string }[] = [
  { value: "all", label: "All", dotClass: "bg-foreground" },
  { value: "position", label: "Positions", dotClass: "bg-sky-500" },
  { value: "submission", label: "Submissions", dotClass: "bg-red-500" },
  { value: "transition", label: "Transitions", dotClass: "bg-amber-500" },
  { value: "counter", label: "Counters", dotClass: "bg-violet-500" },
]

const clampZoom = (value: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value))

const nodeTypeClass = (type: GraphNodeType) => {
  // Solid light/dark fills are deliberate: each tint stays faint but OPAQUE, so overlapping graph
  // nodes never blend into a muddy third color and the legend dots remain an exact visual key.
  if (type === "position") {
    return "border-sky-400 bg-sky-50 text-sky-800 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-200"
  }
  if (type === "submission") {
    return "border-red-400 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-200"
  }
  if (type === "counter") {
    return "border-violet-400 bg-violet-50 text-violet-800 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-200"
  }
  return "border-amber-400 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200"
}

const edgeTypeClass = (type: GraphNodeType) => {
  if (type === "position") return "stroke-sky-500"
  if (type === "submission") return "stroke-red-500"
  if (type === "counter") return "stroke-violet-500"
  return "stroke-amber-500"
}

const labelForType = (type: GraphNodeType) =>
  type
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

const EXPORT_CAPTURE_STYLES: Record<
  GraphNodeType,
  { background: string; border: string; text: string }
> = {
  position: { background: "rgb(240 249 255)", border: "rgb(56 189 248)", text: "rgb(7 89 133)" },
  submission: {
    background: "rgb(254 242 242)",
    border: "rgb(248 113 113)",
    text: "rgb(153 27 27)",
  },
  transition: { background: "rgb(255 251 235)", border: "rgb(251 191 36)", text: "rgb(120 53 15)" },
  counter: { background: "rgb(245 243 255)", border: "rgb(167 139 250)", text: "rgb(91 33 182)" },
}

type ExportStyleSnapshot = {
  element: HTMLElement | SVGElement
  fill: string | null
  stroke: string | null
  style: string | null
}

const withExportSafeStyles = async <T,>(
  root: HTMLElement,
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
    const type = node.dataset.graphNodeType as GraphNodeType
    const style = EXPORT_CAPTURE_STYLES[type] ?? EXPORT_CAPTURE_STYLES.transition
    setStyle(node, "background-color", style.background)
    setStyle(node, "border-color", style.border)
    setStyle(node, "color", style.text)

    for (const child of Array.from(node.querySelectorAll<HTMLElement>("span"))) {
      setStyle(child, "color", style.text)
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
    const type = edge.dataset.graphEdgeType as GraphNodeType
    const style = EXPORT_CAPTURE_STYLES[type] ?? EXPORT_CAPTURE_STYLES.transition
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

function buildEdgePath(from: BjjTechniqueGraphNode, to: BjjTechniqueGraphNode) {
  const x1 = from.x + NODE_WIDTH / 2
  const y1 = from.y + NODE_HEIGHT / 2
  const x2 = to.x + NODE_WIDTH / 2
  const y2 = to.y + NODE_HEIGHT / 2
  const dx = Math.abs(x2 - x1) * 0.5

  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`
}

function GraphEdge({
  edge,
  nodeById,
}: {
  edge: BjjTechniqueGraphEdge
  nodeById: Map<string, BjjTechniqueGraphNode>
}) {
  const from = nodeById.get(edge.from)
  const to = nodeById.get(edge.to)

  if (!from || !to) return null

  return (
    <path
      d={buildEdgePath(from, to)}
      data-graph-edge-type={edge.type}
      className={cx("fill-none stroke-2 opacity-55", edgeTypeClass(edge.type))}
      strokeLinecap="round"
    />
  )
}

export function TechniqueGraph({ graph }: { graph: BjjTechniqueGraph }) {
  const [pan, setPan] = useState({ x: 48, y: 48 })
  const [zoom, setZoom] = useState(1)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<FilterValue>("all")
  const [isExporting, setIsExporting] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const canvasRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)
  const isPanning = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })

  const bounds = useMemo(() => {
    const width = Math.max(...graph.nodes.map(node => node.x), 0) + NODE_WIDTH + CANVAS_PADDING
    const height = Math.max(...graph.nodes.map(node => node.y), 0) + NODE_HEIGHT + CANVAS_PADDING
    return { width, height }
  }, [graph.nodes])

  const visibleNodes = useMemo(
    () =>
      activeType === "all" ? graph.nodes : graph.nodes.filter(node => node.type === activeType),
    [activeType, graph.nodes],
  )
  const visibleNodeIds = useMemo(() => new Set(visibleNodes.map(node => node.id)), [visibleNodes])
  const visibleEdges = useMemo(
    () => graph.edges.filter(edge => visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to)),
    [graph.edges, visibleNodeIds],
  )
  const nodeById = useMemo(() => new Map(visibleNodes.map(node => [node.id, node])), [visibleNodes])
  const allNodeById = useMemo(
    () => new Map(graph.nodes.map(node => [node.id, node])),
    [graph.nodes],
  )
  const selectedNode = selectedNodeId ? allNodeById.get(selectedNodeId) : undefined

  const fitToView = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const nextZoom = clampZoom(
      Math.min(
        1,
        (canvas.clientWidth - 48) / Math.max(bounds.width, 1),
        (canvas.clientHeight - 48) / Math.max(bounds.height, 1),
      ),
    )

    setZoom(nextZoom)
    setPan({
      x: Math.max(24, (canvas.clientWidth - bounds.width * nextZoom) / 2),
      y: Math.max(24, (canvas.clientHeight - bounds.height * nextZoom) / 2),
    })
  }, [bounds.height, bounds.width])

  useEffect(() => {
    const raf = requestAnimationFrame(fitToView)
    return () => cancelAnimationFrame(raf)
  }, [fitToView])

  const updateZoom = (nextZoom: number) => setZoom(clampZoom(nextZoom))

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    isPanning.current = true
    lastPointer.current = { x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning.current) return
    const dx = event.clientX - lastPointer.current.x
    const dy = event.clientY - lastPointer.current.y
    lastPointer.current = { x: event.clientX, y: event.clientY }
    setPan(current => ({ x: current.x + dx, y: current.y + dy }))
  }

  const stopPanning = () => {
    isPanning.current = false
  }

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    updateZoom(zoom + (event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!event.key.startsWith("Arrow")) return
    event.preventDefault()
    setPan(current => {
      if (event.key === "ArrowLeft") return { ...current, x: current.x + PAN_STEP }
      if (event.key === "ArrowRight") return { ...current, x: current.x - PAN_STEP }
      if (event.key === "ArrowUp") return { ...current, y: current.y + PAN_STEP }
      return { ...current, y: current.y - PAN_STEP }
    })
  }

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
      // captured element's own bounds.
      const cropX = Math.max(0, pan.x - EXPORT_CROP_PADDING)
      const cropY = Math.max(0, pan.y - EXPORT_CROP_PADDING)
      const cropWidth = Math.min(
        exportNode.clientWidth - cropX,
        bounds.width * zoom + EXPORT_CROP_PADDING * 2,
      )
      const cropHeight = Math.min(
        exportNode.clientHeight - cropY,
        bounds.height * zoom + EXPORT_CROP_PADDING * 2,
      )

      const canvas = await withExportSafeStyles(exportNode, () =>
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

  return (
    <>
      <Card className="gap-3 p-3 md:p-4">
        <Stack direction="row" wrap size="sm" className="w-full items-center justify-between">
          <Stack direction="row" wrap size="xs" className="items-center">
            <Badge variant="primary" prefix={<WorkflowIcon />}>
              {graph.nodes.length} techniques
            </Badge>
            <Badge variant="soft">{graph.edges.length} links</Badge>
            {NODE_TYPES.map(type => {
              const isActive = activeType === type.value

              return (
                // ONE visual family — the sliding pill is the single active indicator (a variant
                // flip on top would be a redundant double indicator). The pill lives at -z-10
                // inside the isolated Button, so it paints above the Button's own background but
                // below its label and never occludes the focus-visible ring. overflow-visible
                // lets the pill stay visible mid-slide between chips (cross-row slides included).
                <Button
                  key={type.value}
                  type="button"
                  size="sm"
                  variant="secondary"
                  aria-pressed={isActive}
                  className={cx(
                    "relative isolate overflow-visible",
                    isActive && "z-10 text-primary-foreground hover:text-primary-foreground",
                  )}
                  onClick={() => setActiveType(type.value)}
                >
                  <span
                    aria-hidden="true"
                    className={cx(
                      "size-2 shrink-0 rounded-full ring-1 ring-black/10",
                      type.dotClass,
                      isActive && "bg-primary-foreground",
                    )}
                  />
                  {type.label}
                  {isActive && (
                    // Mirrors the layoutId pill precedent in
                    // components/web/products/product-interval-switch.tsx:55-61 (unique layoutId —
                    // "indicator" is taken). Animates only on activeType change; keyboard
                    // Enter/Space hits the same onClick, so the pill moves identically.
                    <motion.span
                      aria-hidden="true"
                      layoutId="graph-type-pill"
                      className="absolute inset-0 -z-10 rounded-md bg-primary"
                      transition={{
                        type: "tween",
                        duration: prefersReducedMotion ? 0 : 0.125,
                        ease: "easeOut",
                      }}
                    />
                  )}
                </Button>
              )
            })}
          </Stack>

          <Stack direction="row" wrap size="xs">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              prefix={<MinusIcon />}
              aria-label="Zoom out"
              onClick={() => updateZoom(zoom - ZOOM_STEP)}
            >
              Out
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              prefix={<PlusIcon />}
              aria-label="Zoom in"
              onClick={() => updateZoom(zoom + ZOOM_STEP)}
            >
              In
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              prefix={<RotateCcwIcon />}
              onClick={() => {
                setZoom(1)
                setPan({ x: 48, y: 48 })
              }}
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              prefix={<FocusIcon />}
              onClick={fitToView}
            >
              Fit
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              prefix={<DownloadIcon />}
              isPending={isExporting}
              onClick={exportPng}
            >
              PNG
            </Button>
          </Stack>
        </Stack>

        <div
          ref={exportRef}
          className="relative h-[72vh] min-h-[520px] w-full overflow-hidden rounded-lg border bg-background"
        >
          <div
            ref={canvasRef}
            tabIndex={0}
            role="application"
            aria-label="BJJ technique graph"
            className="relative size-full cursor-grab touch-none bg-[radial-gradient(circle,_hsl(var(--border))_1px,_transparent_1px)] bg-[length:28px_28px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopPanning}
            onPointerLeave={stopPanning}
            onWheel={handleWheel}
            onKeyDown={handleKeyDown}
          >
            {/* One provider for the whole node layer: ~250ms hover-open (the L1 wrapper defaults
                delay to 0), while keyboard focus still opens instantly (Base UI focus-open is
                not delayed and the wrapper's data-instant:duration-0 skips the animation). */}
            <TooltipProvider delay={250}>
              <div
                className="absolute left-0 top-0"
                style={{
                  width: bounds.width,
                  height: bounds.height,
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: "0 0",
                }}
              >
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 overflow-visible"
                  width={bounds.width}
                  height={bounds.height}
                >
                  {visibleEdges.map(edge => (
                    <GraphEdge key={edge.id} edge={edge} nodeById={nodeById} />
                  ))}
                </svg>

                {visibleNodes.map(node => {
                  const tooltip = deriveNodeTooltip(node)

                  return (
                    // Force-closed while the node dialog is open (Base UI also closes on trigger
                    // press, but `disabled` makes it deterministic). Hover-open is mouse-only in
                    // Base UI, so touch keeps its tap→dialog behavior with no tooltip-on-tap.
                    <Tooltip key={node.id} disabled={selectedNodeId !== null}>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            className={cx(
                              "absolute flex flex-col justify-center gap-1 overflow-hidden rounded-lg border-2 px-3 text-left shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:z-10 hover:-translate-y-0.5 hover:shadow-md active:translate-y-px active:shadow-sm motion-reduce:transform-none motion-reduce:transition-none focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              selectedNodeId === node.id && "z-10 ring-2 ring-ring",
                              nodeTypeClass(node.type),
                            )}
                            data-graph-node-type={node.type}
                            style={{
                              left: node.x,
                              top: node.y,
                              width: NODE_WIDTH,
                              height: NODE_HEIGHT,
                            }}
                            aria-label={`${node.label}, ${labelForType(node.type)}`}
                            aria-pressed={selectedNodeId === node.id}
                            onClick={event => {
                              event.stopPropagation()
                              setSelectedNodeId(node.id)
                            }}
                          >
                            <span className="text-[0.625rem] font-semibold uppercase leading-none tracking-normal opacity-80">
                              {labelForType(node.type)}
                            </span>
                            <span className="line-clamp-2 text-sm font-semibold leading-tight">
                              {node.label}
                            </span>
                            {node.beltLevelMin?.colorHex && (
                              <>
                                <span
                                  aria-hidden="true"
                                  data-graph-belt-hairline
                                  className="absolute inset-x-0 bottom-[3px] h-px bg-border"
                                />
                                <span
                                  aria-hidden="true"
                                  data-graph-belt-color={node.beltLevelMin.colorHex}
                                  className="absolute inset-x-0 bottom-0 h-[3px]"
                                  style={{ backgroundColor: node.beltLevelMin.colorHex }}
                                />
                              </>
                            )}
                          </button>
                        }
                      />
                      {/* TEXT ONLY (strict no-media contract, see node-tooltip.ts) — never render
                        img/iframe/video or links/buttons in here. Portals to body, outside
                        exportRef, so the PNG export never captures an open tooltip. */}
                      <TooltipContent
                        side="top"
                        size="md"
                        className="flex-col items-start gap-1 text-left"
                      >
                        <span className="font-semibold">{tooltip.heading}</span>
                        <span className="text-[0.625rem] font-medium uppercase tracking-wide opacity-70">
                          {tooltip.typeLabel}
                        </span>
                        {tooltip.definition && (
                          <span className="opacity-90">{tooltip.definition}</span>
                        )}
                        {tooltip.keyPoints.length > 0 && (
                          <ul className="list-disc space-y-0.5 pl-4 opacity-90">
                            {tooltip.keyPoints.map(point => (
                              <li key={point}>{point}</li>
                            ))}
                          </ul>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </TooltipProvider>
          </div>
        </div>
      </Card>

      <Dialog open={!!selectedNode} onOpenChange={open => !open && setSelectedNodeId(null)}>
        <DialogContent className="max-w-2xl">
          {selectedNode && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedNode.label}</DialogTitle>
                <DialogDescription>
                  {selectedNode.description ?? "No description recorded."}
                </DialogDescription>
              </DialogHeader>

              <Stack direction="row" wrap size="xs">
                <Badge variant="primary">{labelForType(selectedNode.type)}</Badge>
                {selectedNode.position && <Badge variant="soft">{selectedNode.position}</Badge>}
                {selectedNode.difficultyLevel && (
                  <Badge variant="outline">{selectedNode.difficultyLevel}</Badge>
                )}
                {selectedNode.isFoundational && <Badge variant="success">Foundational</Badge>}
              </Stack>

              {selectedNode.teachingCues.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Teaching cues</p>
                  <Prose className="prose-sm max-w-none">
                    <ul>
                      {selectedNode.teachingCues.map(cue => (
                        <li key={cue}>{cue}</li>
                      ))}
                    </ul>
                  </Prose>
                </div>
              )}

              {selectedNode.curriculumItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Curriculum links</p>
                  <Stack direction="column" size="xs">
                    {selectedNode.curriculumItems.map(item => (
                      <Link
                        key={item.id}
                        href={`/courses/${item.courseSlug}`}
                        className="rounded-md border bg-card px-3 py-2 text-sm transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="font-medium">{item.title}</span>
                        <span className="block text-xs text-muted-foreground">
                          {item.courseTitle}
                        </span>
                      </Link>
                    ))}
                  </Stack>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="secondary"
                  render={<Link href={selectedNode.href} />}
                  onClick={() => setSelectedNodeId(null)}
                >
                  Technique Detail
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
