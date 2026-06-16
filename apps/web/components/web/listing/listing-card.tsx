"use client"

import type { ComponentProps, ReactNode } from "react"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card, CardDescription, CardFooter, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { ShowMore } from "~/components/common/show-more"
import { Skeleton } from "~/components/common/skeleton"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"

/**
 * ListingCard — SESSION_0396 shared Listing template (Tool→Listing parity, supersedes ADR 0013's
 * "no shared abstraction"). The ONE card every directory entity renders through: header (media +
 * title + badges), category badges, hover description, and a footer with a View button + Save slot.
 *
 * `tool-card.tsx` is now a thin adapter that wires `ToolMany` into these slots, so the live Tool
 * directory renders through this exact component — `ListingCard` is the canonical L1 card, lifted
 * from the original `ToolCard` markup with the tool-only values turned into props.
 */

type ListingCardCategory = { name: string; slug?: string | null }

type ListingCardProps = ComponentProps<typeof Card> & {
  /** Detail-page href; used by the title link and the View Listing button. */
  href: string
  name: string
  /** Leading media slot (e.g. a Favicon or discipline icon). */
  media?: ReactNode
  /** Header trailing badges (e.g. verified + tier); caller pushes right with `ml-auto`. */
  headerBadges?: ReactNode
  /** Single-line subtitle (e.g. tagline or discipline) — shown once, never duplicated. */
  tagline?: ReactNode
  /** Shared taxonomy badges (the `categories` relation). */
  categories?: ListingCardCategory[]
  /** Status badges above the footer (e.g. Featured/Verified). */
  statusBadges?: ReactNode
  /** Longer description revealed on hover. */
  description?: string | null
  /** Footer view-button label. Defaults to "View" (entity-agnostic). */
  viewLabel?: string
  /** Save/bookmark control slot. */
  save?: ReactNode
}

const ListingCard = ({
  href,
  name,
  media,
  headerBadges,
  tagline,
  categories,
  statusBadges,
  description,
  viewLabel = "View",
  save,
  ...props
}: ListingCardProps) => {
  return (
    <Card isRevealed {...props}>
      <CardHeader wrap={false}>
        {media}

        <H4
          render={props => <h3 {...props}>{props.children}</h3>}
          // text-nowrap overrides the H4 variant's text-balance (both set text-wrap-mode;
          // without this, balance defeats truncate's nowrap and long names wrap per word).
          className="min-w-0 flex-1 truncate text-nowrap"
        >
          <Link href={href}>{name}</Link>
        </H4>

        {headerBadges}
      </CardHeader>

      <div className="relative size-full flex flex-col">
        <Stack
          size="lg"
          direction="column"
          className={cx("flex-1", description && "duration-200 group-hover:opacity-0")}
        >
          {tagline && <CardDescription className="min-h-10">{tagline}</CardDescription>}

          {!!categories?.length && (
            <ShowMore
              items={categories}
              limit={1}
              renderItem={({ name }) => <Badge variant="outline">{name}</Badge>}
              size="xs"
              showMoreType="text"
              className="mt-auto"
            />
          )}

          {statusBadges}
        </Stack>

        {description && (
          <div className="absolute inset-0 opacity-0 duration-200 group-hover:opacity-100">
            <CardDescription className="line-clamp-3">{description}</CardDescription>
          </div>
        )}
      </div>

      <CardFooter className="mt-auto w-full justify-between">
        <Button size="sm" variant="secondary" render={<Link href={href} />}>
          {viewLabel}
        </Button>

        {save}
      </CardFooter>
    </Card>
  )
}

const ListingCardSkeleton = () => {
  return (
    <Card hover={false} className="items-stretch select-none">
      <CardHeader>
        <H4 className="w-2/3">
          <Skeleton>&nbsp;</Skeleton>
        </H4>
      </CardHeader>

      <CardDescription className="flex flex-col gap-0.5">
        <Skeleton className="h-5 w-4/5">&nbsp;</Skeleton>
        <Skeleton className="h-5 w-1/2">&nbsp;</Skeleton>
      </CardDescription>

      <Stack size="sm" className="mt-auto">
        {[...Array(2)].map((_, index) => (
          <Badge key={index} variant="outline" className="w-12">
            &nbsp;
          </Badge>
        ))}
      </Stack>
    </Card>
  )
}

export { ListingCard, type ListingCardProps, ListingCardSkeleton }
