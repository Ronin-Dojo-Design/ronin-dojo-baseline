"use client"

import type { CSSProperties } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { LineageTrustBadge } from "~/components/web/lineage/lineage-trust-badge"
import {
  FREE_LINEAGE_LISTING_RENDER_POLICY,
  type LineageListingRenderPolicy,
} from "~/lib/entitlements/lineage-tier-policy"
import {
  memberInitials,
  resolveLineageMemberView,
  type SelectedRank,
} from "~/lib/lineage/canvas-model"
import { cx } from "~/lib/utils"
import type { LineageNodeRow } from "~/server/web/lineage/payloads"
import { LineageMemberActionsMenu } from "./lineage-member-actions-menu"

/**
 * Card representing a single LineageNode in the tree.
 *
 * Click → calls `onSelect(node.id)` so the parent (section) can open the
 * profile drawer for the node. The whole card is a button for keyboard
 * accessibility (port-spec a11y requirement).
 *
 * Author: Cody / SESSION_0175 TASK_03.
 */

type LineageNodeCardProps = {
  node: LineageNodeRow
  isRoot?: boolean
  isClaimable?: boolean
  selectedRank?: SelectedRank | null
  onSelect: (nodeId: string) => void
  showActions?: boolean
  canChangePromoter?: boolean
  onChangePromoter?: () => void
  renderPolicy?: LineageListingRenderPolicy
}

export function LineageNodeCard({
  node,
  isRoot,
  onSelect,
  showActions = true,
  canChangePromoter,
  onChangePromoter,
  renderPolicy = FREE_LINEAGE_LISTING_RENDER_POLICY,
}: LineageNodeCardProps) {
  // One person, one ruleset — every surface derives presentation from this resolver
  // (avatar, highest-awarded belt, school, the single verification status).
  const { displayName, avatarSrc, rankLabel, schoolLabel, beltColor, trustStatus } =
    resolveLineageMemberView(node)
  const canRenderFullCard = renderPolicy.canRenderFullCard
  const cardStyle = beltColor ? ({ "--rank-color": beltColor } as CSSProperties) : undefined
  // The card body opens the drawer for everyone, so the actions menu only earns
  // its place for the editor-exclusive "Change promoter" action — consistent with
  // the mobile + compact list rows (otherwise it is a redundant one-item menu).
  const showActionsMenu = showActions && canChangePromoter

  return (
    <Card
      style={cardStyle}
      className={cx(
        canRenderFullCard
          ? "min-h-40 min-w-40 max-w-50 md:min-h-44 md:min-w-50 md:max-w-65"
          : "min-h-28 min-w-36 max-w-48 md:min-w-44 md:max-w-56",
        "overflow-hidden p-0",
        isRoot && "border-foreground/40",
      )}
    >
      {beltColor && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-(--rank-color)"
        />
      )}

      {showActionsMenu && (
        <div className="absolute top-2 right-2 z-10">
          <LineageMemberActionsMenu
            displayName={displayName}
            onViewProfile={() => onSelect(node.id)}
            canChangePromoter={canChangePromoter}
            onChangePromoter={onChangePromoter}
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => onSelect(node.id)}
        aria-label={`Open lineage profile for ${displayName}`}
        className={cx(
          "flex w-full cursor-pointer flex-col p-3 text-left md:p-4",
          canRenderFullCard ? "min-h-40 md:min-h-44" : "min-h-28",
        )}
      >
        <Stack size="sm" direction="column" wrap={false} className="h-full w-full">
          <Stack size="sm" wrap={false} className="w-full items-start">
            {renderPolicy.features.avatar && (
              <Avatar className="size-10 md:size-12">
                {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
                <AvatarFallback>{memberInitials(displayName)}</AvatarFallback>
              </Avatar>
            )}
            <Stack
              size="xs"
              direction="column"
              wrap={false}
              className={cx("min-w-0 flex-1", showActionsMenu && "pr-7")}
            >
              <span className="max-w-full truncate font-medium text-sm">{displayName}</span>
              {rankLabel && (
                <span className="max-w-full truncate text-muted-foreground text-xs">
                  {rankLabel}
                </span>
              )}
            </Stack>
          </Stack>

          {renderPolicy.features.school && schoolLabel && (
            <Note className="max-w-full truncate text-xs">{schoolLabel}</Note>
          )}

          {(renderPolicy.features.verificationBadge || isRoot) && (
            <Stack size="xs" wrap className="mt-auto min-h-5">
              {renderPolicy.features.verificationBadge && (
                <LineageTrustBadge status={trustStatus} />
              )}
              {isRoot && (
                <Badge variant="primary" size="sm">
                  Root
                </Badge>
              )}
            </Stack>
          )}
        </Stack>
      </button>
    </Card>
  )
}
