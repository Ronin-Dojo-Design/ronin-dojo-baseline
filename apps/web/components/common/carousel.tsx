"use client"

import type { EmblaOptionsType } from "embla-carousel"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import {
  type AriaRole,
  Children,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { Button } from "~/components/common/button"
import { cx } from "~/lib/utils"

type CarouselProps = {
  options?: EmblaOptionsType
  children: ReactNode
  className?: string
  emptyState?: ReactNode
  ariaLabel?: string
  role?: AriaRole
  edgeFades?: boolean
  controls?: "always" | "desktop" | "none"
}

const controlVisibilityClasses = {
  always: "",
  desktop: "max-md:hidden",
  none: "",
} satisfies Record<NonNullable<CarouselProps["controls"]>, string>

export function Carousel({
  options,
  children,
  className,
  emptyState,
  ariaLabel,
  role,
  edgeFades = false,
  controls = "always",
}: CarouselProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, ...options })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const slides = useMemo(
    () =>
      Children.toArray(children).filter(
        child => child !== null && child !== undefined && typeof child !== "boolean",
      ),
    [children],
  )

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const setViewportRef = useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node
      emblaRef(node)
    },
    [emblaRef],
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)

    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi, onSelect])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.reInit()
    onSelect()
  }, [emblaApi, onSelect, slides.length])

  useEffect(() => {
    if (!emblaApi || typeof ResizeObserver === "undefined") return
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport) return

    let frame = 0
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => emblaApi.reInit())
    })

    observer.observe(viewport)
    if (track) {
      observer.observe(track)
    }

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [emblaApi])

  if (slides.length === 0 && emptyState !== undefined) {
    return emptyState
  }

  const showControls = controls !== "none"
  const controlsClassName = controlVisibilityClasses[controls]
  const regionProps = ariaLabel ? { role: role ?? "region", "aria-label": ariaLabel } : {}

  return (
    <div {...regionProps} className={cx("relative w-full min-w-0 max-w-full", className)}>
      <div ref={setViewportRef} className="w-full min-w-0 max-w-full overflow-hidden">
        <div ref={trackRef} className="flex min-w-0 gap-4">
          {slides}
        </div>
      </div>

      {edgeFades && canScrollPrev && (
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background via-background/80 to-transparent"
          aria-hidden="true"
        />
      )}

      {edgeFades && canScrollNext && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background via-background/80 to-transparent"
          aria-hidden="true"
        />
      )}

      {showControls && canScrollPrev && (
        <Button
          variant="secondary"
          size="sm"
          className={cx(
            "absolute top-1/2 left-2 z-20 -translate-y-1/2 size-8 rounded-full p-0",
            controlsClassName,
          )}
          onClick={scrollPrev}
          aria-label="Scroll carousel left"
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
      )}

      {showControls && canScrollNext && (
        <Button
          variant="secondary"
          size="sm"
          className={cx(
            "absolute top-1/2 right-2 z-20 -translate-y-1/2 size-8 rounded-full p-0",
            controlsClassName,
          )}
          onClick={scrollNext}
          aria-label="Scroll carousel right"
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      )}
    </div>
  )
}

const slideWidthClasses = {
  168: "flex-[0_0_168px]",
  248: "flex-[0_0_248px]",
  280: "flex-[0_0_280px]",
} as const

export function CarouselSlide({
  children,
  className,
  width = 280,
}: {
  children: ReactNode
  className?: string
  width?: keyof typeof slideWidthClasses
}) {
  const hasCustomBasis = className?.includes("flex-[") || className?.includes("basis-")

  return (
    <div
      data-carousel-item="true"
      className={cx("min-w-0", hasCustomBasis ? null : slideWidthClasses[width], className)}
    >
      {children}
    </div>
  )
}
