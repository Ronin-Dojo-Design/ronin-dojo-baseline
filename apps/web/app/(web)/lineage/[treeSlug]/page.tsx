import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { H4 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { LineageTreeBoard } from "~/components/web/lineage/lineage-tree-board"
import { getRequestBrand } from "~/lib/brand-context"
import type { LineageNodeProfile } from "~/server/web/lineage/payloads"
import { getLineageProfile, getLineageTreeBySlug } from "~/server/web/lineage/queries"

/**
 * Standalone public lineage tree viewer.
 *
 * Route: `/lineage/[treeSlug]`
 *
 * Renders a published lineage tree using Lineage Tree v1 data directly:
 * LineageTreeMember parent pointers + LineageVisualGroup row metadata.
 *
 * No d3-org-chart. No synthetic edge conversion.
 */

interface Props {
  params: Promise<{ treeSlug: string }>
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { treeSlug } = await params
  const brand = await getRequestBrand()
  const result = await getLineageTreeBySlug({ brand, slug: treeSlug })

  if (!result) {
    return { title: "Lineage Tree Not Found" }
  }

  return {
    title: `${result.tree.name} — Lineage`,
    description: result.tree.description ?? `Lineage tree for ${result.tree.name}`,
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function LineageTreePage({ params }: Props) {
  const { treeSlug } = await params
  const brand = await getRequestBrand()
  const result = await getLineageTreeBySlug({ brand, slug: treeSlug })

  if (!result) {
    notFound()
  }

  if (result.members.length === 0) {
    return (
      <section className="py-8">
        <Stack size="xs" direction="column">
          <H4 as="h1">{result.tree.name}</H4>
          <Note>This lineage tree has no visible members.</Note>
        </Stack>
      </section>
    )
  }

  /**
   * Eager-load profiles for drawer.
   *
   * The tree payload is already materialized and visibility-filtered. Drawer
   * profiles are keyed by LineageNode id because LineageNodeCard selects by
   * node id.
   */
  const visibleNodeIds = Array.from(new Set(result.members.map(member => member.nodeId)))

  const profiles = await Promise.all(
    visibleNodeIds.map(async id => [id, await getLineageProfile(id)] as const),
  )

  const profilesById: Record<string, LineageNodeProfile> = {}

  for (const [id, profile] of profiles) {
    if (profile) profilesById[id] = profile
  }

  return (
    <section className="py-8">
      <Stack size="xs" direction="column" className="mb-4">
        <H4 as="h1">{result.tree.name}</H4>
        {result.tree.description && <Note>{result.tree.description}</Note>}
      </Stack>

      <LineageTreeBoard
        members={result.members}
        visualGroups={result.visualGroups}
        defaultRootMemberId={result.defaultRootMemberId}
        profilesById={profilesById}
      />
    </section>
  )
}
