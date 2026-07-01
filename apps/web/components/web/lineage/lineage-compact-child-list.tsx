"use client"

import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"
import type { CSSProperties } from "react"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Carousel, CarouselSlide } from "~/components/common/carousel"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import {
  FREE_LINEAGE_LISTING_RENDER_POLICY,
  type LineageListingRenderPolicy,
} from "~/lib/entitlements/lineage-tier-policy"
import {
  buildChildGroups,
  type CanvasMember,
  type ChildGroup,
  memberInitials,
  resolveLineageMemberView,
} from "~/lib/lineage/canvas-model"
import { cx } from "~/lib/utils"
import type { LineageVisualGroupRow } from "~/server/web/lineage/payloads"
import { LineageMemberActionsMenu } from "./lineage-member-actions-menu"
import { LineageTrustBadge } from "./lineage-trust-badge"

/**
 * Org-chart "board" layout — compact, inline, expandable child rows.
 *
 * Renders the direct children of a board node as a vertical list of compact
 * rows (avatar + name + belt-color rank + descendant count + expand caret),
 * grouped by `LineageVisualGroup` when a public label is set. A row's caret
 * expands its own children inline (recursion into this same component); the
 * row body selects the node (→ profile drawer), matching the Org Chart Board
 * pattern from `docs/petey-plan-0305.md` Phase 3.
 *
 * Rendering-only: it reuses the canvas normalization (childrenByParentId,
 * visualGroupById) and the selected-path set already computed by the canvas.
 *
 * Author: Cody / SESSION_0312 (Phase 3a).
 */

// Hard recursion ceiling — the canvas already cycle-guards via `visited`, this
// is a defensive floor so malformed/very deep data can never blow the stack.
const MAX_DEPTH = 24

// Progressive disclosure (Phase 3b): rows at or below this list depth start
// collapsed by default, so a large lineage opens to ~2 generations and the rest
// expands on demand. depth 0 = the root's direct children (auto-expanded);
// depth ≥ 1 = deeper tiers (collapsed unless on the selected path or opened).
const AUTO_COLLAPSE_DEPTH = 1

// Wide sibling sets get the shared rail; smaller groups stay as the compact vertical list.
const CHILD_RAIL_THRESHOLD = 4

type CompactSharedProps = {
  childrenByParentId: Map<string | null, CanvasMember[]>
  descendantCountById: Map<string, number>
  visualGroupById: Map<string, LineageVisualGroupRow>
  selectedMemberId: string | null
  selectedPathMemberIds: Set<string>
  onSelect: (nodeId: string) => void
  canChangePromoter?: boolean
  onChangePromoter?: (nodeId: string) => void
  renderPolicy?: LineageListingRenderPolicy
  /** The tree's discipline — scopes the shown belt to this discipline (ADR 0035 §3). */
  disciplineId?: string | null
}

type LineageCompactChildListProps = CompactSharedProps & {
  parentMemberId: string
  depth: number
  visited: Set<string>
}

export function LineageCompactChildList({
  parentMemberId,
  depth,
  visited,
  ...shared
}: LineageCompactChildListProps) {
  const children = shared.childrenByParentId.get(parentMemberId) ?? []
  if (children.length === 0 || depth > MAX_DEPTH) return null

  const groups = buildChildGroups({ children, visualGroupById: shared.visualGroupById })

  return (
    <Stack
      size="xs"
      direction="column"
      className={cx("w-full", depth > 0 && "ml-3 border-border/60 border-l pl-3")}
    >
      {groups.map(group => {
        const useRail = group.members.length >= CHILD_RAIL_THRESHOLD

        return (
          <Stack key={group.id} size="xs" direction="column" className="w-full">
            <LineageCompactGroupLabel group={group} />

            {useRail ? (
              <div data-lineage-board-child-rail className="w-full min-w-0">
                <Carousel
                  ariaLabel={childGroupRailLabel(group, depth)}
                  controls="desktop"
                  edgeFades
                  options={{ align: "start" }}
                >
                  {group.members.map(member => (
                    <CarouselSlide key={member.id} width={280}>
                      <LineageCompactChildRow
                        member={member}
                        depth={depth}
                        visited={visited}
                        {...shared}
                      />
                    </CarouselSlide>
                  ))}
                </Carousel>
              </div>
            ) : (
              group.members.map(member => (
                <LineageCompactChildRow
                  key={member.id}
                  member={member}
                  depth={depth}
                  visited={visited}
                  {...shared}
                />
              ))
            )}
          </Stack>
        )
      })}
    </Stack>
  )
}

function childGroupRailLabel(group: ChildGroup, depth: number) {
  if (group.group?.showPublicLabel) return `${group.group.label} students`
  return `Generation ${depth + 1} students`
}

function LineageCompactGroupLabel({ group }: { group: ChildGroup }) {
  if (!group.group?.showPublicLabel) return null

  if (group.group.promotionEvent?.slug) {
    return (
      <Link
        href={`/events/${group.group.promotionEvent.slug}`}
        className="px-1 font-medium text-[0.65rem] text-muted-foreground uppercase tracking-wide hover:text-foreground"
      >
        {group.group.label}
      </Link>
    )
  }

  return (
    <span className="px-1 font-medium text-[0.65rem] text-muted-foreground uppercase tracking-wide">
      {group.group.label}
    </span>
  )
}

function LineageCompactChildRow({
  member,
  depth,
  visited,
  renderPolicy = FREE_LINEAGE_LISTING_RENDER_POLICY,
  disciplineId,
  ...shared
}: CompactSharedProps & {
  member: CanvasMember
  depth: number
  visited: Set<string>
}) {
  const childCount = (shared.childrenByParentId.get(member.id) ?? []).length
  const hasChildren = childCount > 0 && !visited.has(member.id)
  const descendantCount = shared.descendantCountById.get(member.id) ?? 0

  const onPath = shared.selectedPathMemberIds.has(member.id)
  const isSelected = member.id === shared.selectedMemberId

  // Default expansion (Phase 3b): open shallow tiers, collapse deep ones and any
  // member flagged `isCollapsedDefault` — but always open rows on the selected
  // path so deep selections reveal their ancestors. Once the viewer toggles a
  // row, honor their choice (`manualExpanded`) over the default.
  const deepTier = depth >= AUTO_COLLAPSE_DEPTH
  const autoExpanded = onPath || (!member.isCollapsedDefault && !deepTier)
  const [manualExpanded, setManualExpanded] = useState<boolean | null>(null)
  const expanded = hasChildren && (manualExpanded ?? autoExpanded)

  const { displayName, avatarSrc, rankLabel, beltColor, trustStatus } = resolveLineageMemberView(
    member.node,
    { disciplineId },
  )
  const rowStyle = beltColor ? ({ "--rank-color": beltColor } as CSSProperties) : undefined

  return (
    <div className="w-full">
      <div
        style={rowStyle}
        className={cx(
          "flex items-center gap-1 rounded-lg pr-2 transition-colors duration-200",
          isSelected && "bg-primary/10 ring-1 ring-primary",
          !isSelected && onPath && "bg-primary/5 ring-1 ring-primary/30",
        )}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setManualExpanded(prev => !(prev ?? autoExpanded))}
            aria-expanded={expanded}
            aria-label={
              expanded ? `Collapse ${displayName}'s lineage` : `Expand ${displayName}'s lineage`
            }
            className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {expanded ? (
              <ChevronDownIcon className="size-4" />
            ) : (
              <ChevronRightIcon className="size-4" />
            )}
          </button>
        ) : (
          <span className="size-6 shrink-0" aria-hidden />
        )}

        {beltColor && (
          <span aria-hidden className="h-8 w-1 shrink-0 rounded-full bg-(--rank-color)" />
        )}

        <button
          type="button"
          onClick={() => shared.onSelect(member.nodeId)}
          aria-label={`Open lineage profile for ${displayName}`}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg py-1.5 text-left transition-colors hover:bg-muted/60"
        >
          {renderPolicy.features.avatar && (
            <Avatar className="size-8 shrink-0">
              {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
              <AvatarFallback>{memberInitials(displayName)}</AvatarFallback>
            </Avatar>
          )}

          <Stack size="xs" direction="column" className="min-w-0 flex-1">
            <span className="max-w-full truncate font-medium text-sm">{displayName}</span>
            {rankLabel && (
              <Stack size="xs" className="min-w-0 items-center">
                {beltColor && (
                  <span
                    className="size-2 shrink-0 rounded-full ring-1 ring-border/50"
                    style={{ backgroundColor: beltColor }}
                    aria-hidden
                  />
                )}
                <span className="max-w-full truncate text-muted-foreground text-xs">
                  {rankLabel}
                </span>
              </Stack>
            )}
          </Stack>
        </button>

        {renderPolicy.features.verificationBadge && (
          <LineageTrustBadge status={trustStatus} className="shrink-0" />
        )}

        {!expanded && descendantCount > 0 && (
          <Badge
            variant="soft"
            size="sm"
            className="shrink-0"
            aria-label={`${descendantCount} ${descendantCount === 1 ? "person" : "people"} hidden under ${displayName}`}
          >
            {descendantCount}
          </Badge>
        )}

        {/* Row tap opens the drawer for everyone; the actions menu only earns its
            place for the editor-exclusive "Change promoter" action. */}
        {shared.canChangePromoter && (
          <LineageMemberActionsMenu
            displayName={displayName}
            onViewProfile={() => shared.onSelect(member.nodeId)}
            canChangePromoter={shared.canChangePromoter}
            onChangePromoter={
              shared.onChangePromoter ? () => shared.onChangePromoter?.(member.nodeId) : undefined
            }
          />
        )}
      </div>

      {expanded && (
        <LineageCompactChildList
          parentMemberId={member.id}
          depth={depth + 1}
          visited={new Set(visited).add(member.id)}
          {...shared}
          renderPolicy={renderPolicy}
          disciplineId={disciplineId}
        />
      )}
    </div>
  )
}
