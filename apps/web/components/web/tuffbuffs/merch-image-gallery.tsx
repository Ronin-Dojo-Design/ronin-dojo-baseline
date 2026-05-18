"use client"

import { useState } from "react"
import { cx } from "~/lib/utils"

type MerchImageGalleryProps = {
  images: string[]
  alt: string
}

/**
 * Merch product image gallery — shows a main image with thumbnail selectors.
 * Falls back to branded placeholder when no real images exist.
 *
 * @see docs/sprints/SESSION_0112.md TASK_03
 */
export function MerchImageGallery({ images, alt }: MerchImageGalleryProps) {
  const hasRealImages = images.length > 0 && !images.every(p => p.includes("placeholder"))
  const displayImages = hasRealImages ? images.filter(p => !p.includes("placeholder")) : []
  const [activeIndex, setActiveIndex] = useState(0)

  if (displayImages.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/50">
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl font-bold text-muted-foreground/40">TB</span>
          <span className="text-sm text-muted-foreground/50">Image coming soon</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-muted/50 p-4">
        <img src={displayImages[activeIndex]} alt={alt} className="h-full w-full object-contain" />
      </div>

      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {displayImages.map((src, i) => (
            <button
              key={src}
              type="button"
              title={`View image ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              className={cx(
                "h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-muted/50 p-1 transition-colors",
                i === activeIndex
                  ? "border-foreground"
                  : "border-transparent hover:border-muted-foreground/50",
              )}
            >
              <img src={src} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
