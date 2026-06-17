import type { LineageVisualNode } from "~/lib/lineage/to-lineage-visual"

/**
 * Public + shared types for the LineageCohortTimeline folder module (the custom
 * View A timeline-tree, ADR 0027). The barrel (`index.tsx`) re-exports the public
 * ones so `~/components/web/lineage/lineage-cohort-timeline` keeps resolving to the
 * same surface after the single-file → folder-module decomposition.
 */

export type LineageTimelineHandlers = {
  /** Click a box / branch box → recenter the focal. */
  onFocus: (memberId: string) => void
  /** Click the ⋮ → open the actions menu anchored to the trigger. */
  onOpenMenu: (memberId: string, anchorEl: HTMLElement) => void
  /** Click a leaf row → open the profile drawer (belt-rank roster lives there). */
  onOpenProfile: (memberId: string) => void
}

export type LineageCohortTimelineProps = LineageTimelineHandlers & {
  nodes: LineageVisualNode[]
  focusMemberId: string | null
  ancestryDepth: number
  progenyDepth: number
  /** null = no active filter (all shown); otherwise non-matching nodes dim. */
  matchedMemberIds: Set<string> | null
  reduceMotion: boolean
}

/** One branch-child column for the connector band: stable id + promotion-year label. */
export type ConnectorColumn = {
  id: string
  year: string | null
}
