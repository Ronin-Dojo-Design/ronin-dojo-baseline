import { Brand } from "~/.generated/prisma/client"
import { CANONICAL_TREE_SLUG } from "~/server/admin/lineage/place-lead-core"
import { parseLeadLineageMeta } from "~/server/admin/leads/lineage-selections"
import type { LeadDetail } from "~/server/admin/leads/queries"
import { db } from "~/services/db"

/**
 * FI-003 — the eligibility gate + display resolver for the manual "Place on lineage tree" control on
 * `/app/leads/[id]` (the steward fallback for leads that weren't auto-placed at submit). A lead
 * qualifies when it is a Join-the-Legacy signup (`meta.source`) carrying a registered
 * `trainedUnderNodeId` whose node still exists and is a member of the canonical tree (only then can the
 * student be filed UNDER them). Returns the resolved instructor + tree names for the confirm dialog, or
 * `null` when the lead is not eligible (the control is hidden).
 */
export type PlaceLeadOnLineageTarget = {
  instructorName: string
  treeName: string
}

export async function resolvePlaceLeadOnLineageTarget(
  lead: Pick<LeadDetail, "meta">,
): Promise<PlaceLeadOnLineageTarget | null> {
  const meta = lead.meta as Record<string, unknown> | null
  const source = meta && typeof meta === "object" ? (meta as { source?: unknown }).source : null
  if (source !== "join-the-legacy") return null

  const { trainedUnderNodeId } = parseLeadLineageMeta(lead.meta)
  if (!trainedUnderNodeId) return null

  const tree = await db.lineageTree.findUnique({
    where: { brand_slug: { brand: Brand.BBL, slug: CANONICAL_TREE_SLUG } },
    select: { id: true, name: true },
  })
  if (!tree) return null

  // The instructor must be a MEMBER of the canonical tree — otherwise there is nothing to file under
  // (the action would leave the student at root; hide the control until the anchor is on the tree).
  const instructorMember = await db.lineageTreeMember.findUnique({
    where: { treeId_nodeId: { treeId: tree.id, nodeId: trainedUnderNodeId } },
    select: { node: { select: { passport: { select: { displayName: true } } } } },
  })
  if (!instructorMember) return null

  return {
    instructorName: instructorMember.node.passport?.displayName ?? "their instructor",
    treeName: tree.name,
  }
}
