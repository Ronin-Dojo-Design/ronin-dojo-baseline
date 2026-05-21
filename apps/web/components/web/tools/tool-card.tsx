"use client"

import type { ComponentProps } from "react"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card, CardDescription, CardFooter, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { ShowMore } from "~/components/common/show-more"
import { Skeleton } from "~/components/common/skeleton"
import { Stack } from "~/components/common/stack"
import { ListingBookmarkButton } from "~/components/web/listings/listing-bookmark-button"
import { ListingStatusBadges, ListingTierBadge } from "~/components/web/listings/listing-tier-badge"
import { Favicon } from "~/components/web/ui/favicon"
import { VerifiedBadge } from "~/components/web/verified-badge"
import type { ToolMany } from "~/server/web/tools/payloads"

type ToolCardProps = ComponentProps<typeof Card> & {
  tool: ToolMany
}

const ToolCard = ({ tool, ...props }: ToolCardProps) => {
  return (
    <Card isRevealed {...props}>
      <CardHeader wrap={false}>
        <Favicon src={tool.faviconUrl} title={tool.name} contained />

        <H4 render={props => <h3 {...props}>{props.children}</h3>} className="truncate">
          <Link href={`/${tool.slug}`}>{tool.name}</Link>
        </H4>

        {tool.ownerId && <VerifiedBadge size="md" className="-ml-1.5" />}
        <ListingTierBadge tool={tool} className="ml-auto" />
      </CardHeader>

      <div className="relative size-full flex flex-col">
        <Stack size="lg" direction="column" className="flex-1 duration-200 group-hover:opacity-0">
          {tool.tagline && <CardDescription className="min-h-10">{tool.tagline}</CardDescription>}

          <ShowMore
            items={tool.categories}
            limit={1}
            renderItem={({ name }) => <Badge variant="outline">{name}</Badge>}
            size="xs"
            showMoreType="text"
            className="mt-auto"
          />

          <ListingStatusBadges tool={tool} />
        </Stack>

        {tool.description && (
          <div className="absolute inset-0 opacity-0 duration-200 group-hover:opacity-100">
            <CardDescription className="line-clamp-3">{tool.description}</CardDescription>
          </div>
        )}
      </div>

      <CardFooter className="mt-auto w-full justify-between">
        <Button size="sm" variant="secondary" render={<Link href={`/${tool.slug}`} />}>
          View Listing
        </Button>

        <ListingBookmarkButton toolId={tool.id} />
      </CardFooter>
    </Card>
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
