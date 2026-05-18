"use client"

import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { Carousel, CarouselSlide } from "~/components/common/carousel"
import { H4 } from "~/components/common/heading"

type MemberByRank = {
  id: string
  name: string | null
  rankName: string
  rankSortOrder: number
}

type MemberCarouselByRankProps = {
  members: MemberByRank[]
}

/**
 * Horizontal carousel showing members grouped visually by rank level.
 * Expects pre-fetched + sorted data from the server component.
 */
export function MemberCarouselByRank({ members }: MemberCarouselByRankProps) {
  if (members.length === 0) return null

  return (
    <section>
      <H4 as="h3" className="mb-4">
        Members by Rank
      </H4>
      <Carousel>
        {members.map(m => (
          <CarouselSlide key={m.id} className="flex-[0_0_180px]">
            <Card className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
              <p className="truncate text-sm font-medium">{m.name ?? "Member"}</p>
              <Badge variant="soft" size="sm">
                {m.rankName}
              </Badge>
            </Card>
          </CarouselSlide>
        ))}
      </Carousel>
    </section>
  )
}
