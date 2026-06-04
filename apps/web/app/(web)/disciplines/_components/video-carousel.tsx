"use client"

import { Card } from "~/components/common/card"
import { Carousel, CarouselSlide } from "~/components/common/carousel"
import { H4 } from "~/components/common/heading"

type Video = {
  id: string
  title: string
  thumbnailUrl?: string | null
}

type VideoCarouselProps = {
  videos: Video[]
  title?: string
}

/**
 * Horizontal carousel for video highlights / course videos.
 * Placeholder until Mux integration is complete.
 */
export function VideoCarousel({ videos, title = "Videos" }: VideoCarouselProps) {
  if (videos.length === 0) return null

  return (
    <section className="w-full min-w-0">
      <H4 render={props => <h3 {...props}>{props.children}</h3>} className="mb-4">
        {title}
      </H4>
      <Carousel ariaLabel={`${title} carousel`}>
        {videos.map(v => (
          <CarouselSlide key={v.id} className="flex-[0_0_300px]">
            <Card className="flex h-[180px] flex-col items-center justify-center overflow-hidden">
              {v.thumbnailUrl ? (
                <img src={v.thumbnailUrl} alt={v.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <span className="text-sm text-muted-foreground">Coming soon</span>
                </div>
              )}
            </Card>
            <p className="mt-2 truncate text-sm font-medium">{v.title}</p>
          </CarouselSlide>
        ))}
      </Carousel>
    </section>
  )
}
