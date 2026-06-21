import { lineageTreeToGalaxyGraph } from "~/components/web/lineage/galaxy/bbl-galaxy-from-lineage"
import type { BblGalaxyGraph } from "~/components/web/lineage/galaxy/bbl-galaxy-types"
import { getRequestBrand } from "~/lib/brand-context"
import type { LineageNodeProfile } from "~/server/web/lineage/payloads"
import {
  findPublishedLineageTreeSlugs,
  getLineageProfilesByIds,
  getLineageTreeBySlug,
} from "~/server/web/lineage/queries"

export type BblGalaxyData = {
  graph: BblGalaxyGraph
  /** Full public profiles keyed by nodeId — fed to the lineage profile drawer on select. */
  profilesById: Record<string, LineageNodeProfile>
  treeSlug: string
}

/**
 * Public-safe galaxy data for the current brand (BBL). Picks the first published public
 * tree, projects it to the galaxy graph, and eager-loads the public profiles so a node
 * click can open the real lineage profile drawer with zero extra round-trips (mirrors the
 * 2D tree page's server-fetch → client-viewer pattern). Returns null when no published
 * public tree exists, so the route can fall back to the mock prototype in dev.
 *
 * v1 targets one tree; the "whole galaxy of all public trees" merge is a later slice.
 */
export const getBblGalaxyData = async (): Promise<BblGalaxyData | null> => {
  const brand = await getRequestBrand()

  const publishedSlugs = await findPublishedLineageTreeSlugs()
  const target = publishedSlugs.find(entry => entry.brand === brand) ?? null
  if (!target) return null

  const result = await getLineageTreeBySlug({ brand, slug: target.slug })
  if (!result || result.members.length === 0) return null

  const graph = lineageTreeToGalaxyGraph(result)
  const profilesById = await getLineageProfilesByIds(result.members.map(member => member.nodeId))

  return { graph, profilesById, treeSlug: target.slug }
}
