"use client"

import { ShieldOffIcon } from "lucide-react"
import type { CSSProperties } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { H6 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Separator } from "~/components/common/separator"
import { Stack } from "~/components/common/stack"
import { StudentsCarousel } from "~/components/web/lineage/students-carousel"
import type { LineageNodeProfile, LineageTreeMemberRow } from "~/server/web/lineage/payloads"
import type { DrawerAccount, DrawerRankAward } from "./drawer-types"
import { formatDate, initials } from "./use-drawer-profile"

export function InfoTab({
  profile,
  currentRank,
  currentAward,
  discipline,
  latestMembership,
  instructorRelationship,
  students,
  onSelectStudent,
  disciplineId,
}: {
  profile: LineageNodeProfile
  currentRank: NonNullable<DrawerRankAward>["rank"] | null
  currentAward: DrawerRankAward | null
  discipline: NonNullable<DrawerRankAward["rank"]>["rankSystem"]["discipline"] | null
  latestMembership: NonNullable<DrawerAccount>["memberships"][number] | null
  instructorRelationship: LineageNodeProfile["relationshipsTo"][number] | null
  students?: LineageTreeMemberRow[]
  onSelectStudent?: (memberId: string) => void
  disciplineId?: string | null
}) {
  // Promoter identity prefers the historical Passport promoter (SESSION_0391),
  // falling back to the real-account actor that performed the award.
  const awardedBy = currentAward?.awardedByPassport
    ? {
        name: currentAward.awardedByPassport.displayName,
        image: currentAward.awardedByPassport.avatarUrl,
      }
    : (currentAward?.awardedBy ?? null)
  const promotedOn = formatDate(currentAward?.awardedAt ?? null)
  const instructorName =
    instructorRelationship?.fromNode.passport?.displayName ??
    instructorRelationship?.fromNode.passport?.user?.name ??
    null
  const school = latestMembership?.organization ?? null

  return (
    <Stack direction="column" size="md" className="w-full">
      {/* Bio */}
      {profile.bio && (
        <section aria-label="Bio">
          <Note className="text-sm">{profile.bio}</Note>
        </section>
      )}

      {/* Current Rank */}
      <section aria-label="Current rank">
        <H6 className="mb-1 text-muted-foreground uppercase tracking-wide">Current Rank</H6>
        {currentRank ? (
          <Stack size="sm" wrap>
            {currentRank.colorHex && (
              <span
                aria-hidden
                className="inline-block h-3 w-6 rounded-sm border bg-(--rank-color)"
                style={{ "--rank-color": currentRank.colorHex } as CSSProperties}
              />
            )}
            <span className="font-medium text-sm">{currentRank.name}</span>
            {discipline?.name && (
              <Badge variant="outline" size="sm">
                {discipline.name}
              </Badge>
            )}
          </Stack>
        ) : (
          <Note>No rank on record.</Note>
        )}
      </section>

      <Separator />

      {/* Awarded By — REQUIRED row per SESSION Open decisions 2026-05-16 */}
      <section aria-label="Awarded by">
        <H6 className="mb-1 text-muted-foreground uppercase tracking-wide">Awarded By</H6>
        {awardedBy ? (
          <Stack size="sm">
            <Avatar className="size-8">
              {awardedBy.image && (
                <AvatarImage src={awardedBy.image} alt={awardedBy.name ?? "Awarder"} />
              )}
              <AvatarFallback>{initials(awardedBy.name)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{awardedBy.name ?? "Unnamed"}</span>
          </Stack>
        ) : (
          <Stack direction="column" size="xs">
            <Badge variant="warning" size="sm" prefix={<ShieldOffIcon />}>
              Awarded by: lineage-unverified
            </Badge>
          </Stack>
        )}
      </section>

      {/* Promoted On */}
      <section aria-label="Promoted on">
        <H6 className="mb-1 text-muted-foreground uppercase tracking-wide">Promoted On</H6>
        <span className="text-sm">{promotedOn ?? "Unknown date"}</span>
      </section>

      <Separator />

      {/* Instructor */}
      <section aria-label="Instructor">
        <H6 className="mb-1 text-muted-foreground uppercase tracking-wide">Instructor</H6>
        {instructorName ? (
          <Stack size="sm" wrap>
            <span className="text-sm font-medium">{instructorName}</span>
            {!instructorRelationship?.isVerified && (
              <Badge variant="outline" size="sm" prefix={<ShieldOffIcon />}>
                Unverified
              </Badge>
            )}
          </Stack>
        ) : (
          <Note>No instructor on record.</Note>
        )}
      </section>

      {/* School — null-safe logo (Organization.logoUrl, backfilled in the supervised lane) → name. */}
      <section aria-label="School">
        <H6 className="mb-1 text-muted-foreground uppercase tracking-wide">School</H6>
        {school ? (
          <Stack size="sm" className="items-center">
            {school.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- public media URL (R2/S3), no Next loader
              <img
                src={school.logoUrl}
                alt=""
                className="size-9 shrink-0 rounded border bg-card object-contain"
                loading="lazy"
              />
            )}
            <Stack direction="column" size="xs" className="min-w-0">
              <span className="text-sm font-medium">{school.name}</span>
              {(school.city || school.state) && (
                <Note className="text-xs">
                  {[school.city, school.state].filter(Boolean).join(", ")}
                </Note>
              )}
            </Stack>
          </Stack>
        ) : (
          <Note>No active membership.</Note>
        )}
      </section>

      {students && students.length > 0 && onSelectStudent && (
        <>
          <Separator />
          <StudentsCarousel
            students={students}
            onSelectStudent={onSelectStudent}
            disciplineId={disciplineId}
          />
        </>
      )}
    </Stack>
  )
}
