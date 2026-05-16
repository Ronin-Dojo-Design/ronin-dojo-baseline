"use client"

import { CheckIcon, ShieldOffIcon } from "lucide-react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/common/dialog"
import { H6 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Separator } from "~/components/common/separator"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"
import type { LineageNodeProfile } from "~/server/web/lineage/payloads"

/**
 * Side-anchored Dialog used as a Drawer fallback (Petey-resolved per
 * SESSION_0175 Open decisions — no Drawer/Sheet primitive in inventory).
 *
 * Tabs are a Stack of Button toggles (Tabs primitive also absent). Only the
 * Info tab is populated for MVP; Belt Story / Tournaments / Achievements
 * render empty-state copy (backend gaps P2/P3).
 *
 * Author: Cody / SESSION_0175 TASK_03.
 * Refs:
 *   - docs/knowledge/wiki/component-porting/specs/lineage-profile-drawer-port-spec.md
 */

type DrawerTab = "info" | "belt-story" | "tournaments" | "achievements"

const TABS: { id: DrawerTab; label: string }[] = [
  { id: "info", label: "Info" },
  { id: "belt-story", label: "Belt Story" },
  { id: "tournaments", label: "Tournaments" },
  { id: "achievements", label: "Achievements" },
]

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
  const [activeTab, setActiveTab] = useState<DrawerTab>("info")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/*
       * Side-anchored variant: override Dialog's default centered layout with
       * an `ml-auto` right-stack + full-height. Stays within the primitive —
       * no new component, no FS-0001 violation.
       */}
      <DialogContent
        className={cx(
          "max-w-[420px] ml-auto mr-0 mt-0 mb-0 max-h-screen min-h-screen w-full",
          "rounded-none sm:rounded-none sm:p-0 p-0",
          "flex flex-col gap-0 overflow-hidden",
        )}
      >
        {!profile ? (
          <Stack direction="column" size="md" className="p-6">
            <DialogHeader>
              <DialogTitle>Profile unavailable</DialogTitle>
              <DialogDescription>This lineage profile could not be loaded.</DialogDescription>
            </DialogHeader>
          </Stack>
        ) : (
          <DrawerBody profile={profile} activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function DrawerBody({
  profile,
  activeTab,
  setActiveTab,
}: {
  profile: LineageNodeProfile
  activeTab: DrawerTab
  setActiveTab: (tab: DrawerTab) => void
}) {
  const displayName = profile.user.passport?.displayName ?? profile.user.name ?? "Unnamed"
  const currentAward = profile.user.rankAwards[0] ?? null
  const currentRank = currentAward?.rank
  const discipline = currentRank?.rankSystem?.discipline ?? null
  const latestMembership = profile.user.memberships[0] ?? null
  const instructorRelationship = profile.relationshipsTo[0] ?? null

  return (
    <>
      {/* Identity */}
      <DialogHeader className="border-b p-6">
        <Stack size="md">
          <Avatar className="size-16">
            {profile.user.image && <AvatarImage src={profile.user.image} alt={displayName} />}
            <AvatarFallback>{initials(displayName)}</AvatarFallback>
          </Avatar>
          <Stack size="xs" direction="column" className="min-w-0 flex-1">
            <DialogTitle>{displayName}</DialogTitle>
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
      </DialogHeader>

      {/* Tab bar (Stack-of-Button workaround per Open decision). */}
      <Stack size="xs" wrap={false} className="border-b px-6 py-3 overflow-x-auto" role="tablist">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <Button
              key={tab.id}
              variant={isActive ? "primary" : "ghost"}
              size="sm"
              role="tab"
              aria-selected={isActive}
              aria-pressed={isActive}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          )
        })}
      </Stack>

      {/* Tab body */}
      <Stack direction="column" size="md" className="flex-1 overflow-y-auto p-6" role="tabpanel">
        {activeTab === "info" && (
          <InfoTab
            profile={profile}
            currentRank={currentRank}
            currentAward={currentAward}
            discipline={discipline}
            latestMembership={latestMembership}
            instructorRelationship={instructorRelationship}
          />
        )}
        {activeTab === "belt-story" && (
          <EmptyTabBody
            heading="Belt Story coming soon"
            body="Per-belt history and media require the BeltStory schema, scheduled for SESSION_0176."
          />
        )}
        {activeTab === "tournaments" && (
          <EmptyTabBody
            heading="No tournament records yet"
            body="Tournament results are not yet joined to lineage — scheduled for SESSION_0176."
          />
        )}
        {activeTab === "achievements" && (
          <EmptyTabBody
            heading="No achievements yet"
            body="The Achievement model is not in the schema yet — scheduled for SESSION_0176."
          />
        )}
      </Stack>
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
                className="inline-block h-3 w-6 rounded-sm border"
                style={{ backgroundColor: currentRank.colorHex }}
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
