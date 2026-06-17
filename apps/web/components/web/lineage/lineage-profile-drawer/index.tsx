"use client"

import { UserRoundPlusIcon } from "lucide-react"
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
import type { LineageNodeProfile, LineageTreeMemberRow } from "~/server/web/lineage/payloads"
import { DrawerIdentityHeader } from "./drawer-header"
import type {
  LineageProfileDrawerProps,
  LineageProfileDrawerTab,
  SelectedRankAward,
} from "./drawer-types"
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
  selectedRankAward,
  isClaimable,
  isTreeClaimable,
  treeSlug,
  nodeId,
  isAdmin,
  activeTab,
  onTabChange,
  students,
  onSelectStudent,
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
            students={students}
            onSelectStudent={onSelectStudent}
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
  students,
  onSelectStudent,
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
  students?: LineageTreeMemberRow[]
  onSelectStudent?: (memberId: string) => void
}) {
  const view = deriveDrawerProfileView(profile, selectedRankAward)
  const { currentRank, currentAward, discipline, latestMembership, instructorRelationship } = view

  return (
    <>
      <DrawerIdentityHeader
        view={view}
        isClaimable={isClaimable}
        promoterChangeContext={promoterChangeContext}
        isAdmin={isAdmin}
        treeSlug={treeSlug}
        nodeId={nodeId}
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
          />
        </TabsContent>

        <TabsContent value="lineage" className="flex-1 overflow-y-auto p-6 mt-0">
          <LineageTab relationships={profile.relationshipsTo} />
        </TabsContent>

        <TabsContent value="rank-history" className="flex-1 overflow-y-auto p-6 mt-0">
          <LineageRankHistoryTab
            profile={profile}
            selectedRankAwardId={selectedRankAward?.id ?? null}
          />
        </TabsContent>
      </Tabs>

      {/* Claim CTA — shown when node is claimable and tree accepts claims. Routes to
          the public "Join the Legacy" funnel (account-optional) rather than the
          login-gated /claim form — a non-user should not hit a login wall
          (SESSION_0386). Carries the node so the join form can preselect it. */}
      {isClaimable && isTreeClaimable && treeSlug && (
        <div className="border-t p-4">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            prefix={<UserRoundPlusIcon />}
            render={<Link href={`/lineage/join${nodeId ? `?node=${nodeId}` : ""}`} />}
          >
            Claim this profile
          </Button>
        </div>
      )}
    </>
  )
}
