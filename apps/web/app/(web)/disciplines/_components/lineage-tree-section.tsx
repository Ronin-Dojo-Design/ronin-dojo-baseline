import { Brand } from "~/.generated/prisma/client"
import { H4 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { LineageTreeBoard } from "~/components/web/lineage/lineage-tree-board"
import { bucketByDepth } from "~/lib/lineage/tree-layout"
import type { LineageNodeProfile } from "~/server/web/lineage/payloads"
import {
  getLineageProfile,
  getLineageRootForUser,
  getLineageTreeForUser,
} from "~/server/web/lineage/queries"
import { db } from "~/services/db"

/**
 * Lineage tree + profile drawer section on the discipline detail page.
 *
 * Server component — fetches the seeded Baseline-org owner's lineage tree,
 * pre-fetches every visible node's profile, then hands everything to a
 * client island (`LineageTreeBoard`) that owns drawer state.
 *
 * Brand-guard: Baseline-only for MVP. Non-Baseline brands render nothing —
 * not a "Coming soon" copy block (per SESSION_0175 Open decisions).
 *
 * Author: Cody / SESSION_0175 TASK_03.
 * Refs:
 *   - docs/sprints/SESSION_0175.md TASK_03
 *   - docs/knowledge/wiki/component-porting/specs/lineage-family-tree-port-spec.md
 *   - docs/knowledge/wiki/component-porting/specs/lineage-profile-drawer-port-spec.md
 */

type LineageTreeSectionProps = {
  brand: Brand
}

export async function LineageTreeSection({ brand }: LineageTreeSectionProps) {
  // Brand-guard: skip entirely for non-Baseline brands.
  if (brand !== Brand.BASELINE_MARTIAL_ARTS) {
    return null
  }

  // Resolve the lineage root user. MVP anchors every Baseline discipline page
  // on the same person (Baseline org owner — Brian, per the seed). Future
  // sessions will pivot per-discipline / per-school owner.
  const baselineOrg = await db.organization.findFirst({
    where: { brand: Brand.BASELINE_MARTIAL_ARTS, ownerId: { not: null } },
    select: { ownerId: true },
  })
  if (!baselineOrg?.ownerId) return null

  const rootNode = await getLineageRootForUser(baselineOrg.ownerId)
  if (!rootNode) return null

  const tree = await getLineageTreeForUser(baselineOrg.ownerId, 5)
  if (!tree) return null

  const rows = bucketByDepth(rootNode, tree.nodes, tree.edges)
  const visibleNodeIds = Array.from(new Set(rows.flatMap(row => row.nodes.map(n => n.id))))

  // Eager-load profiles for every visible node so the drawer can render
  // synchronously without a server-action round trip. Tree is small (≤10
  // nodes in seed); cheap enough to fetch upfront.
  const profiles = await Promise.all(
    visibleNodeIds.map(async id => [id, await getLineageProfile(id)] as const),
  )
  const profilesById: Record<string, LineageNodeProfile> = {}
  for (const [id, profile] of profiles) {
    if (profile) profilesById[id] = profile
  }

  return (
    <section>
      <Stack size="xs" direction="column" className="mb-4">
        <H4 as="h3">Lineage</H4>
        <Note>
          Instructor lineage rooted at{" "}
          {rootNode.user.passport?.displayName ?? rootNode.user.name ?? "the head instructor"}.
          Click any tile to open the profile drawer.
        </Note>
      </Stack>
      <LineageTreeBoard
        rows={rows}
        rootId={rootNode.id}
        profilesById={profilesById}
        edges={tree.edges}
      />
    </section>
  )
}
