import type { BjjTechniqueGraphNode } from "~/server/web/techniques/graph-query"

const SUMMARY_MAX_LENGTH = 140

/**
 * The graph tooltip payload is a strings-only projection of the graph node. The type carries no
 * url, poster, thumbnail, or media-id field, so a locked/premium technique's tooltip cannot leak
 * gated media BY CONSTRUCTION — the same type-encoding used by the locked-media gate. Never add
 * a media-bearing field here; richer media belongs to the gated watch surfaces.
 */
export type GraphNodeTooltip = {
  typeLabel: string
  beltName: string | null
  difficultyLevel: string | null
  position: string | null
  summary: string | null
  isFoundational: boolean
}

/** Every key the tooltip payload may carry — the no-leak whitelist the unit test locks. */
export const GRAPH_NODE_TOOLTIP_KEYS = [
  "typeLabel",
  "beltName",
  "difficultyLevel",
  "position",
  "summary",
  "isFoundational",
] as const satisfies readonly (keyof GraphNodeTooltip)[]

export const labelForGraphNodeType = (type: BjjTechniqueGraphNode["type"]) =>
  type
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

type GraphNodeTooltipSource = Pick<
  BjjTechniqueGraphNode,
  | "type"
  | "beltLevelMin"
  | "difficultyLevel"
  | "position"
  | "description"
  | "teachingCues"
  | "isFoundational"
>

const truncate = (text: string) =>
  text.length <= SUMMARY_MAX_LENGTH ? text : `${text.slice(0, SUMMARY_MAX_LENGTH - 1).trimEnd()}…`

/**
 * Derive-only content (SESSION_0546 F3): the summary consumes description first, then the first
 * teaching cue. No schema promotion, no gated field.
 */
export const buildGraphNodeTooltip = (node: GraphNodeTooltipSource): GraphNodeTooltip => {
  const summarySource = node.description?.trim() || node.teachingCues[0]?.trim() || null

  return {
    typeLabel: labelForGraphNodeType(node.type),
    beltName: node.beltLevelMin?.name ?? null,
    difficultyLevel: node.difficultyLevel,
    position: node.position,
    summary: summarySource ? truncate(summarySource) : null,
    isFoundational: node.isFoundational,
  }
}
