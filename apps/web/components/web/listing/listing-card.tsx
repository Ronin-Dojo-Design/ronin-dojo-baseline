"use client"

import { useTranslations } from "next-intl"
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
 * "no shared abstraction"). The ONE card every catalog entity renders through (doctrine §5): header
 * (media + title + badges), category badges, hover description, and a footer with a View button +
 * Save slot. `tool-card.tsx` is the reference adapter (the live Tool directory renders through this).
 *
 * Progressive enrichment is a DENSITY, not a fork (doctrine §5): the optional `mediaTop` slot adds a
 * full-bleed top hero (blog post / merch product image) and `footer` replaces the default View+Save
 * footer (blog date·read-time / merch price·Buy) — the SAME component, richer. The 5 bespoke catalog
 * cards (course/post/merch/tournament/facet-result) fold onto this via these slots (SESSION_0470).
 */

type ListingCardCategory = { name: string; slug?: string | null }

type ListingCardProps = ComponentProps<typeof Card> & {
  /** Detail-page href; used by the title link and the View Listing button. */
  href: string
  name: string
  /**
   * Full-bleed top hero (the "rich" density) — a blog/merch image rendered edge-to-edge above the
   * header. ListingCard owns the bleed; the caller passes a plain `<Image>` / `<img>`. Omit for the
   * default (compact) density. Pairs with `overflow-clip` so the hero clips to the card radius.
   */
  mediaTop?: ReactNode
  /** Leading media slot (e.g. a Favicon or discipline icon), inline with the title. */
  media?: ReactNode
  /** Header trailing badges (e.g. verified + tier); caller pushes right with `ml-auto`. */
  headerBadges?: ReactNode
  /** Single-line subtitle (e.g. tagline or discipline) — shown once, never duplicated. */
  tagline?: ReactNode
  /** Shared taxonomy badges (the `categories` relation). */
  categories?: ListingCardCategory[]
  /** Status badges above the footer (e.g. Featured/Verified, or tournament meta rows). */
  statusBadges?: ReactNode
  /** Longer description revealed on hover. */
  description?: string | null
  /** Footer view-button label. Defaults to the i18n "View" (entity-agnostic). */
  viewLabel?: string
  /** Save/bookmark control slot (right of the default View button). */
  save?: ReactNode
  /**
   * Replaces the default `View + save` footer content with a custom footer (still `justify-between`
   * inside the `CardFooter`): blog → `date · read-time`, merch → `price · Buy`. Takes precedence over
   * `viewLabel`/`save`. Omit for the standard catalog footer.
   */
  footer?: ReactNode
}

const ListingCard = ({
  href,
  name,
  mediaTop,
  media,
  headerBadges,
  tagline,
  categories,
  statusBadges,
  description,
  viewLabel,
  save,
  footer,
  className,
  ...props
}: ListingCardProps) => {
  const t = useTranslations("components.listing")

  return (
    <Card isRevealed className={cx(mediaTop ? "overflow-clip" : undefined, className)} {...props}>
      {mediaTop ? <div className="-mx-5 -mt-5 mb-1 overflow-clip">{mediaTop}</div> : null}

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
          // C2-7: the hover swap (tagline out → description in) is a POINTER affordance — gate it to
          // `md:` (fine-pointer/desktop) so touch users, who never hover, don't lose the tagline. On
          // `max-md` the tagline stays put and the description renders inline below (see the block).
          className={cx("flex-1", description && "duration-200 md:group-hover:opacity-0")}
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

          {/* Touch/no-hover surface: render the description in normal flow at `max-md` so it's
              actually reachable (the desktop hover overlay below is `md:` only). */}
          {description && (
            <CardDescription className="line-clamp-3 md:hidden">{description}</CardDescription>
          )}
        </Stack>

        {/* Desktop hover overlay — fades in over the tagline on pointer hover; hidden on touch. */}
        {description && (
          <div className="absolute inset-0 hidden opacity-0 duration-200 group-hover:opacity-100 md:block">
            <CardDescription className="line-clamp-3">{description}</CardDescription>
          </div>
        )}
      </div>

      <CardFooter className="mt-auto w-full justify-between">
        {footer ?? (
          <>
            <Button size="sm" variant="secondary" render={<Link href={href} />}>
              {viewLabel ?? t("view")}
            </Button>

            {save}
          </>
        )}
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
