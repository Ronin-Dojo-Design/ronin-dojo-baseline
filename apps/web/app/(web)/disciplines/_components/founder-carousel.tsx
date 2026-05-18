import { Card } from "~/components/common/card"
import { Carousel, CarouselSlide } from "~/components/common/carousel"
import { H4 } from "~/components/common/heading"

type FounderCarouselProps = {
  founders: string | null | undefined
}

/**
 * Displays discipline founders in a horizontal carousel.
 * Currently renders from the `foundedBy` string field (comma-separated names).
 * Will evolve to pull from a dedicated Founder relation when available.
 */
export function FounderCarousel({ founders }: FounderCarouselProps) {
  if (!founders) return null

  const founderList = founders
    .split(",")
    .map(f => f.trim())
    .filter(Boolean)

  if (founderList.length === 0) return null

  return (
    <section>
      <H4 as="h3" className="mb-4">
        Founders
      </H4>
      <Carousel>
        {founderList.map(name => (
          <CarouselSlide key={name} className="flex-[0_0_200px]">
            <Card className="flex h-full items-center justify-center p-4 text-center">
              <p className="font-medium text-sm">{name}</p>
            </Card>
          </CarouselSlide>
        ))}
      </Carousel>
    </section>
  )
}
