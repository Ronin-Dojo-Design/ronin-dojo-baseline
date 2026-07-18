import type { BjjTechniqueGraphNode } from "~/server/web/techniques/graph-query"

/**
 * Tooltip DTO for technique graph nodes. TEXT ONLY by construction: the key set is closed
 * (heading / typeLabel / definition / keyPoints), so no `url` / `thumbnailUrl` / `posterUrl` /
 * `mediaId` / `media` field can ever ride along — the same type-encoded no-media philosophy as
 * `LockedTileMedia` in `technique-media-gate.ts`.
 */
export type TechniqueNodeTooltip = {
  heading: string
  typeLabel: string
  definition: string | null
  keyPoints: string[]
}

const DEFINITION_MAX_LENGTH = 140
const KEY_POINT_CAP = 3

/**
 * THE ONE humanizer for graph node types ("position" → "Position", hyphens → spaces). Exported so
 * the graph component consumes the same helper (SESSION_0569 Doug P3 — was duplicated as
 * `labelForType` in technique-graph.tsx).
 */
export const typeLabelFor = (type: BjjTechniqueGraphNode["type"]) =>
  type
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

/** First sentence of the description, clamped to ~140 chars with a real ellipsis (U+2026). */
const deriveDefinition = (description: string | null): string | null => {
  const text = description?.trim()
  if (!text) return null

  const sentence = (/^[\s\S]*?[.!?](?=\s|$)/.exec(text)?.[0] ?? text).trim()
  if (sentence.length <= DEFINITION_MAX_LENGTH) return sentence

  // Clamp at a word boundary so the ellipsis never lands mid-word ("gri…"). A single unbroken
  // ≥139-char token has no boundary to respect, so only then does the hard clamp stand.
  const clamped = sentence.slice(0, DEFINITION_MAX_LENGTH - 1)
  const lastSpace = clamped.lastIndexOf(" ")
  const atWordBoundary = lastSpace > 0 ? clamped.slice(0, lastSpace) : clamped

  return `${atWordBoundary.trimEnd()}…`
}

/** Teaching cues win; otherwise fall back to parsed curriculum-item key points. Capped at 3. */
const deriveKeyPoints = (node: BjjTechniqueGraphNode): string[] => {
  const cues = node.teachingCues.filter(cue => cue.trim().length > 0)
  if (cues.length > 0) return cues.slice(0, KEY_POINT_CAP)

  return node.curriculumItems
    .flatMap(item => item.keyPoints)
    .filter(point => point.trim().length > 0)
    .slice(0, KEY_POINT_CAP)
}

/** Derive-only (F3): every tooltip field is computed from existing graph-node scalars. */
export function deriveNodeTooltip(node: BjjTechniqueGraphNode): TechniqueNodeTooltip {
  return {
    heading: node.label,
    typeLabel: typeLabelFor(node.type),
    definition: deriveDefinition(node.description),
    keyPoints: deriveKeyPoints(node),
  }
}
