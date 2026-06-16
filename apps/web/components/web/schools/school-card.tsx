"use client"

import type { ComponentProps } from "react"
import { Avatar, AvatarFallback } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { ListingCard, ListingCardSkeleton } from "~/components/web/listing/listing-card"
import { ListingSaveButton } from "~/components/web/listing/listing-save-button"
import { initialsOf } from "~/lib/directory/facet-result"

/**
 * SchoolCard — SESSION_0397. Folded into the shared `ListingCard` (Tool→Listing parity, ADR 0028):
 * now a thin adapter that wires school data into `ListingCard`'s slots, exactly like `ToolCard`.
 * The pre-0397 bespoke hover-reveals-contact card is retired — contact info lives on the school
 * detail page; the card shows the standard description-on-hover and gains a persisted Save
 * (subjectType ORGANIZATION). One card across `/schools` and `/directory/schools`.
 */

export type SchoolCardData = {
  /** Organization id — the Save subject (SESSION_0397). */
  id: string
  slug: string
  name: string
  description: string | null
  city: string | null
  region: string | null
  type: string | null
  // Contact fields stay on the data shape (returned by searchOrganizations) but are no longer shown
  // on the card — they surface on the school detail page.
  phoneE164: string | null
  email: string | null
  websiteUrl: string | null
  disciplines?: { discipline: { name: string } }[]
}

type SchoolCardProps = Omit<ComponentProps<typeof ListingCard>, "href" | "name"> & {
  school: SchoolCardData
}

export const SchoolCard = ({ school, ...props }: SchoolCardProps) => {
  const location = [school.city, school.region].filter(Boolean).join(", ")

  return (
    <ListingCard
      href={`/schools/${school.slug}`}
      name={school.name}
      media={
        <Avatar className="size-9 shrink-0">
          <AvatarFallback>{initialsOf(school.name)}</AvatarFallback>
        </Avatar>
      }
      headerBadges={
        school.type && (
          <Badge variant="outline" className="ml-auto">
            {school.type.replace(/_/g, " ")}
          </Badge>
        )
      }
      tagline={location || undefined}
      categories={(school.disciplines ?? []).map(({ discipline }) => ({ name: discipline.name }))}
      description={school.description}
      save={<ListingSaveButton subjectType="ORGANIZATION" subjectId={school.id} />}
      {...props}
    />
  )
}

export const SchoolCardSkeleton = ListingCardSkeleton
