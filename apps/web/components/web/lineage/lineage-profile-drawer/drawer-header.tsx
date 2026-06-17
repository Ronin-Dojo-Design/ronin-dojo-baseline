"use client"

import {
  EllipsisVerticalIcon,
  LockKeyholeIcon,
  PencilIcon,
  ShieldCheckIcon,
  UserRoundCogIcon,
} from "lucide-react"
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

/** Avatar with an ambient belt-color glow (the glow self-disables when colorless). */
function DrawerHeaderAvatar({
  avatarSrc,
  displayName,
  panelRankColor,
}: {
  avatarSrc: string | null
  displayName: string
  panelRankColor: string | null
}) {
  return (
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
  promoterChangeContext,
  isAdmin,
  treeSlug,
  nodeId,
}: {
  view: DrawerProfileView
  isClaimable?: boolean
  promoterChangeContext: PromoterChangeContext | null
  isAdmin?: boolean
  treeSlug?: string
  nodeId?: string | null
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
  const claimBadgeStatus = resolveLineageClaimBadgeStatus({
    isClaimable,
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
