"use client"

import { CheckIcon, ShieldOffIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/common/drawer"
import { H6 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Separator } from "~/components/common/separator"
import { Stack } from "~/components/common/stack"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/common/tabs"
import type { LineageNodeProfile } from "~/server/web/lineage/payloads"

/**
 * Bottom-sheet Drawer for lineage profiles.
 *
 * Mobile: slides up from bottom (max 85vh).
 * Desktop: centered Dialog.
 *
 * Uses real Tabs primitive (SESSION_0176 TASK_02).
 * Only the Info tab is populated for MVP.
 *
 * Author: Cody / SESSION_0175 TASK_03, refactored SESSION_0176 TASK_01+02.
 * Refs:
 *   - docs/knowledge/wiki/component-porting/specs/lineage-profile-drawer-port-spec.md
 */

type LineageProfileDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: LineageNodeProfile | null
}

function initials(name: string | null | undefined): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
}

function formatDate(date: Date | string | null | undefined): string | null {
  if (!date) return null
  const d = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

export function LineageProfileDrawer({ open, onOpenChange, profile }: LineageProfileDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        {!profile ? (
          <Stack direction="column" size="md" className="p-6">
            <DrawerHeader>
              <DrawerTitle>Profile unavailable</DrawerTitle>
              <DrawerDescription>This lineage profile could not be loaded.</DrawerDescription>
            </DrawerHeader>
          </Stack>
        ) : (
          <DrawerBody profile={profile} />
        )}
      </DrawerContent>
    </Drawer>
  )
}

function DrawerBody({ profile }: { profile: LineageNodeProfile }) {
  const displayName = profile.user.passport?.displayName ?? profile.user.name ?? "Unnamed"
  const currentAward = profile.user.rankAwards[0] ?? null
  const currentRank = currentAward?.rank
  const discipline = currentRank?.rankSystem?.discipline ?? null
  const latestMembership = profile.user.memberships[0] ?? null
  const instructorRelationship = profile.relationshipsTo[0] ?? null

  return (
    <>
      {/* Identity */}
      <DrawerHeader className="border-b p-6">
        <Stack size="md">
          <Avatar className="size-16">
            {profile.user.image && <AvatarImage src={profile.user.image} alt={displayName} />}
            <AvatarFallback>{initials(displayName)}</AvatarFallback>
          </Avatar>
          <Stack size="xs" direction="column" className="min-w-0 flex-1">
            <DrawerTitle>{displayName}</DrawerTitle>
            {currentRank && (
              <Note className="truncate">
                {currentRank.name}
                {discipline?.name && <> · {discipline.name}</>}
              </Note>
            )}
            <Stack size="xs" wrap>
              {profile.isVerified ? (
                <Badge variant="success" size="sm" prefix={<CheckIcon />}>
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" size="sm" prefix={<ShieldOffIcon />}>
                  Unverified
                </Badge>
              )}
            </Stack>
          </Stack>
        </Stack>
      </DrawerHeader>

      {/* Tabs */}
      <Tabs defaultValue="info" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="border-b px-6 py-3 rounded-none bg-transparent">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="belt-story">Belt Story</TabsTrigger>
          <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="flex-1 overflow-y-auto p-6 mt-0">
          <InfoTab
            profile={profile}
            currentRank={currentRank}
            currentAward={currentAward}
            discipline={discipline}
            latestMembership={latestMembership}
            instructorRelationship={instructorRelationship}
          />
        </TabsContent>

        <TabsContent value="belt-story" className="flex-1 overflow-y-auto p-6 mt-0">
          <EmptyTabBody
            heading="Belt Story coming soon"
            body="Per-belt history and media require the BeltStory schema, scheduled for a future session."
          />
        </TabsContent>

        <TabsContent value="tournaments" className="flex-1 overflow-y-auto p-6 mt-0">
          <EmptyTabBody
            heading="No tournament records yet"
            body="Tournament results are not yet joined to lineage — scheduled for a future session."
          />
        </TabsContent>

        <TabsContent value="achievements" className="flex-1 overflow-y-auto p-6 mt-0">
          <EmptyTabBody
            heading="No achievements yet"
            body="The Achievement model is not in the schema yet — scheduled for a future session."
          />
        </TabsContent>
      </Tabs>
    </>
  )
}

function InfoTab({
  profile,
  currentRank,
  currentAward,
  discipline,
  latestMembership,
  instructorRelationship,
}: {
  profile: LineageNodeProfile
  currentRank: NonNullable<LineageNodeProfile["user"]["rankAwards"][number]>["rank"] | null
  currentAward: LineageNodeProfile["user"]["rankAwards"][number] | null
  discipline:
    | NonNullable<
        NonNullable<LineageNodeProfile["user"]["rankAwards"][number]>["rank"]
      >["rankSystem"]["discipline"]
    | null
  latestMembership: LineageNodeProfile["user"]["memberships"][number] | null
  instructorRelationship: LineageNodeProfile["relationshipsTo"][number] | null
}) {
  const awardedBy = currentAward?.awardedBy ?? null
  const promotedOn = formatDate(currentAward?.awardedAt ?? null)
  const instructorName =
    instructorRelationship?.fromNode.user.passport?.displayName ??
    instructorRelationship?.fromNode.user.name ??
    null

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
        <H6 as="h6" className="mb-1 text-muted-foreground uppercase tracking-wide">
          Current Rank
        </H6>
        {currentRank ? (
          <Stack size="sm" wrap>
            {currentRank.colorHex && (
              <span
                aria-hidden
                className="inline-block h-3 w-6 rounded-sm border bg-(--rank-color)"
                style={{ "--rank-color": currentRank.colorHex } as React.CSSProperties}
              />
            )}
            <span className="font-medium text-sm">{currentRank.name}</span>
            {currentRank.shortName && (
              <Badge variant="soft" size="sm">
                {currentRank.shortName}
              </Badge>
            )}
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
        <H6 as="h6" className="mb-1 text-muted-foreground uppercase tracking-wide">
          Awarded By
        </H6>
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
            {currentAward?.notes && <Note className="text-xs">{currentAward.notes}</Note>}
          </Stack>
        )}
      </section>

      {/* Promoted On */}
      <section aria-label="Promoted on">
        <H6 as="h6" className="mb-1 text-muted-foreground uppercase tracking-wide">
          Promoted On
        </H6>
        {promotedOn ? (
          <span className="text-sm">{promotedOn}</span>
        ) : (
          <Note>No promotion date on record.</Note>
        )}
      </section>

      <Separator />

      {/* Instructor */}
      <section aria-label="Instructor">
        <H6 as="h6" className="mb-1 text-muted-foreground uppercase tracking-wide">
          Instructor
        </H6>
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

      {/* School */}
      <section aria-label="School">
        <H6 as="h6" className="mb-1 text-muted-foreground uppercase tracking-wide">
          School
        </H6>
        {latestMembership?.organization ? (
          <Stack direction="column" size="xs">
            <span className="text-sm font-medium">{latestMembership.organization.name}</span>
            {(latestMembership.organization.city || latestMembership.organization.state) && (
              <Note className="text-xs">
                {[latestMembership.organization.city, latestMembership.organization.state]
                  .filter(Boolean)
                  .join(", ")}
              </Note>
            )}
          </Stack>
        ) : (
          <Note>No active membership.</Note>
        )}
      </section>
    </Stack>
  )
}

function EmptyTabBody({ heading, body }: { heading: string; body: string }) {
  return (
    <Stack direction="column" size="sm" className="w-full py-8 text-center">
      <H6 as="h6">{heading}</H6>
      <Note>{body}</Note>
    </Stack>
  )
}
