"use client"

import { Badge } from "~/components/common/badge"
import { Carousel, CarouselSlide } from "~/components/common/carousel"
import { H3 } from "~/components/common/heading"
import { TechniqueCard } from "~/components/web/techniques/technique-card"
import { toVideoThumbnailUrl } from "~/lib/video-embed"
import type { TechniqueRail as TechniqueRailItem } from "~/server/web/techniques/payloads"

type TechniqueRailProps = {
  title: string
  subtitle?: string
  /** The total techniques in this category (the rail shows a capped subset). */
  total: number
  techniques: TechniqueRailItem[]
}

/**
 * One browse-by-category video rail (Stream D2) — a titled horizontal snap-scroll of
 * `TechniqueCard`s. Reuses the shared Embla `Carousel` primitive (arrows + drag-snap +
 * edge fades); the per-card play indicator lights when the technique carries a video.
 * Parity target: the OLD BBL `BBLCurriculumRail` per-category rail.
 */
export function TechniqueRail({ title, subtitle, total, techniques }: TechniqueRailProps) {
  if (techniques.length === 0) return null

  return (
    <section className="w-full min-w-0 space-y-4">
      <header className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <H3 render={props => <h3 {...props}>{props.children}</h3>} className="truncate">
            {title}
          </H3>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <Badge variant="outline" size="lg" className="shrink-0">
          {total} techniques
        </Badge>
      </header>

      <Carousel ariaLabel={`${title} techniques`} edgeFades>
        {techniques.map(technique => {
          const video = technique.mediaAttachments[0]?.media
          // YOUTUBE Media carries a stored thumbnail; fall back to deriving it from the
          // watch URL (VIDEO uploads use their own `thumbnailUrl`, else no poster).
          const posterUrl = video ? (video.thumbnailUrl ?? toVideoThumbnailUrl(video.url)) : null

          return (
            <CarouselSlide key={technique.slug} width={280}>
              <TechniqueCard
                technique={technique}
                hasVideo={Boolean(video)}
                thumbnailUrl={posterUrl}
                className="h-full"
              />
            </CarouselSlide>
          )
        })}
      </Carousel>
    </section>
  )
}
