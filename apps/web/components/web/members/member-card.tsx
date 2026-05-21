"use client"

import type { ComponentProps } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Skeleton } from "~/components/common/skeleton"
import { Stack } from "~/components/common/stack"

type MemberCardData = {
  slug: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  locationCity: string | null
  locationRegion: string | null
  disciplines?: { name: string }[]
}

type MemberCardProps = ComponentProps<typeof Card> & {
  member: MemberCardData
}

export const MemberCard = ({ member, ...props }: MemberCardProps) => {
  return (
    <Card isRevealed {...props}>
      <CardHeader wrap={false}>
        <Stack size="sm" direction="row" className="items-center">
          <Avatar className="size-10">
            {member.avatarUrl && (
              <AvatarImage src={member.avatarUrl} alt={member.displayName ?? "Member"} />
            )}
            <AvatarFallback>{(member.displayName ?? "?").charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <H4 render={props => <h3 {...props}>{props.children}</h3>} className="truncate">
            <Link href={`/members/${member.slug}`}>
              <span className="absolute inset-0 z-10" />
              {member.displayName ?? "Anonymous"}
            </Link>
          </H4>
        </Stack>
      </CardHeader>

      <div className="relative size-full flex flex-col">
        <Stack size="lg" direction="column" className="flex-1">
          {member.bio && (
            <CardDescription className="line-clamp-2 min-h-10">{member.bio}</CardDescription>
          )}

          {(member.locationCity || member.locationRegion) && (
            <CardDescription className="text-xs">
              {[member.locationCity, member.locationRegion].filter(Boolean).join(", ")}
            </CardDescription>
          )}

          {member.disciplines && member.disciplines.length > 0 && (
            <Stack size="sm" className="mt-auto flex-wrap">
              {member.disciplines.map(d => (
                <Badge key={d.name} variant="soft">
                  {d.name}
                </Badge>
              ))}
            </Stack>
          )}
        </Stack>
      </div>
    </Card>
  )
}

export const MemberCardSkeleton = () => {
  return (
    <Card hover={false} className="items-stretch select-none">
      <CardHeader>
        <Stack size="sm" direction="row" className="items-center">
          <Skeleton className="size-10 rounded-full">&nbsp;</Skeleton>
          <H4 className="w-2/3">
            <Skeleton>&nbsp;</Skeleton>
          </H4>
        </Stack>
      </CardHeader>
      <CardDescription className="flex flex-col gap-0.5">
        <Skeleton className="h-5 w-4/5">&nbsp;</Skeleton>
        <Skeleton className="h-5 w-1/2">&nbsp;</Skeleton>
      </CardDescription>
    </Card>
  )
}
