"use client"

import { useReducedMotion } from "@mantine/hooks"
import { ClockIcon, UserRoundPlusIcon } from "lucide-react"
import { LayoutGroup } from "motion/react"
import dynamic from "next/dynamic"
import { Button } from "~/components/common/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "~/components/common/drawer"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/common/tabs"
import type { PromoterChangeContext } from "~/components/web/lineage/promoter-change-modal"
import { cx } from "~/lib/utils"
import type { ClaimViewerState } from "~/server/web/claims/resolve-viewer-claim-state"
import type { LineageNodeProfile, LineageTreeMemberRow } from "~/server/web/lineage/payloads"
import { DrawerIdentityHeader } from "./drawer-header"
import type { LineageProfileDrawerProps, LineageProfileDrawerTab } from "./drawer-types"
import { InfoTab } from "./info-tab"
import { deriveDrawerProfileView, useDesktopProfilePanel } from "./use-drawer-profile"

export type { LineageProfileDrawerTab } from "./drawer-types"

// Lazy boundaries: the non-default tab panels only fetch their JS when the user opens
// that tab (Base UI Tabs unmounts inactive panels). Header + Info tab stay eager — they
// paint the instant the drawer opens.
const drawerTabLoading = () => <Note className="text-sm text-muted-foreground">Loading…</Note>
const LineageTab = dynamic(() => import("./lineage-tab").then(m => m.LineageTab), {
  loading: drawerTabLoading,
})
const LineageRankHistoryTab = dynamic(
  () =>
    import("~/components/web/lineage/lineage-rank-history-tab").then(m => m.LineageRankHistoryTab),
  { loading: drawerTabLoading },
)

/**
 * Bottom-sheet (mobile) / side-panel (desktop ≥768px) Drawer for lineage profiles.
 *
 * Thin orchestrator (the colocated folder module's public barrel): it composes the
 * extracted parts — `drawer-header`, `info-tab`, the lazy `lineage-tab` /
 * `rank-history` panels — and owns no presentation itself. The three tabs are the
 * drawer's full surface; the rich profile experience lives on the profile page.
 *
 * @see docs/runbooks/component-launch-sweep-recipe.md (the recipe this folder exemplifies)
 */
export function LineageProfileDrawer({
  open,
  onOpenChange,
  profile,
  promoterChangeContext,
  isClaimable,
  isTreeClaimable,
  viewerClaimState,
  treeSlug,
  nodeId,
  isAdmin,
  activeTab,
  onTabChange,
  contentClassName,
  students,
  onSelectStudent,
  disciplineId,
  studentsCarouselVariant,
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
        containerClassName="md:pt-6! md:[@media(min-height:1000px)]:pt-6!"
        className={cx(
          contentClassName,
          "md:ml-auto md:mr-0 md:grid-rows-[auto_minmax(0,1fr)_auto] md:max-h-[calc(100dvh-3rem)] md:h-[calc(100dvh-3rem)] md:max-w-xl md:p-0",
        )}
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
            isClaimable={isClaimable}
            isTreeClaimable={isTreeClaimable}
            viewerClaimState={viewerClaimState}
            treeSlug={treeSlug}
            nodeId={nodeId}
            isAdmin={isAdmin}
            activeTab={activeTab}
            onTabChange={onTabChange}
            students={students}
            onSelectStudent={onSelectStudent}
            disciplineId={disciplineId}
            studentsCarouselVariant={studentsCarouselVariant}
          />
        )}
      </DrawerContent>
    </Drawer>
  )
}

function DrawerBody({
  profile,
  promoterChangeContext,
  isClaimable,
  isTreeClaimable,
  viewerClaimState,
  treeSlug,
  nodeId,
  isAdmin,
  activeTab,
  onTabChange,
  students,
  onSelectStudent,
  disciplineId,
  studentsCarouselVariant,
}: {
  profile: LineageNodeProfile
  promoterChangeContext: PromoterChangeContext | null
  isClaimable?: boolean
  isTreeClaimable?: boolean
  viewerClaimState?: ClaimViewerState
  treeSlug?: string
  nodeId?: string | null
  isAdmin?: boolean
  activeTab?: LineageProfileDrawerTab
  onTabChange?: (tab: LineageProfileDrawerTab) => void
  students?: LineageTreeMemberRow[]
  onSelectStudent?: (memberId: string) => void
  disciplineId?: string | null
  studentsCarouselVariant?: "v1" | "v2"
}) {
  const reduceMotion = useReducedMotion() ?? false
  const view = deriveDrawerProfileView(profile)
  const { currentRank, currentAward, discipline, latestMembership, instructorRelationship } = view
  const claimState = effectiveClaimState(viewerClaimState, profile)
  // "View full profile" deep-link target — only for a PUBLIC directory slug (a
  // MEMBERS_ONLY/HIDDEN page 404s a guest via the directory route's visibility gate).
  const directoryProfile = profile.passport?.directoryProfile
  const profileSlug =
    directoryProfile?.visibility === "PUBLIC" ? (directoryProfile.slug ?? null) : null
  // Shared-element morph target key (SESSION_0496, Epic A0.5): pairs the identity-header
  // avatar with the V2 student-card avatar that opened this profile
  // (`students-carousel-v2.tsx` uses the same `student-avatar-<nodeId>` id). V2-only and
  // reduced-motion-off — null renders the header avatar exactly as before.
  const morphLayoutId =
    studentsCarouselVariant === "v2" && !reduceMotion ? `student-avatar-${profile.id}` : null

  return (
    <LayoutGroup>
      <DrawerIdentityHeader
        view={view}
        isClaimable={isClaimable}
        claimState={claimState}
        promoterChangeContext={promoterChangeContext}
        isAdmin={isAdmin}
        treeSlug={treeSlug}
        nodeId={nodeId}
        morphLayoutId={morphLayoutId}
      />

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
            students={students}
            onSelectStudent={onSelectStudent}
            disciplineId={disciplineId}
            studentsCarouselVariant={studentsCarouselVariant}
          />
        </TabsContent>

        <TabsContent value="lineage" className="flex-1 overflow-y-auto p-6 mt-0">
          <LineageTab relationships={profile.relationshipsTo} />
        </TabsContent>

        <TabsContent value="rank-history" className="flex-1 overflow-y-auto p-6 mt-0">
          <LineageRankHistoryTab profile={profile} />
        </TabsContent>
      </Tabs>

      <DrawerFooter
        profileSlug={profileSlug}
        claimState={claimState}
        isClaimable={isClaimable}
        isTreeClaimable={isTreeClaimable}
        treeSlug={treeSlug}
        nodeId={nodeId}
      />
    </LayoutGroup>
  )
}

/**
 * The viewer's effective claim state for the CTA. Prefers the threaded resolver
 * value (the shared SoT). Falls back — for callers that don't thread it yet (editor /
 * board / galaxy) — to a coarse claimed/unclaimed read off the attached account, which
 * still suppresses the ghost Claim button on an already-claimed node. The mine/pending
 * refinement only exists on the threaded (public-tree) path, which has the viewer.
 */
function effectiveClaimState(
  viewerClaimState: ClaimViewerState | undefined,
  profile: LineageNodeProfile,
): ClaimViewerState {
  if (viewerClaimState) {
    return viewerClaimState
  }
  return profile.passport?.user ? "CLAIMED_OTHER" : "UNCLAIMED"
}

/**
 * The claim CTA button — the 5-state machine (ADR 0036, SESSION_0440):
 *   - CLAIMED_MINE  → "This profile is yours →" (manage; no claim button)
 *   - PENDING_MINE  → "Claim pending review" (disabled/info)
 *   - UNCLAIMED     → "Claim this profile" → the account-optional /lineage/join funnel
 *                     (only when the tree + this member accept claims), NOT the
 *                     login-gated /claim form — a non-user should not hit a login wall
 *                     (SESSION_0386). Carries the node so the join form can preselect it.
 *   - CLAIMED_OTHER → nothing (normal claimed public profile)
 *
 * Returns the bare button (no container) — {@link DrawerFooter} owns the bordered
 * footer so the claim CTA and the "View full profile" link share ONE grid row.
 */
function ClaimCtaButton({
  state,
  isClaimable,
  isTreeClaimable,
  treeSlug,
  nodeId,
}: {
  state: ClaimViewerState
  isClaimable?: boolean
  isTreeClaimable?: boolean
  treeSlug?: string
  nodeId?: string | null
}) {
  if (state === "CLAIMED_MINE") {
    return (
      // SESSION_0522 step 5: `/me` is retired — route to the canonical authenticated member
      // workspace at `/app/profile`, where the owner edits their Passport.
      <Button
        variant="secondary"
        size="md"
        className="w-full"
        render={<Link href="/app/profile" />}
      >
        This profile is yours →
      </Button>
    )
  }

  if (state === "PENDING_MINE") {
    return (
      <Button variant="soft" size="md" className="w-full" prefix={<ClockIcon />} disabled>
        Claim pending review
      </Button>
    )
  }

  if (state === "UNCLAIMED" && isClaimable && isTreeClaimable && treeSlug) {
    return (
      <Button
        variant="primary"
        size="md"
        className="w-full"
        prefix={<UserRoundPlusIcon />}
        render={<Link href={`/lineage/join${nodeId ? `?node=${nodeId}` : ""}`} />}
      >
        Claim this profile
      </Button>
    )
  }

  return null
}

/**
 * Bottom-pinned footer (the content grid's 3rd `auto` row): a "View full profile"
 * link to the directory page — where the ancestry timeline + the rich profile live;
 * the drawer is only a preview (see the module doc) — plus the claim CTA, sharing ONE
 * bordered container so the 3-row grid layout holds. The profile link shows only for a
 * PUBLIC directory slug: the directory route `notFound()`s a MEMBERS_ONLY/HIDDEN page
 * for a guest (`buildDirectoryProfileWhere`), so gating on PUBLIC never dead-links.
 * Renders nothing when neither action applies (SESSION_0497 — the drawer previously had
 * no path at all to the full profile page).
 */
function DrawerFooter({
  profileSlug,
  claimState,
  isClaimable,
  isTreeClaimable,
  treeSlug,
  nodeId,
}: {
  profileSlug: string | null
  claimState: ClaimViewerState
  isClaimable?: boolean
  isTreeClaimable?: boolean
  treeSlug?: string
  nodeId?: string | null
}) {
  const hasClaim =
    claimState === "CLAIMED_MINE" ||
    claimState === "PENDING_MINE" ||
    (claimState === "UNCLAIMED" && !!isClaimable && !!isTreeClaimable && !!treeSlug)

  if (!profileSlug && !hasClaim) {
    return null
  }

  return (
    <div className="border-t p-4 flex flex-col gap-2">
      {profileSlug ? (
        // `ghost` (not `secondary`) so a claim/manage CTA below stays the solid action —
        // two equal-weight buttons read as co-primary (Desi P1). Copy = "View profile"
        // for parity with every other person surface (m-card / directory / view-A menu).
        <Button
          variant="ghost"
          size="md"
          className="w-full"
          render={<Link href={`/directory/${profileSlug}`} />}
        >
          View profile →
        </Button>
      ) : null}
      {hasClaim ? (
        <ClaimCtaButton
          state={claimState}
          isClaimable={isClaimable}
          isTreeClaimable={isTreeClaimable}
          treeSlug={treeSlug}
          nodeId={nodeId}
        />
      ) : null}
    </div>
  )
}
