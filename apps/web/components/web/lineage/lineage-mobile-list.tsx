"use client"

import { CheckIcon, ChevronRightIcon, ShieldOffIcon, TreePineIcon } from "lucide-react"
import { type CSSProperties, useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Stack } from "~/components/common/stack"
import {
  FREE_LINEAGE_LISTING_RENDER_POLICY,
  type LineageListingRenderPolicy,
} from "~/lib/entitlements/lineage-tier-policy"
import { type CanvasMember, memberInitials, nodeDisplayName } from "~/lib/lineage/canvas-model"
import { flattenLineage } from "~/lib/lineage/flatten-lineage"
import { cx } from "~/lib/utils"
import { LineageMemberActionsMenu } from "./lineage-member-actions-menu"

type LineageMobileListProps = {
  members: CanvasMember[]
  rootMembers: CanvasMember[]
  selectedMemberId: string | null
  selectedPathMemberIds: Set<string>
  onSelect: (nodeId: string) => void
  canChangePromoter?: boolean
  onChangePromoter?: (nodeId: string) => void
  renderPolicy?: LineageListingRenderPolicy
}

function memberRankLabel(member: CanvasMember) {
  if (member.selectedRank) {
    return `${member.selectedRank.name}${
      member.selectedRank.disciplineName ? ` · ${member.selectedRank.disciplineName}` : ""
    }`
  }

  const latestRankAward = member.node.user.rankAwards?.[0]
  if (!latestRankAward?.rank) return null

  return `${latestRankAward.rank.name}${
    latestRankAward.rank.rankSystem?.discipline?.name
      ? ` · ${latestRankAward.rank.rankSystem.discipline.name}`
      : ""
  }`
}

function memberBeltColor(member: CanvasMember) {
  return member.selectedRank?.colorHex ?? member.node.user.rankAwards?.[0]?.rank.colorHex ?? null
}

function memberSchoolLabel(member: CanvasMember) {
  return member.node.user.memberships?.[0]?.organization?.name ?? null
}

export function LineageMobileList({
  members,
  rootMembers,
  selectedMemberId,
  selectedPathMemberIds,
  onSelect,
  canChangePromoter,
  onChangePromoter,
  renderPolicy = FREE_LINEAGE_LISTING_RENDER_POLICY,
}: LineageMobileListProps) {
  const flattenedMembers = useMemo(
    () => flattenLineage(members, { roots: rootMembers }),
    [members, rootMembers],
  )
  const hasSelection = Boolean(selectedMemberId)

  if (flattenedMembers.length === 0) {
    return (
      <div className="rounded-xl border bg-card/70 p-4 text-sm text-muted-foreground">
        No lineage data available.
      </div>
    )
  }

  return (
    <section aria-label="Lineage mobile list" className="w-full min-w-0">
      <Stack size="xs" wrap className="mb-3 items-center justify-between">
        <Badge variant="primary" size="sm" prefix={<TreePineIcon />}>
          {flattenedMembers.length}{" "}
          {flattenedMembers.length === 1 ? "Practitioner" : "Practitioners"}
        </Badge>
      </Stack>

      <ol className="w-full min-w-0 space-y-2">
        {flattenedMembers.map(({ member, depth }) => {
          const displayName = nodeDisplayName(member.node)
          const avatarSrc = member.node.user.passport?.avatarUrl ?? member.node.user.image
          const rankLabel = memberRankLabel(member)
          const schoolLabel = memberSchoolLabel(member)
          const beltColor = memberBeltColor(member)
          const indentPx = Math.min(depth * 16, 48)
          const isSelected = member.id === selectedMemberId
          const onPath = selectedPathMemberIds.has(member.id)
          const isDimmed = hasSelection && !onPath
          const rowStyle = {
            marginLeft: indentPx,
            width: `calc(100% - ${indentPx}px)`,
            ...(beltColor ? { "--rank-color": beltColor } : {}),
          } as CSSProperties

          return (
            <li
              key={member.id}
              id={`lineage-member-${member.id}`}
              className="relative max-w-full scroll-m-8"
              style={rowStyle}
            >
              {depth > 0 && (
                <span
                  aria-hidden
                  className="-left-3 absolute top-0 h-1/2 w-3 rounded-bl-md border-border border-b border-l"
                />
              )}

              <div
                className={cx(
                  "flex min-w-0 items-center gap-1 rounded-xl border bg-card/80 p-1 shadow-sm transition-all duration-200",
                  isSelected && "border-primary bg-primary/10 ring-1 ring-primary",
                  !isSelected && onPath && "border-primary/40 bg-primary/5 ring-1 ring-primary/30",
                  isDimmed && "opacity-55",
                )}
              >
                {beltColor && (
                  <span aria-hidden className="h-11 w-1 shrink-0 rounded-full bg-(--rank-color)" />
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelect(member.nodeId)}
                  aria-label={
                    renderPolicy.canOpenProfileDrawer
                      ? `Open lineage profile for ${displayName}`
                      : `Highlight lineage path for ${displayName}`
                  }
                  aria-current={isSelected ? "true" : undefined}
                  className="min-h-14 min-w-0 flex-1 justify-start px-2 py-1.5 text-left hover:bg-muted/60"
                >
                  <div className="!flex min-w-0 flex-1 items-center gap-2">
                    {renderPolicy.features.avatar && (
                      <Avatar className="size-9 shrink-0">
                        {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
                        <AvatarFallback>{memberInitials(displayName)}</AvatarFallback>
                      </Avatar>
                    )}

                    <Stack size="xs" direction="column" wrap={false} className="min-w-0 flex-1">
                      <span className="sr-only">Generation {depth + 1}</span>
                      <span className="max-w-full truncate font-medium text-sm">{displayName}</span>
                      {rankLabel && (
                        <Stack size="xs" wrap={false} className="min-w-0 items-center">
                          {beltColor && (
                            <span
                              aria-hidden
                              className="size-2 shrink-0 rounded-full ring-1 ring-border/50"
                              style={{ backgroundColor: beltColor }}
                            />
                          )}
                          <span className="max-w-full truncate text-muted-foreground text-xs">
                            {rankLabel}
                          </span>
                        </Stack>
                      )}
                      {renderPolicy.features.school && schoolLabel && (
                        <span className="max-w-full truncate text-muted-foreground text-xs">
                          {schoolLabel}
                        </span>
                      )}
                    </Stack>
                  </div>
                </Button>

                <Stack size="xs" wrap={false} className="shrink-0 items-center">
                  {renderPolicy.features.verificationBadge &&
                    (member.node.isVerified ? (
                      <Badge variant="success" size="sm" prefix={<CheckIcon />}>
                        <span className="sr-only">Verified</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" size="sm" prefix={<ShieldOffIcon />}>
                        <span className="sr-only">Unverified</span>
                      </Badge>
                    ))}
                  {renderPolicy.canOpenProfileDrawer && (
                    <ChevronRightIcon aria-hidden className="size-4 text-muted-foreground" />
                  )}
                  {(renderPolicy.canOpenProfileDrawer || canChangePromoter) && (
                    <LineageMemberActionsMenu
                      displayName={displayName}
                      onViewProfile={() => onSelect(member.nodeId)}
                      canChangePromoter={canChangePromoter}
                      onChangePromoter={
                        onChangePromoter ? () => onChangePromoter(member.nodeId) : undefined
                      }
                    />
                  )}
                </Stack>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
