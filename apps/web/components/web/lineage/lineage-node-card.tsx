"use client"

import { CheckIcon, ShieldOffIcon } from "lucide-react"
import type { CSSProperties } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
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

type SelectedRank = {
  id: string
  name: string
  shortName: string | null
  colorHex?: string | null
  sortOrder?: number | null
  disciplineName?: string | null
}

type LineageNodeCardProps = {
  node: LineageNodeRow
  isRoot?: boolean
  isClaimable?: boolean
  selectedRank?: SelectedRank | null
  onSelect: (nodeId: string) => void
  showActions?: boolean
  canChangePromoter?: boolean
  onChangePromoter?: () => void
}

function initials(name: string | null | undefined): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
}

export function LineageNodeCard({
  node,
  isRoot,
  isClaimable,
  selectedRank,
  onSelect,
  showActions = true,
  canChangePromoter,
  onChangePromoter,
}: LineageNodeCardProps) {
  const displayName = node.user.passport?.displayName ?? node.user.name ?? "Unnamed"
  const avatarSrc = node.user.passport?.avatarUrl ?? node.user.image

  // Prefer the tree-member's selectedRankAward over the user's latest overall rank
  const latestRankAward = node.user.rankAwards?.[0]
  const rankLabel = selectedRank
    ? `${selectedRank.name}${selectedRank.disciplineName ? ` · ${selectedRank.disciplineName}` : ""}`
    : latestRankAward?.rank
      ? `${latestRankAward.rank.name}${
          latestRankAward.rank.rankSystem?.discipline?.name
            ? ` · ${latestRankAward.rank.rankSystem.discipline.name}`
            : ""
        }`
      : null

  const latestMembership = node.user.memberships?.[0]
  const schoolLabel = latestMembership?.organization?.name ?? null
  const beltColor = selectedRank?.colorHex ?? latestRankAward?.rank.colorHex ?? null
  const cardStyle = beltColor ? ({ "--rank-color": beltColor } as CSSProperties) : undefined

  return (
    <Card
      style={cardStyle}
      className={cx(
        "min-h-40 min-w-40 max-w-50 overflow-hidden p-0 md:min-h-44 md:min-w-50 md:max-w-65",
        isRoot && "border-foreground/40",
      )}
    >
      {beltColor && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-(--rank-color)"
        />
      )}

      {showActions && (
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
        className="flex min-h-40 w-full cursor-pointer flex-col p-3 text-left md:min-h-44 md:p-4"
      >
        <Stack size="sm" direction="column" wrap={false} className="h-full w-full">
          <Stack size="sm" wrap={false} className="w-full items-start">
            <Avatar className="size-10 md:size-12">
              {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
              <AvatarFallback>{initials(displayName)}</AvatarFallback>
            </Avatar>
            <Stack
              size="xs"
              direction="column"
              wrap={false}
              className={cx("min-w-0 flex-1", showActions && "pr-7")}
            >
              <span className="max-w-full truncate font-medium text-sm">{displayName}</span>
              {rankLabel && (
                <span className="max-w-full truncate text-muted-foreground text-xs">
                  {rankLabel}
                </span>
              )}
            </Stack>
          </Stack>

          {schoolLabel && <Note className="max-w-full truncate text-xs">{schoolLabel}</Note>}

          <Stack size="xs" wrap className="mt-auto min-h-5">
            {node.isVerified ? (
              <Badge variant="success" size="sm" prefix={<CheckIcon />}>
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" size="sm" prefix={<ShieldOffIcon />}>
                Unverified
              </Badge>
            )}
            {isRoot && (
              <Badge variant="primary" size="sm">
                Root
              </Badge>
            )}
            {isClaimable === true && (
              <Badge variant="info" size="sm">
                Claimable
              </Badge>
            )}
            {isClaimable === false && (
              <Badge variant="soft" size="sm">
                Display only
              </Badge>
            )}
          </Stack>
        </Stack>
      </button>
    </Card>
  )
}
