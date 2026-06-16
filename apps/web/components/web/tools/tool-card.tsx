"use client"

import type { ComponentProps } from "react"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Skeleton } from "~/components/common/skeleton"
import { Stack } from "~/components/common/stack"
import { ListingCard } from "~/components/web/listing/listing-card"
import { ListingBookmarkButton } from "~/components/web/listings/listing-bookmark-button"
import { ListingStatusBadges, ListingTierBadge } from "~/components/web/listings/listing-tier-badge"
import { Favicon } from "~/components/web/ui/favicon"
import { VerifiedBadge } from "~/components/web/verified-badge"
import type { ToolMany } from "~/server/web/tools/payloads"

type ToolCardProps = ComponentProps<typeof Card> & {
  tool: ToolMany
}

/**
 * ToolCard — SESSION_0396: now a thin adapter over the shared `ListingCard` (one card to rule them
 * all). It maps the tool-only values (favicon, root `/${slug}` href, verified + tier badges, status
 * badges, tool bookmark) into ListingCard's slots. Tools render byte-identically AND inherit the
 * shared fixes (long-name truncation, no-description hover). Other entities wire their own data in.
 */
const ToolCard = ({ tool, ...props }: ToolCardProps) => {
  return (
    <ListingCard
      href={`/${tool.slug}`}
      name={tool.name}
      media={<Favicon src={tool.faviconUrl} title={tool.name} contained />}
      headerBadges={
        <>
          {tool.ownerId && <VerifiedBadge size="md" className="-ml-1.5" />}
          <ListingTierBadge tool={tool} className="ml-auto" />
        </>
      }
      tagline={tool.tagline}
      categories={tool.categories}
      statusBadges={<ListingStatusBadges tool={tool} />}
      description={tool.description}
      viewLabel="View Listing"
      save={<ListingBookmarkButton toolId={tool.id} />}
      {...props}
    />
  )
}

const ToolCardSkeleton = () => {
  return (
    <Card hover={false} className="items-stretch select-none">
      <CardHeader>
        <Favicon src="/favicon.png" className="animate-pulse opacity-25 grayscale" contained />

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

export { ToolCard, ToolCardSkeleton }
