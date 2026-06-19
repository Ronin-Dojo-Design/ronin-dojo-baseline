"use client"

import { useRef } from "react"
import { AncestorSpine } from "./ancestor-spine"
import { BoxNode } from "./box-node"
import type { LineageCohortTimelineProps } from "./cohort-timeline-types"
import { useCohortTimeline } from "./use-cohort-timeline"

export type { LineageTimelineHandlers, LineageCohortTimelineProps } from "./cohort-timeline-types"

/**
 * LineageCohortTimeline — the custom View A layout that replaces the vendored
 * `family-chart` genealogy engine (ADR 0027, decision B; SESSION_0395).
 *
 * The unit is a Kajukenbo-style **list-box**: a card with a cinematic header
 * (avatar / BBL-Poppins name / belt-graphic) plus a vertical list of that person's
 * children. A listed child who *has their own students* sprouts their own box below,
 * joined by a measured-SVG connector; a leaf child stays a compact row inside the
 * parent card. Deterministic top-down flow (no physics); native-scroll canvas
 * (the WATERSHED 60B KISS conclusion).
 *
 * Thin orchestrator (the colocated folder module's public barrel): it calls the
 * `use-cohort-timeline` derivation hook and composes the extracted parts
 * (`ancestor-spine`, `box-node` → `box-card` / `leaf-row` / `connector-band`). It
 * owns no presentation beyond the scroll container + empty state.
 *
 * Consumed by `lineage-view-a-island.tsx` — the prop contract + export name are
 * unchanged across the single-file → folder-module decomposition.
 *
 * @see docs/runbooks/component-launch-sweep-recipe.md
 */
export function LineageCohortTimeline({
  nodes,
  focusMemberId,
  ancestryDepth,
  progenyDepth,
  matchedMemberIds,
  reduceMotion,
  onFocus,
  onOpenMenu,
  onOpenProfile,
}: LineageCohortTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const { focalNode, ancestors, childrenByParent, handlers } = useCohortTimeline({
    nodes,
    focusMemberId,
    ancestryDepth,
    reduceMotion,
    onFocus,
    onOpenMenu,
    onOpenProfile,
  })

  if (!focalNode) {
    return (
      <div className="flex min-h-[35rem] items-center justify-center text-sm text-white/40">
        No lineage members to display.
      </div>
    )
  }

  // Scroll model (SESSION_0411): the tree is WIDE and TALL at 77 members. Horizontal
  // overflow scrolls natively *inside* this container (reach the widest cohort), while
  // vertical flow is content-driven — the container grows to the tree's full height so
  // the PAGE scrolls top-to-bottom instead of trapping the tree in a fixed-height,
  // both-axis nested scroller. `overflow-x-auto` is the single axis that scrolls here;
  // the height is left to content (no `h-full`/`min-h-full`).
  return (
    <div ref={scrollRef} className="w-full overflow-x-auto" style={{ scrollbarWidth: "thin" }}>
      <div className="flex min-w-fit flex-col items-center px-4 py-8 sm:px-10 sm:py-12">
        <AncestorSpine
          ancestors={ancestors}
          matchedMemberIds={matchedMemberIds}
          handlers={handlers}
        />
        <BoxNode
          node={focalNode}
          promoterName={ancestors.at(-1)?.displayName ?? null}
          childrenByParent={childrenByParent}
          focusMemberId={focusMemberId}
          generation={0}
          maxDepth={progenyDepth}
          matchedMemberIds={matchedMemberIds}
          reduceMotion={reduceMotion}
          handlers={handlers}
        />
      </div>
    </div>
  )
}
