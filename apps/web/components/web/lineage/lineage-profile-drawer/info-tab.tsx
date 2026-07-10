"use client"

import { ShieldCheckIcon, ShieldOffIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import type { CSSProperties } from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { H6 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Separator } from "~/components/common/separator"
import { Stack } from "~/components/common/stack"
import { StudentsCarousel } from "~/components/web/lineage/students-carousel"
import { StudentsCarouselV2 } from "~/components/web/lineage/students-carousel-v2"
import { verifyRankEntry } from "~/server/belt/verify-rank-entry"
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
  studentsCarouselVariant,
  canVerifyRank,
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
  /** "v2" → the SESSION_0496 player-card rail; undefined/"v1" → the original carousel. */
  studentsCarouselVariant?: "v1" | "v2"
  /** Steward (belt.admin) viewer → shows the "Verify" affordance on an Unverified rank. */
  canVerifyRank?: boolean
}) {
  // The canonical member-facing rank status (IMPORTED awards derive to VERIFIED); the
  // "Unverified" badge + steward Verify affordance key off the RankEntry, not the award.
  const rankEntry = currentAward?.rankEntry ?? null
  const isRankUnverified = rankEntry?.status === "UNVERIFIED"
  const promotedOn = formatDate(currentAward?.awardedAt ?? null)
  const instructorName =
    instructorRelationship?.fromNode.passport?.displayName ??
    instructorRelationship?.fromNode.passport?.user?.name ??
    null
  // Awarded By = the promoter. Prefer an explicit historical promoter Passport (SESSION_0391,
  // set via "Change promoter"); otherwise the member's INSTRUCTOR is the awarder (operator
  // SESSION_0522: show the instructor, never the admin actor who keyed the record — that legacy
  // `currentAward.awardedBy` User fallback surfaced e.g. the admin instead of Tony). No promoter
  // and no instructor → the "lineage-unverified" note.
  const awardedBy = currentAward?.awardedByPassport
    ? {
        name: currentAward.awardedByPassport.displayName,
        image: currentAward.awardedByPassport.avatarUrl,
      }
    : instructorName
      ? { name: instructorName, image: null as string | null }
      : null
  const school = latestMembership?.organization ?? null

  return (
    <Stack direction="column" size="md" className="w-full">
      {/* Bio — Bio Slice A (SESSION_0510 TASK_04): Passport-rooted, read `passport.bio`. */}
      {profile.passport.bio && (
        <section aria-label="Bio">
          <Note className="text-sm">{profile.passport.bio}</Note>
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
            {isRankUnverified && (
              <>
                <Badge variant="warning" size="sm" prefix={<ShieldOffIcon />}>
                  Unverified
                </Badge>
                {canVerifyRank && rankEntry && <RankVerifyButton rankEntryId={rankEntry.id} />}
              </>
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
          {studentsCarouselVariant === "v2" ? (
            <StudentsCarouselV2
              students={students}
              onSelectStudent={onSelectStudent}
              disciplineId={disciplineId}
            />
          ) : (
            <StudentsCarousel
              students={students}
              onSelectStudent={onSelectStudent}
              disciplineId={disciplineId}
            />
          )}
        </>
      )}
    </Stack>
  )
}

/**
 * Steward "Verify" button beside an Unverified rank badge (SESSION_0522). Flips the
 * member's RankEntry UNVERIFIED → VERIFIED via `verifyRankEntry` (gated on `belt.admin`
 * server-side). Mirrors the `useAction` + `sonner` + `router.refresh()` idiom from
 * `lead-lineage-place.tsx`; only mounts for `belt.admin` viewers on an unverified rank.
 */
function RankVerifyButton({ rankEntryId }: { rankEntryId: string }) {
  const router = useRouter()
  const { execute, isPending } = useAction(verifyRankEntry, {
    onSuccess: () => {
      toast.success("Rank verified.")
      router.refresh()
    },
    onError: ({ error }) => toast.error(error.serverError ?? "Could not verify this rank."),
  })

  return (
    <Button
      size="xs"
      variant="primary"
      prefix={<ShieldCheckIcon className="size-3.5" />}
      isPending={isPending}
      onClick={() => execute({ rankEntryId })}
    >
      Verify
    </Button>
  )
}
