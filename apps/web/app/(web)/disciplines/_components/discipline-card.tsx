"use client"

import { useTranslations } from "next-intl"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { ShowMore } from "~/components/common/show-more"
import { Skeleton } from "~/components/common/skeleton"
import { Stack } from "~/components/common/stack"

interface DisciplineCardData {
  id: string
  name: string
  slug: string
  code: string | null
  defaultInstructorTitle: string | null
  _count: {
    organizations: number
    rankSystems: number
    memberships: number
    programs: number
    courses: number
  }
}

interface DisciplineCardProps {
  discipline: DisciplineCardData
}

export function DisciplineCard({ discipline }: DisciplineCardProps) {
  const t = useTranslations("disciplines")

  const stats = [
    {
      key: "rankSystems",
      label: t("counts.ranks", { count: discipline._count.rankSystems }),
    },
    {
      key: "organizations",
      label: t("counts.orgs", { count: discipline._count.organizations }),
    },
    {
      key: "memberships",
      label: t("counts.members", { count: discipline._count.memberships }),
    },
  ]

  return (
    <Card isRevealed>
      <CardHeader wrap={false}>
        <H4 render={props => <h3 {...props}>{props.children}</h3>} className="truncate">
          <Link href={`/disciplines/${discipline.slug}`}>
            <span className="absolute inset-0 z-10" />
            {discipline.name}
          </Link>
        </H4>

        {discipline.code && (
          <Badge variant="outline" size="sm" className="-ml-1.5">
            {discipline.code}
          </Badge>
        )}
      </CardHeader>

      <div className="relative size-full flex flex-col">
        <Stack size="lg" direction="column" className="flex-1 duration-200 group-hover:opacity-0">
          {discipline.defaultInstructorTitle && (
            <CardDescription className="min-h-10 font-medium text-foreground">
              {discipline.defaultInstructorTitle}
            </CardDescription>
          )}
        </Stack>

        <div className="absolute inset-0 opacity-0 duration-200 group-hover:opacity-100">
          <Stack size="lg" direction="column" className="size-full">
            <ShowMore
              items={stats}
              limit={3}
              renderItem={stat => <Badge variant="outline">{stat.label}</Badge>}
              size="xs"
              showMoreType="text"
              className="mt-auto flex-wrap"
            />
          </Stack>
        </div>
      </div>
    </Card>
  )
}

export function DisciplineCardSkeleton() {
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
