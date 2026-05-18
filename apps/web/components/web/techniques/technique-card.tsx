"use client"

import type { ComponentProps } from "react"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Skeleton } from "~/components/common/skeleton"
import { Stack } from "~/components/common/stack"
import type { TechniqueMany } from "~/server/web/techniques/payloads"

type TechniqueCardProps = ComponentProps<typeof Card> & {
  technique: TechniqueMany
}

const TechniqueCard = ({ technique, ...props }: TechniqueCardProps) => {
  return (
    <Card isRevealed {...props}>
      <CardHeader wrap={false}>
        <H4 as="h3" className="truncate">
          <Link href={`/techniques/${technique.slug}`}>
            <span className="absolute inset-0 z-10" />
            {technique.name}
          </Link>
        </H4>

        {technique.isFoundational && (
          <Badge variant="success" className="-ml-1.5">
            Foundational
          </Badge>
        )}
      </CardHeader>

      <div className="relative size-full flex flex-col">
        <Stack size="lg" direction="column" className="flex-1">
          {technique.description && (
            <CardDescription className="line-clamp-2 min-h-10">
              {technique.description}
            </CardDescription>
          )}

          <Stack size="sm" className="mt-auto flex-wrap">
            {technique.category && (
              <Badge variant="outline">{technique.category.replace(/_/g, " ")}</Badge>
            )}
            {technique.position && (
              <Badge variant="outline">{technique.position.replace(/_/g, " ")}</Badge>
            )}
            {technique.discipline && <Badge variant="soft">{technique.discipline.name}</Badge>}
          </Stack>
        </Stack>
      </div>
    </Card>
  )
}

const TechniqueCardSkeleton = () => {
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

export { TechniqueCard, type TechniqueCardProps, TechniqueCardSkeleton }
