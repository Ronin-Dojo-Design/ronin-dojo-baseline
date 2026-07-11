"use client"

import { PlayIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { Badge } from "~/components/common/badge"
import { ListingCard, ListingCardSkeleton } from "~/components/web/listing/listing-card"
import { ListingSaveButton } from "~/components/web/listing/listing-save-button"
import { TechniqueBeltBadge } from "~/components/web/techniques/technique-belt-badge"
import type { TechniqueMany } from "~/server/web/techniques/payloads"

type TechniqueCardProps = Omit<ComponentProps<typeof ListingCard>, "href" | "name"> & {
  technique: TechniqueMany
  /** Rail-only: show a small play indicator when the technique carries a video (Stream D2). */
  hasVideo?: boolean
}

const TechniqueCard = ({ technique, hasVideo, ...props }: TechniqueCardProps) => {
  return (
    <ListingCard
      href={`/techniques/${technique.slug}`}
      name={technique.name}
      tagline={technique.discipline?.name}
      categories={technique.categories}
      description={technique.description}
      headerBadges={
        (technique.isFoundational || hasVideo) && (
          <div className="ml-auto flex items-center gap-1.5">
            {hasVideo && (
              <Badge variant="danger" prefix={<PlayIcon className="size-3 fill-current" />}>
                Video
              </Badge>
            )}
            {technique.isFoundational && <Badge variant="success">Foundational</Badge>}
          </div>
        )
      }
      statusBadges={<TechniqueBeltBadge belt={technique.beltLevelMin} />}
      save={<ListingSaveButton subjectType="TECHNIQUE" subjectId={technique.id} />}
      {...props}
    />
  )
}

const TechniqueCardSkeleton = ListingCardSkeleton

export { TechniqueCard, type TechniqueCardProps, TechniqueCardSkeleton }
