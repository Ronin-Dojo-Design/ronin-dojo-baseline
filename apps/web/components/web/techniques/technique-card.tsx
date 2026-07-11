"use client"

import { LockIcon, PlayIcon } from "lucide-react"
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
  /** Rail-only: a video poster (YouTube `hqdefault` / upload thumbnail) rendered as the card hero. */
  thumbnailUrl?: string | null
}

const TechniqueCard = ({ technique, hasVideo, thumbnailUrl, ...props }: TechniqueCardProps) => {
  return (
    <ListingCard
      href={`/techniques/${technique.slug}`}
      name={technique.name}
      tagline={technique.discipline?.name}
      categories={technique.categories}
      description={technique.description}
      mediaTop={
        thumbnailUrl ? (
          <div className="relative aspect-video bg-muted">
            <img
              src={thumbnailUrl}
              alt=""
              className="size-full object-cover"
              loading="lazy"
              aria-hidden
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/10">
              <span className="flex size-11 items-center justify-center rounded-full bg-black/60 ring-1 ring-white/30">
                <PlayIcon className="size-5 fill-white text-white" />
              </span>
            </div>
          </div>
        ) : undefined
      }
      headerBadges={
        // With a poster hero the play overlay already signals video, so the Video badge
        // only shows as the no-poster fallback (Foundational always; the Premium lock badge
        // shows on every premium technique — the "locked preview" upsell signal).
        (technique.isFoundational || technique.isPremium || (hasVideo && !thumbnailUrl)) && (
          <div className="ml-auto flex items-center gap-1.5">
            {technique.isPremium && (
              <Badge variant="warning" prefix={<LockIcon className="size-3" />}>
                Premium
              </Badge>
            )}
            {hasVideo && !thumbnailUrl && (
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
