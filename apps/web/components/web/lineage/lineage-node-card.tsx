"use client"

import { CheckIcon, ShieldOffIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"
import type { LineageNodeRow } from "~/server/web/lineage/payloads"

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
  onSelect: (nodeId: string) => void
}

function initials(name: string | null | undefined): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase()
}

export function LineageNodeCard({ node, isRoot, onSelect }: LineageNodeCardProps) {
  const displayName = node.user.passport?.displayName ?? node.user.name ?? "Unnamed"
  const latestRankAward = node.user.rankAwards?.[0]
  const rankLabel = latestRankAward?.rank
    ? `${latestRankAward.rank.name}${
        latestRankAward.rank.rankSystem?.discipline?.name
          ? ` · ${latestRankAward.rank.rankSystem.discipline.name}`
          : ""
      }`
    : null

  const latestMembership = node.user.memberships?.[0]
  const schoolLabel = latestMembership?.organization?.name ?? null

  return (
    <Card
      asChild
      className={cx(
        "min-w-[200px] max-w-[260px] cursor-pointer p-4",
        isRoot && "border-foreground/40",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(node.id)}
        aria-label={`Open lineage profile for ${displayName}`}
      >
        <Stack size="sm" direction="column" className="w-full text-left">
          <Stack size="sm">
            <Avatar className="size-12">
              {node.user.image && <AvatarImage src={node.user.image} alt={displayName} />}
              <AvatarFallback>{initials(displayName)}</AvatarFallback>
            </Avatar>
            <Stack size="xs" direction="column" className="min-w-0 flex-1">
              <span className="truncate font-medium text-sm">{displayName}</span>
              {rankLabel && (
                <span className="truncate text-xs text-muted-foreground">{rankLabel}</span>
              )}
            </Stack>
          </Stack>

          {schoolLabel && <Note className="truncate text-xs">{schoolLabel}</Note>}

          <Stack size="xs" wrap>
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
          </Stack>
        </Stack>
      </button>
    </Card>
  )
}
