"use client"

import type { ComponentProps } from "react"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { ShowMore } from "~/components/common/show-more"
import { Skeleton } from "~/components/common/skeleton"
import { Stack } from "~/components/common/stack"

export type SchoolCardData = {
  slug: string
  name: string
  description: string | null
  city: string | null
  region: string | null
  type: string | null
  phoneE164: string | null
  email: string | null
  websiteUrl: string | null
  disciplines?: { discipline: { name: string } }[]
}

type SchoolCardProps = ComponentProps<typeof Card> & {
  school: SchoolCardData
}

export const SchoolCard = ({ school, ...props }: SchoolCardProps) => {
  const location = [school.city, school.region].filter(Boolean).join(", ")
  const disciplines = school.disciplines ?? []

  return (
    <Card isRevealed {...props}>
      <CardHeader wrap={false}>
        <H4 render={props => <h3 {...props}>{props.children}</h3>} className="truncate">
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
        <Stack size="lg" direction="column" className="flex-1 duration-200 group-hover:opacity-0">
          {location && <CardDescription className="min-h-10">{location}</CardDescription>}

          <ShowMore
            items={disciplines}
            limit={2}
            renderItem={d => <Badge variant="soft">{d.discipline.name}</Badge>}
            size="xs"
            showMoreType="text"
            className="mt-auto flex-wrap"
          />
        </Stack>

        <div className="absolute inset-0 opacity-0 duration-200 group-hover:opacity-100">
          <Stack direction="column" size="sm" className="w-full">
            {school.description && (
              <CardDescription className="line-clamp-2">{school.description}</CardDescription>
            )}
            {(school.phoneE164 || school.email || school.websiteUrl) && (
              <Stack
                direction="column"
                size="sm"
                className="relative z-20 w-full text-sm text-muted-foreground"
              >
                {school.phoneE164 && (
                  <a
                    href={`tel:${school.phoneE164}`}
                    className="hover:text-primary hover:underline truncate"
                  >
                    {school.phoneE164}
                  </a>
                )}
                {school.email && (
                  <a
                    href={`mailto:${school.email}`}
                    className="hover:text-primary hover:underline truncate"
                  >
                    {school.email}
                  </a>
                )}
                {school.websiteUrl && (
                  <a
                    href={school.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary hover:underline truncate"
                  >
                    {school.websiteUrl.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </Stack>
            )}
          </Stack>
        </div>
      </div>
    </Card>
  )
}

export const SchoolCardSkeleton = () => {
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
        {[...Array(2)].map((_, i) => (
          <Badge key={i} variant="outline" className="w-12">
            &nbsp;
          </Badge>
        ))}
      </Stack>
    </Card>
  )
}
