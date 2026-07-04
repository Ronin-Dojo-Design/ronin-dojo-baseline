"use client"

import {
  EllipsisVerticalIcon,
  LockKeyholeIcon,
  PencilIcon,
  ShieldCheckIcon,
  UserRoundCogIcon,
} from "lucide-react"
import { motion } from "motion/react"
import { type CSSProperties, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { BeltSwatch } from "~/components/common/belt-swatch"
import { Button } from "~/components/common/button"
import { DrawerHeader, DrawerTitle } from "~/components/common/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/common/tooltip"
import { LineageClaimBadge, LineageTrustBadge } from "~/components/web/lineage/lineage-trust-badge"
import {
  type PromoterChangeContext,
  PromoterChangeModal,
} from "~/components/web/lineage/promoter-change-modal"
import type { ClaimViewerState } from "~/server/web/claims/resolve-viewer-claim-state"
import { resolveLineageClaimBadgeStatus } from "~/lib/lineage/trust-status"
import { initials, type DrawerProfileView } from "./use-drawer-profile"

/** Belt-color progress bar pinned to the top edge of the header (width = rank progress). */
function DrawerHeaderRankBar({ panelRankColor }: { panelRankColor: string | null }) {
  if (!panelRankColor) {
    return null
  }
  return (
    <div className="absolute inset-x-0 top-0 h-1 bg-muted">
      <span
        aria-hidden
        className="block h-full rounded-r-full bg-(--rank-color)"
        style={{ width: "var(--rank-progress)" }}
      />
    </div>
  )
}

/**
 * Avatar with an ambient belt-color glow (the glow self-disables when colorless).
 *
 * `morphLayoutId` (SESSION_0496, Epic A0.5) is the additive shared-element hook: when
 * set (V2 students rail + motion allowed), the avatar is wrapped in a `motion.span`
 * keyed by the id so a profile swap remounts it and Motion morphs it from the V2
 * student card carrying the same `layoutId`. Null → the exact pre-0496 markup.
 */
function DrawerHeaderAvatar({
  avatarSrc,
  displayName,
  panelRankColor,
  morphLayoutId,
}: {
  avatarSrc: string | null
  displayName: string
  panelRankColor: string | null
  morphLayoutId?: string | null
}) {
  const avatar = (
    <Avatar className="relative size-16">
      {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
      <AvatarFallback>{initials(displayName)}</AvatarFallback>
    </Avatar>
  )

  return (
    <div className="relative shrink-0">
      {panelRankColor && (
        <span
          aria-hidden
          className="absolute -inset-1 rounded-xl opacity-20"
          style={{ backgroundColor: panelRankColor }}
        />
      )}
      {morphLayoutId ? (
        <motion.span key={morphLayoutId} layoutId={morphLayoutId} className="block">
          {avatar}
        </motion.span>
      ) : (
        avatar
      )}
    </div>
  )
}

/** Trust + claim + owning-organization badges row. */
function DrawerHeaderBadges({
  trustStatus,
  claimBadgeStatus,
  organizationName,
}: {
  trustStatus: DrawerProfileView["trustStatus"]
  claimBadgeStatus: ReturnType<typeof resolveLineageClaimBadgeStatus>
  organizationName: string | null
}) {
  return (
    <Stack size="xs" wrap>
      <LineageTrustBadge status={trustStatus} />
      {claimBadgeStatus && <LineageClaimBadge status={claimBadgeStatus} />}
      {organizationName && (
        <Badge variant="outline" size="sm">
          {organizationName}
        </Badge>
      )}
    </Stack>
  )
}

/** Admin / promoter-change actions menu (+ the promoter modal it drives). Owns its own
 *  open state so the header itself stays a thin, stateless layout. */
function DrawerHeaderActions({
  promoterChangeContext,
  isAdmin,
  treeSlug,
  nodeId,
  displayName,
}: {
  promoterChangeContext: PromoterChangeContext | null
  isAdmin?: boolean
  treeSlug?: string
  nodeId?: string | null
  displayName: string
}) {
  const [promoterModalOpen, setPromoterModalOpen] = useState(false)
  if (!promoterChangeContext && !isAdmin) {
    return null
  }
  return (
    <>
      <LineageDrawerActions
        onChangePromoter={promoterChangeContext ? () => setPromoterModalOpen(true) : undefined}
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
  )
}

/**
 * The drawer's identity header — a thin layout over small extracted pieces
 * (DrawerHeaderRankBar / Avatar / Badges / Actions). The rank line pairs the
 * data-driven `BeltSwatch` belt-bar with the rank label (the legacy BBL drawer's
 * belt-bar-plus-label heading idiom, here brand-neutral via `colorHex`, ADR 0022).
 */
export function DrawerIdentityHeader({
  view,
  isClaimable,
  claimState,
  promoterChangeContext,
  isAdmin,
  treeSlug,
  nodeId,
  morphLayoutId,
}: {
  view: DrawerProfileView
  isClaimable?: boolean
  /**
   * The viewer's claim state (ADR 0036, SESSION_0440). A CLAIMED Passport suppresses the
   * "Claimable" header badge — the legacy `view.claimStatus` it used to key off is no longer
   * written post-P5, so without this a claimed node wrongly reads as claimable.
   */
  claimState?: ClaimViewerState
  promoterChangeContext: PromoterChangeContext | null
  isAdmin?: boolean
  treeSlug?: string
  nodeId?: string | null
  /** Shared-element avatar morph key (V2 students rail) — see `DrawerHeaderAvatar`. */
  morphLayoutId?: string | null
}) {
  const {
    displayName,
    avatarSrc,
    panelAward,
    panelRankColor,
    panelRankProgress,
    headerRankName,
    headerDisciplineName,
    trustStatus,
  } = view
  const isClaimed = claimState === "CLAIMED_MINE" || claimState === "CLAIMED_OTHER"
  const claimBadgeStatus = resolveLineageClaimBadgeStatus({
    isClaimable: isClaimable === true && !isClaimed,
    claimStatus: view.claimStatus,
  })
  const panelHeaderStyle = panelRankColor
    ? ({
        "--rank-color": panelRankColor,
        "--rank-progress": `${panelRankProgress}%`,
      } as CSSProperties)
    : undefined

  return (
    <DrawerHeader
      className="relative min-w-0 overflow-hidden border-b p-6 pt-7"
      style={panelHeaderStyle}
    >
      <DrawerHeaderRankBar panelRankColor={panelRankColor} />

      <Stack size="md" className="items-start justify-between min-w-0">
        <Stack size="md" className="min-w-0">
          <DrawerHeaderAvatar
            avatarSrc={avatarSrc}
            displayName={displayName}
            panelRankColor={panelRankColor}
            morphLayoutId={morphLayoutId}
          />
          <Stack size="xs" direction="column" className="min-w-0 flex-1">
            <DrawerTitle>{displayName}</DrawerTitle>
            {headerRankName && (
              <Stack size="xs" className="min-w-0 items-center">
                <BeltSwatch variant="bar" colorHex={panelRankColor} />
                <Note className="truncate">
                  {headerRankName}
                  {headerDisciplineName && <> · {headerDisciplineName}</>}
                </Note>
              </Stack>
            )}
            <DrawerHeaderBadges
              trustStatus={trustStatus}
              claimBadgeStatus={claimBadgeStatus}
              organizationName={panelAward?.organization?.name ?? null}
            />
          </Stack>
        </Stack>

        <DrawerHeaderActions
          promoterChangeContext={promoterChangeContext}
          isAdmin={isAdmin}
          treeSlug={treeSlug}
          nodeId={nodeId}
          displayName={displayName}
        />
      </Stack>
    </DrawerHeader>
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
            <DropdownMenuItem onClick={openPromoterModal}>
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
