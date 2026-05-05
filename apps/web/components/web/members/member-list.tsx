"use client"

import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import { EmptyList } from "~/components/web/empty-list"
import { MemberCard, MemberCardSkeleton } from "~/components/web/members/member-card"
import { Grid } from "~/components/web/ui/grid"

type MemberCardData = {
  slug: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  locationCity: string | null
  locationRegion: string | null
  disciplines?: { name: string }[]
}

type MemberListProps = ComponentProps<typeof Grid> & {
  members: MemberCardData[]
}

const MemberList = ({ children, members, ...props }: MemberListProps) => {
  return (
    <Grid {...props}>
      {members.map((member, order) => (
        <MemberCard key={member.slug} member={member} style={{ order }} />
      ))}

      {members.length ? children : <EmptyList>No members found</EmptyList>}
    </Grid>
  )
}

const MemberListSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <Grid>
      {[...Array(count)].map((_, index) => (
        <MemberCardSkeleton key={index} />
      ))}
    </Grid>
  )
}

export { MemberList, MemberListSkeleton, type MemberListProps }
