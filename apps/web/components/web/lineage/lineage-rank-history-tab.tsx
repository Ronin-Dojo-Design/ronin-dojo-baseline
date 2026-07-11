"use client"

import { CalendarDaysIcon, CheckIcon, ShieldOffIcon, TriangleAlertIcon } from "lucide-react"
import type { CSSProperties } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { H6 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Separator } from "~/components/common/separator"
import { Stack } from "~/components/common/stack"
import { LineageRankProgressionPanel } from "~/components/web/lineage/lineage-rank-progression-panel"
import { nameInitials } from "~/lib/identity/passport-display"
import { memberTrustStatus } from "~/lib/lineage/canvas-model"
import type { LineageNodeProfile } from "~/server/web/lineage/payloads"

type RankAward = NonNullable<LineageNodeProfile["passport"]>["rankAwardsEarned"][number]

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "Unknown date"
  const d = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return "Unknown date"
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(d)
}

function sourceBadge(profile: LineageNodeProfile) {
  // Trust from the member's rank (top non-PENDING RankEntry, LR 0008) — the SAME source every
  // other lineage surface reads, retiring the node-level `verificationStatus`/`isVerified` axis.
  const trustStatus = memberTrustStatus(profile)
  if (trustStatus === "DISPUTED") {
    return (
      <Badge variant="danger" size="sm" prefix={<TriangleAlertIcon />}>
        Disputed source
      </Badge>
    )
  }
  if (trustStatus === "VERIFIED") {
    return (
      <Badge variant="success" size="sm" prefix={<CheckIcon />}>
        Verified source
      </Badge>
    )
  }
  return (
    <Badge variant="outline" size="sm" prefix={<ShieldOffIcon />}>
      Unverified source
    </Badge>
  )
}

export function LineageRankHistoryTab({ profile }: { profile: LineageNodeProfile }) {
  const awards = profile.passport?.rankAwardsEarned ?? []

  if (awards.length === 0) {
    return (
      <Stack direction="column" size="sm" className="w-full py-8 text-center">
        <H6>No rank history yet</H6>
        <Note>Rank awards have not been added to this profile.</Note>
      </Stack>
    )
  }

  return (
    <Stack direction="column" size="md" className="w-full">
      <LineageRankProgressionPanel profile={profile} />

      <Separator />

      <Stack direction="column" size="xs">
        <H6 className="text-muted-foreground uppercase tracking-wide">Rank History</H6>
        <Stack size="xs" wrap>
          {sourceBadge(profile)}
          <Badge variant="soft" size="sm">
            {awards.length} award{awards.length === 1 ? "" : "s"}
          </Badge>
        </Stack>
        <Note className="text-xs">
          Verification reflects the member&apos;s current rank; instructor-relationship verification
          is shown on the Lineage tab.
        </Note>
      </Stack>

      <Separator />

      <Stack direction="column" size="sm">
        {awards.map(award => (
          <RankAwardRow key={award.id} award={award} />
        ))}
      </Stack>
    </Stack>
  )
}

function RankAwardRow({ award }: { award: RankAward }) {
  const rankStyle = award.rank.colorHex
    ? ({ "--rank-color": award.rank.colorHex } as CSSProperties)
    : undefined
  // Promoter identity prefers the historical Passport promoter (SESSION_0391),
  // falling back to the real-account actor.
  const awardedBy = award.awardedByPassport
    ? { name: award.awardedByPassport.displayName, image: award.awardedByPassport.avatarUrl }
    : award.awardedBy

  return (
    <article
      className="relative overflow-hidden rounded-md border bg-background p-3"
      style={rankStyle}
    >
      {award.rank.colorHex && (
        <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-(--rank-color)" />
      )}
      <Stack direction="column" size="sm">
        <Stack size="sm" wrap>
          {award.rank.colorHex && (
            <span
              aria-hidden
              className="inline-block h-3 w-6 rounded-sm border bg-(--rank-color)"
              style={{ "--rank-color": award.rank.colorHex } as React.CSSProperties}
            />
          )}
          <span className="font-medium text-sm">{award.rank.name}</span>
          {award.rank.rankSystem.discipline?.name && (
            <Badge variant="outline" size="sm">
              {award.rank.rankSystem.discipline.name}
            </Badge>
          )}
        </Stack>

        <Stack size="xs" wrap className="text-sm text-muted-foreground">
          <span>{formatDate(award.awardedAt)}</span>
          {award.organization?.name && (
            <>
              <span aria-hidden>&middot;</span>
              <span>{award.organization.name}</span>
            </>
          )}
          {award.location && (
            <>
              <span aria-hidden>&middot;</span>
              <span>{award.location}</span>
            </>
          )}
        </Stack>

        {awardedBy ? (
          <Stack size="sm">
            <Avatar className="size-7">
              {awardedBy.image && (
                <AvatarImage src={awardedBy.image} alt={awardedBy.name ?? "Awarder"} />
              )}
              <AvatarFallback>{nameInitials(awardedBy.name)}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{awardedBy.name ?? "Unnamed awarder"}</span>
          </Stack>
        ) : (
          <Note className="text-xs">Awarding instructor not resolved.</Note>
        )}

        {/* @added SESSION_0318 — read-only ceremony link when this award belongs to a PromotionEvent. */}
        {award.promotionEvent && (
          <Badge
            variant="soft"
            size="sm"
            prefix={<CalendarDaysIcon />}
            render={
              award.promotionEvent.slug ? (
                <Link href={`/events/${award.promotionEvent.slug}`} />
              ) : undefined
            }
          >
            {award.promotionEvent.title}
          </Badge>
        )}
      </Stack>
    </article>
  )
}
