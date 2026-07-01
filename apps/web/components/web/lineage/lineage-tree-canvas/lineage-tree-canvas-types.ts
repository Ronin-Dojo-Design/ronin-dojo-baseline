import type { LineageListingRenderPolicy } from "~/lib/entitlements/lineage-tier-policy"
import type { LineageRow } from "~/lib/lineage/tree-layout"
import type {
  LineageRelationshipRow,
  LineageTreeMemberRow,
  LineageVisualGroupRow,
} from "~/server/web/lineage/payloads"

/** Drag payload carried by a draggable lineage member (dnd-kit `active.data`). */
export type DragMemberData = {
  memberId: string
  parentMemberId: string | null
  visualGroupId: string | null
  visualSortOrder: number
}

/** Drop payload carried by a member/group drop target (dnd-kit `over.data`). */
export type DropTargetData = {
  targetType: "member" | "group"
  parentMemberId: string | null
  visualGroupId: string | null
  visualSortOrder: number
}

/**
 * Visual layout for the canvas:
 * - `tree`: the standard top-down vertical org chart (default).
 * - `board`: the Org Chart Board — root cards with inline, expandable compact
 *   child lists (Phase 3a). Mobile-friendly; reuses the same normalization.
 *
 * Public — re-exported from the folder barrel (`index.tsx`) so consumers can type
 * `defaultLayout` without reaching into a private module file.
 */
export type LineageLayout = "tree" | "board"

export type LineageTreeCanvasProps = {
  /**
   * Preferred v1 source. This preserves visual parent + group-row semantics.
   */
  members?: LineageTreeMemberRow[]
  visualGroups?: LineageVisualGroupRow[]
  defaultRootMemberId?: string | null

  /**
   * Legacy fallback source used by the discipline detail section.
   */
  rows?: LineageRow[]
  rootId?: string
  edges?: LineageRelationshipRow[]

  selectedNodeId?: string | null
  onSelect: (nodeId: string) => void
  /**
   * Distinct capability-gated promoter action for the per-card / per-row menu
   * (Phase 3c). If omitted, the menu hides "Change promoter..." rather than
   * falling back to View Profile.
   */
  onChangePromoter?: (nodeId: string) => void
  treeId?: string
  editMode?: boolean
  canEditPlacement?: boolean
  canManageGroups?: boolean

  /**
   * Optional explicit initial layout. When omitted, the canvas defaults from
   * the viewport: board below md, tree at/above md. Viewers can switch between
   * tree/board in the toolbar; an explicit toggle wins for the session.
   */
  defaultLayout?: LineageLayout
  renderPolicy?: LineageListingRenderPolicy
  /** The tree's discipline — scopes the shown belt to this discipline (ADR 0035 §3). */
  disciplineId?: string | null
}
