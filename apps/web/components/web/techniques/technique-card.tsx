"use client"

import type { ComponentProps } from "react"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { ShowMore } from "~/components/common/show-more"
import { Skeleton } from "~/components/common/skeleton"
import { Stack } from "~/components/common/stack"
import type { TechniqueMany } from "~/server/web/techniques/payloads"

type TechniqueCardProps = ComponentProps<typeof Card> & {
  technique: TechniqueMany
}

const TechniqueCard = ({ technique, ...props }: TechniqueCardProps) => {
  const chips = [
    technique.category && {
      key: `cat-${technique.category}`,
      label: technique.category.replace(/_/g, " "),
      variant: "outline" as const,
    },
    technique.position && {
      key: `pos-${technique.position}`,
      label: technique.position.replace(/_/g, " "),
      variant: "outline" as const,
    },
    technique.discipline && {
      key: `disc-${technique.discipline.name}`,
      label: technique.discipline.name,
      variant: "soft" as const,
    },
  ].filter((chip): chip is { key: string; label: string; variant: "outline" | "soft" } =>
    Boolean(chip),
  )

  return (
    <Card isRevealed {...props}>
      <CardHeader wrap={false}>
        <H4 render={props => <h3 {...props}>{props.children}</h3>} className="truncate">
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
        <Stack size="lg" direction="column" className="flex-1 duration-200 group-hover:opacity-0">
          {technique.discipline && (
            <CardDescription className="min-h-10">{technique.discipline.name}</CardDescription>
          )}

          <ShowMore
            items={chips}
            limit={2}
            renderItem={chip => <Badge variant={chip.variant}>{chip.label}</Badge>}
            size="xs"
            showMoreType="text"
            className="mt-auto flex-wrap"
          />
        </Stack>

        {technique.description && (
          <div className="absolute inset-0 opacity-0 duration-200 group-hover:opacity-100">
            <CardDescription className="line-clamp-3">{technique.description}</CardDescription>
          </div>
        )}
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
