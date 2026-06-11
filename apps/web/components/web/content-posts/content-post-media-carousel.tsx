"use client"

import Image from "next/image"
import { Carousel, CarouselSlide } from "~/components/common/carousel"

type ContentPostMedia = {
  id: string
  type: "IMAGE" | "VIDEO" | "YOUTUBE" | "DOCUMENT"
  url: string
  thumbnailUrl?: string | null
  title?: string | null
  altText?: string | null
  widthPx?: number | null
  heightPx?: number | null
}

type ContentPostMediaCarouselProps = {
  media: ContentPostMedia[]
  title: string
  fallbackImageUrl?: string | null
}

const imageFromFallback = (url: string, title: string): ContentPostMedia => ({
  id: "fallback-thumbnail",
  type: "IMAGE",
  url,
  title,
  altText: title,
})

export function ContentPostMediaCarousel({
  media,
  title,
  fallbackImageUrl,
}: ContentPostMediaCarouselProps) {
  const items = media.length
    ? media
    : fallbackImageUrl
      ? [imageFromFallback(fallbackImageUrl, title)]
      : []

  if (!items.length) {
    return null
  }

  const renderMedia = (item: ContentPostMedia) => {
    const label = item.title ?? title
    const alt = item.altText ?? label

    if (item.type === "VIDEO") {
      return (
        // Captions are stored outside the current Media model; add tracks when
        // the content engine records caption asset URLs.
        // oxlint-disable-next-line jsx-a11y/media-has-caption -- caption metadata is not available yet.
        <video
          controls
          preload="metadata"
          poster={item.thumbnailUrl ?? undefined}
          className="h-full w-full bg-black object-cover"
        >
          <source src={item.url} />
        </video>
      )
    }

    if (item.type === "YOUTUBE") {
      return (
        <iframe
          src={item.url}
          title={label}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full border-0"
        />
      )
    }

    if (item.type === "DOCUMENT" && !item.thumbnailUrl) {
      return (
        <a
          href={item.url}
          className="flex h-full w-full items-center justify-center bg-muted p-6 text-center font-medium text-secondary-foreground text-sm hover:underline"
        >
          {label}
        </a>
      )
    }

    return (
      <Image
        src={item.type === "DOCUMENT" ? item.thumbnailUrl || item.url : item.url}
        alt={alt}
        width={item.widthPx ?? 1200}
        height={item.heightPx ?? 630}
        loading="eager"
        className="h-full w-full object-cover"
      />
    )
  }

  return (
    <div className="w-full min-w-0">
      <Carousel
        ariaLabel={`${title} media carousel`}
        className="overflow-hidden rounded-lg bg-muted"
        options={{ align: "start" }}
      >
        {items.map(item => (
          <CarouselSlide key={item.id} className="flex-[0_0_100%]">
            <div className="relative aspect-video w-full overflow-hidden">{renderMedia(item)}</div>
          </CarouselSlide>
        ))}
      </Carousel>
    </div>
  )
}
