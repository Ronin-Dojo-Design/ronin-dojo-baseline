"use client"

import type { ComponentProps } from "react"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Skeleton } from "~/components/common/skeleton"

type SchoolCardData = {
  slug: string
  name: string
  description: string | null
  city: string | null
  region: string | null
  type: string | null
  disciplines?: { discipline: { name: string } }[]
}

type SchoolCardProps = ComponentProps<typeof Card> & {
  school: SchoolCardData
}

export const SchoolCard = ({ school, ...props }: SchoolCardProps) => {
  return (
    <Card isRevealed {...props}>
      <CardHeader wrap={false}>
        <H4 as="h3" className="truncate">
          <Link href={`/schools/${school.slug}`}>
            <span className="absolute inset-0 z-10" />
            {school.name}
          </Link>
        </H4>
        {school.type && (
          <Badge variant="outline" className="-ml-1.5">
            {school.type.replace(/_/g, " ")}
          </Badge>
        )}
      </CardHeader>

      <div className="relative size-full flex flex-col">
        <Stack size="lg" direction="column" className="flex-1">
          {school.description && (
            <CardDescription className="line-clamp-2 min-h-10">
              {school.description}
            </CardDescription>
          )}

          {(school.city || school.region) && (
            <CardDescription className="text-xs">
              {[school.city, school.region].filter(Boolean).join(", ")}
            </CardDescription>
          )}

          {school.disciplines && school.disciplines.length > 0 && (
            <Stack size="sm" className="mt-auto flex-wrap">
              {school.disciplines.map(d => (
                <Badge key={d.discipline.name} variant="soft">{d.discipline.name}</Badge>
              ))}
            </Stack>
          )}
        </Stack>
      </div>
    </Card>
  )
}

export const SchoolCardSkeleton = () => {
  return (
    <Card hover={false} className="items-stretch select-none">
      <CardHeader>
        <H4 className="w-2/3"><Skeleton>&nbsp;</Skeleton></H4>
      </CardHeader>
      <CardDescription className="flex flex-col gap-0.5">
        <Skeleton className="h-5 w-4/5">&nbsp;</Skeleton>
        <Skeleton className="h-5 w-1/2">&nbsp;</Skeleton>
      </CardDescription>
      <Stack size="sm" className="mt-auto">
        {[...Array(2)].map((_, i) => (
          <Badge key={i} variant="outline" className="w-12">&nbsp;</Badge>
        ))}
      </Stack>
    </Card>
  )
}
