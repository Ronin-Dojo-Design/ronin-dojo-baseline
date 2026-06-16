"use client"

import type { ComponentProps } from "react"
import { Badge } from "~/components/common/badge"
import { ListingCard, ListingCardSkeleton } from "~/components/web/listing/listing-card"
import { ListingSaveButton } from "~/components/web/listing/listing-save-button"
import type { TechniqueMany } from "~/server/web/techniques/payloads"

type TechniqueCardProps = Omit<ComponentProps<typeof ListingCard>, "href" | "name"> & {
  technique: TechniqueMany
}

const TechniqueCard = ({ technique, ...props }: TechniqueCardProps) => {
  return (
    <ListingCard
      href={`/techniques/${technique.slug}`}
      name={technique.name}
      tagline={technique.discipline?.name}
      categories={technique.categories}
      description={technique.description}
      headerBadges={
        technique.isFoundational && (
          <Badge variant="success" className="ml-auto">
            Foundational
          </Badge>
        )
      }
      save={<ListingSaveButton subjectType="TECHNIQUE" subjectId={technique.id} />}
      {...props}
    />
  )
}

const TechniqueCardSkeleton = ListingCardSkeleton

export { TechniqueCard, type TechniqueCardProps, TechniqueCardSkeleton }
