"use client"

import { Menu } from "@base-ui/react/menu"
import { CopyIcon, PencilIcon, UserRoundIcon, UserRoundPlusIcon } from "lucide-react"
import { DropdownMenuItem } from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import type { LineageVisualNode } from "~/lib/lineage/to-lineage-visual"
import { cx, popoverAnimationClasses } from "~/lib/utils"
import type { ClaimViewerState } from "~/server/web/claims/resolve-viewer-claim-state"

/**
 * The per-card ⋮ actions menu (View profile / Claim this profile / Copy focus
 * link / Open in editor).
 *
 * Composes Base UI `Menu.*` directly (not the L1 `DropdownMenu`) because L1
 * `DropdownMenuContent` has no `anchor` pass-through and this menu anchors to a
 * captured card element — not drift. (Desi P2, SESSION_0504.)
 *
 * Behavior is byte-identical to the prior inline island block: same item text +
 * order, same claim-gate (`claimable && isTreeClaimable && state === UNCLAIMED`),
 * and each item closes the menu via `onClose`.
 */
export function CardMenu({
  cardMenu,
  activeMenuNode,
  claimStateByNodeId,
  isTreeClaimable,
  canManage,
  treeSlug,
  openDrawer,
  copyFocusLink,
  onClose,
}: {
  cardMenu: { memberId: string; anchorEl: HTMLElement } | null
  activeMenuNode: LineageVisualNode | null
  claimStateByNodeId?: Record<string, ClaimViewerState>
  isTreeClaimable: boolean
  canManage: boolean
  treeSlug?: string
  openDrawer: (memberId: string) => void
  copyFocusLink: (memberId: string) => void
  onClose: () => void
}) {
  return (
    <Menu.Root
      open={cardMenu !== null}
      onOpenChange={open => {
        if (!open) onClose()
      }}
    >
      <Menu.Portal>
        <Menu.Positioner
          anchor={cardMenu?.anchorEl ?? null}
          side="bottom"
          align="end"
          sideOffset={6}
          className="isolate z-50"
        >
          <Menu.Popup
            className={cx(
              "flex min-w-48 flex-col rounded-xl border border-white/10 bg-[#0a0a0b] p-1 text-white shadow-2xl shadow-black/50",
              popoverAnimationClasses,
            )}
          >
            <DropdownMenuItem
              onClick={() => {
                if (cardMenu) openDrawer(cardMenu.memberId)
                onClose()
              }}
            >
              <UserRoundIcon />
              View profile
            </DropdownMenuItem>

            {activeMenuNode?.claimable &&
              isTreeClaimable &&
              // SESSION_0440 — don't offer a claim on a node already claimed or with the
              // viewer's claim pending (shared resolver). Undefined (un-threaded) → UNCLAIMED.
              (claimStateByNodeId?.[activeMenuNode.nodeId] ?? "UNCLAIMED") === "UNCLAIMED" && (
                <DropdownMenuItem
                  render={<Link href={`/lineage/join?node=${activeMenuNode.nodeId}`} />}
                >
                  <UserRoundPlusIcon />
                  Claim this profile
                </DropdownMenuItem>
              )}

            <DropdownMenuItem
              onClick={() => {
                if (cardMenu) copyFocusLink(cardMenu.memberId)
                onClose()
              }}
            >
              <CopyIcon />
              Copy focus link
            </DropdownMenuItem>

            {canManage && treeSlug && activeMenuNode && (
              <DropdownMenuItem
                render={<Link href={`/lineage/${treeSlug}/edit/${activeMenuNode.nodeId}`} />}
              >
                <PencilIcon />
                Open in editor
              </DropdownMenuItem>
            )}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
