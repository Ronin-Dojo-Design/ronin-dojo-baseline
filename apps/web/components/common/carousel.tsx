"use client"

import type { EmblaOptionsType } from "embla-carousel"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Button } from "~/components/common/button"
import { cx } from "~/lib/utils"

type CarouselProps = {
  options?: EmblaOptionsType
  children: React.ReactNode
  className?: string
}

export function Carousel({ options, children, className }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, ...options })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

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
  }, [emblaApi, onSelect])

  return (
    <div className={cx("relative", className)}>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-4">{children}</div>
      </div>

      {canScrollPrev && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-1/2 left-2 -translate-y-1/2 size-8 rounded-full p-0"
          onClick={scrollPrev}
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
      )}

      {canScrollNext && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-1/2 right-2 -translate-y-1/2 size-8 rounded-full p-0"
          onClick={scrollNext}
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      )}
    </div>
  )
}

export function CarouselSlide({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cx("min-w-0 flex-[0_0_280px]", className)}>{children}</div>
}
