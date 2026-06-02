"use client"

import {
  CheckIcon,
  EllipsisVerticalIcon,
  LockKeyholeIcon,
  PencilIcon,
  ShieldCheckIcon,
  ShieldOffIcon,
  TriangleAlertIcon,
  UserRoundCogIcon,
  UserRoundPlusIcon,
} from "lucide-react"
import { type CSSProperties, useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/common/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { H6 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Separator } from "~/components/common/separator"
import { Stack } from "~/components/common/stack"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/common/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/common/tooltip"
import { LineageRankHistoryTab } from "~/components/web/lineage/lineage-rank-history-tab"
import {
  type PromoterChangeContext,
  PromoterChangeModal,
} from "~/components/web/lineage/promoter-change-modal"
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

type SelectedRankAward = {
  id: string
  awardedAt: Date | null
  rank: {
    id: string
    name: string
    shortName: string | null
    colorHex: string | null
    sortOrder?: number | null
    rankSystem?: {
      id: string
      name: string
      discipline?: { id: string; name: string; slug: string; code: string | null } | null
      ranks?: { id: string; sortOrder: number }[] | null
    } | null
  } | null
} | null

export type LineageProfileDrawerTab = "info" | "lineage" | "rank-history"

type LineageProfileDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: LineageNodeProfile | null
  promoterChangeContext?: PromoterChangeContext | null
  selectedRankAward?: SelectedRankAward
  isClaimable?: boolean
  isTreeClaimable?: boolean
  treeSlug?: string
  treeId?: string
  nodeId?: string | null
  isAdmin?: boolean
  /**
   * Controlled active drawer tab. The on-card / on-row `LineageMemberActionsMenu`
   * "Change promoter..." action (Phase 3c) opens the drawer on the "rank-history"
   * tab — promotion history + the promoter editor entry — while "View profile"
   * opens "info". Board-owned so there is no mount-timing race (SESSION_0333).
   */
  activeTab?: LineageProfileDrawerTab
  onTabChange?: (tab: LineageProfileDrawerTab) => void
}

function useDesktopProfilePanel() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return

    const media = window.matchMedia("(min-width: 768px)")
    const update = () => setIsDesktop(media.matches)

    update()
    media.addEventListener("change", update)

    return () => media.removeEventListener("change", update)
  }, [])

  return isDesktop
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
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(d)
}

function rankProgressPercent(
  rank:
    | {
        id: string
        sortOrder?: number | null
        rankSystem?: { ranks?: { id: string; sortOrder: number }[] | null } | null
      }
    | null
    | undefined,
): number {
  if (!rank) return 0

  const ranks = [...(rank.rankSystem?.ranks ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)
  if (ranks.length > 0) {
    const index = ranks.findIndex(item => item.id === rank.id)
    if (index >= 0) return Math.round(((index + 1) / ranks.length) * 100)
  }

  if (typeof rank.sortOrder === "number") {
    return Math.max(12, Math.min(100, Math.round(rank.sortOrder * 10)))
  }

  return 0
}

function VerificationBadge({ profile }: { profile: LineageNodeProfile }) {
  if (profile.verificationStatus === "DISPUTED") {
    return (
      <Badge variant="danger" size="sm" prefix={<TriangleAlertIcon />}>
        Disputed
      </Badge>
    )
  }
  if (profile.verificationStatus === "VERIFIED" || profile.isVerified) {
    return (
      <Badge variant="success" size="sm" prefix={<CheckIcon />}>
        Verified
      </Badge>
    )
  }
  return (
    <Badge variant="outline" size="sm" prefix={<ShieldOffIcon />}>
      Unverified
    </Badge>
  )
}

export function LineageProfileDrawer({
  open,
  onOpenChange,
  profile,
  promoterChangeContext,
  selectedRankAward,
  isClaimable,
  isTreeClaimable,
  treeSlug,
  nodeId,
  isAdmin,
  activeTab,
  onTabChange,
}: LineageProfileDrawerProps) {
  const isDesktopPanel = useDesktopProfilePanel()

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      modal={!isDesktopPanel}
      disablePointerDismissal={isDesktopPanel}
    >
      <DrawerContent
        showOverlay={!isDesktopPanel}
        className="md:ml-auto md:mr-0 md:grid-rows-[auto_minmax(0,1fr)_auto] md:max-h-[calc(100dvh-3rem)] md:h-[calc(100dvh-3rem)] md:max-w-xl md:p-0"
      >
        {!profile ? (
          <Stack direction="column" size="md" className="p-6">
            <DrawerHeader>
              <DrawerTitle>Profile unavailable</DrawerTitle>
              <DrawerDescription>This lineage profile could not be loaded.</DrawerDescription>
            </DrawerHeader>
          </Stack>
        ) : (
          <DrawerBody
            profile={profile}
            promoterChangeContext={promoterChangeContext ?? null}
            selectedRankAward={selectedRankAward ?? null}
            isClaimable={isClaimable}
            isTreeClaimable={isTreeClaimable}
            treeSlug={treeSlug}
            nodeId={nodeId}
            isAdmin={isAdmin}
            activeTab={activeTab}
            onTabChange={onTabChange}
          />
        )}
      </DrawerContent>
    </Drawer>
  )
}

function DrawerBody({
  profile,
  promoterChangeContext,
  selectedRankAward,
  isClaimable,
  isTreeClaimable,
  treeSlug,
  nodeId,
  isAdmin,
  activeTab,
  onTabChange,
}: {
  profile: LineageNodeProfile
  promoterChangeContext: PromoterChangeContext | null
  selectedRankAward: SelectedRankAward
  isClaimable?: boolean
  isTreeClaimable?: boolean
  treeSlug?: string
  nodeId?: string | null
  isAdmin?: boolean
  activeTab?: LineageProfileDrawerTab
  onTabChange?: (tab: LineageProfileDrawerTab) => void
}) {
  const displayName = profile.user.passport?.displayName ?? profile.user.name ?? "Unnamed"
  const avatarSrc = profile.user.passport?.avatarUrl ?? profile.user.image
  const currentAward = profile.user.rankAwards[0] ?? null
  const currentRank = currentAward?.rank ?? null
  const discipline = currentRank?.rankSystem?.discipline ?? null
  const latestMembership = profile.user.memberships[0] ?? null
  const instructorRelationship = profile.relationshipsTo[0] ?? null
  const [promoterModalOpen, setPromoterModalOpen] = useState(false)
  const selectedProfileAward = selectedRankAward?.id
    ? (profile.user.rankAwards.find(award => award.id === selectedRankAward.id) ?? null)
    : null
  const panelAward = selectedProfileAward ?? currentAward
  const panelRank = panelAward?.rank ?? selectedRankAward?.rank ?? currentRank
  const panelRankColor = panelRank?.colorHex ?? null
  const panelRankProgress = rankProgressPercent(panelRank)
  const panelHeaderStyle = panelRankColor
    ? ({
        "--rank-color": panelRankColor,
        "--rank-progress": `${panelRankProgress}%`,
      } as CSSProperties)
    : undefined

  // For the header subtitle, prefer selected rank name if set
  const headerRankName = panelRank?.name ?? null
  const headerDisciplineName = panelRank?.rankSystem?.discipline?.name ?? discipline?.name ?? null

  return (
    <>
      {/* Identity */}
      <DrawerHeader
        className="relative min-w-0 overflow-hidden border-b p-6 pt-7"
        style={panelHeaderStyle}
      >
        {panelRankColor && (
          <div className="absolute inset-x-0 top-0 h-1 bg-muted">
            <span
              aria-hidden
              className="block h-full rounded-r-full bg-(--rank-color)"
              style={{ width: "var(--rank-progress)" }}
            />
          </div>
        )}

        <Stack size="md" className="items-start justify-between min-w-0">
          <Stack size="md" className="min-w-0">
            <div className="relative shrink-0">
              {panelRankColor && (
                <span
                  aria-hidden
                  className="absolute -inset-1 rounded-xl opacity-20"
                  style={{ backgroundColor: panelRankColor }}
                />
              )}
              <Avatar className="relative size-16">
                {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
                <AvatarFallback>{initials(displayName)}</AvatarFallback>
              </Avatar>
            </div>
            <Stack size="xs" direction="column" className="min-w-0 flex-1">
              <DrawerTitle>{displayName}</DrawerTitle>
              {headerRankName && (
                <Note className="truncate">
                  {headerRankName}
                  {headerDisciplineName && <> · {headerDisciplineName}</>}
                </Note>
              )}
              <Stack size="xs" wrap>
                <VerificationBadge profile={profile} />
                {panelAward?.organization?.name && (
                  <Badge variant="outline" size="sm">
                    {panelAward.organization.name}
                  </Badge>
                )}
              </Stack>
            </Stack>
          </Stack>

          {(promoterChangeContext || isAdmin) && (
            <>
              <LineageDrawerActions
                onChangePromoter={
                  promoterChangeContext ? () => setPromoterModalOpen(true) : undefined
                }
                editHref={treeSlug && nodeId ? `/lineage/${treeSlug}/edit/${nodeId}` : undefined}
                isAdmin={isAdmin}
              />
              {promoterChangeContext && (
                <PromoterChangeModal
                  context={promoterChangeContext}
                  memberName={displayName}
                  open={promoterModalOpen}
                  onOpenChange={setPromoterModalOpen}
                  trigger={null}
                />
              )}
            </>
          )}
        </Stack>
      </DrawerHeader>

      {/* Tabs */}
      <Tabs
        value={activeTab ?? "info"}
        onValueChange={value => onTabChange?.(value as LineageProfileDrawerTab)}
        className="flex-1 flex flex-col overflow-hidden min-w-0"
      >
        <TabsList className="border-b px-6 py-3 rounded-none bg-transparent">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="lineage">Lineage</TabsTrigger>
          <TabsTrigger value="rank-history">Rank History</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="flex-1 overflow-y-auto overflow-x-hidden p-6 mt-0">
          <InfoTab
            profile={profile}
            currentRank={currentRank}
            currentAward={currentAward}
            discipline={discipline}
            latestMembership={latestMembership}
            instructorRelationship={instructorRelationship}
          />
        </TabsContent>

        <TabsContent value="lineage" className="flex-1 overflow-y-auto p-6 mt-0">
          <LineageTab instructorRelationship={instructorRelationship} />
        </TabsContent>

        <TabsContent value="rank-history" className="flex-1 overflow-y-auto p-6 mt-0">
          <LineageRankHistoryTab
            profile={profile}
            selectedRankAwardId={selectedRankAward?.id ?? null}
          />
        </TabsContent>
      </Tabs>

      {/* Claim CTA — shown when node is claimable and tree accepts claims */}
      {isClaimable && isTreeClaimable && treeSlug && (
        <div className="border-t p-4">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            prefix={<UserRoundPlusIcon />}
            render={<Link href={`/lineage/${treeSlug}/claim`} />}
          >
            Claim this profile
          </Button>
        </div>
      )}
    </>
  )
}

function LineageDrawerActions({
  onChangePromoter,
  editHref,
  isAdmin,
}: {
  onChangePromoter?: () => void
  editHref?: string
  isAdmin?: boolean
}) {
  function openPromoterModal() {
    if (onChangePromoter) window.setTimeout(onChangePromoter, 0)
  }

  return (
    <DropdownMenu modal={false}>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  aria-label="Open lineage profile actions"
                  prefix={<EllipsisVerticalIcon />}
                />
              }
            />
          }
        />
        <TooltipContent>Lineage profile actions</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Admin</DropdownMenuLabel>
          {onChangePromoter && (
            <DropdownMenuItem onClick={openPromoterModal} onSelect={openPromoterModal}>
              <UserRoundCogIcon />
              Change promoter...
            </DropdownMenuItem>
          )}
          {editHref && isAdmin ? (
            <DropdownMenuItem render={<Link href={editHref} />}>
              <PencilIcon />
              Edit profile
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled>
              <LockKeyholeIcon />
              Edit profile
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <ShieldCheckIcon />
            Manage verification (coming soon)
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
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
        <H6 className="mb-1 text-muted-foreground uppercase tracking-wide">Current Rank</H6>
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

      {/* School */}
      <section aria-label="School">
        <H6 className="mb-1 text-muted-foreground uppercase tracking-wide">School</H6>
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

function LineageTab({
  instructorRelationship,
}: {
  instructorRelationship: LineageNodeProfile["relationshipsTo"][number] | null
}) {
  const instructorName =
    instructorRelationship?.fromNode.user.passport?.displayName ??
    instructorRelationship?.fromNode.user.name ??
    null

  return (
    <Stack direction="column" size="md" className="w-full">
      <section aria-label="Promotion lineage">
        <H6 className="mb-1 text-muted-foreground uppercase tracking-wide">Promotion Lineage</H6>
        {instructorName ? (
          <Stack direction="column" size="xs">
            <span className="text-sm font-medium">{instructorName}</span>
            <Stack size="xs" wrap>
              {instructorRelationship?.isVerified ? (
                <Badge variant="success" size="sm" prefix={<CheckIcon />}>
                  Verified relationship
                </Badge>
              ) : (
                <Badge variant="outline" size="sm" prefix={<ShieldOffIcon />}>
                  Unverified relationship
                </Badge>
              )}
            </Stack>
            {instructorRelationship?.description && (
              <Note className="text-xs">{instructorRelationship.description}</Note>
            )}
          </Stack>
        ) : (
          <Note>No instructor relationship on record.</Note>
        )}
      </section>

      <Separator />

      <section aria-label="Students">
        <H6 className="mb-1 text-muted-foreground uppercase tracking-wide">Students</H6>
        <Note>Student relationships are not loaded in this drawer yet.</Note>
      </section>
    </Stack>
  )
}
