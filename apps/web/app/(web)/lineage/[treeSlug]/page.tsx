import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Note } from "~/components/common/note"
import { LineageTreeBoard } from "~/components/web/lineage/lineage-tree-board"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import { createGraph, generateCollectionPage } from "~/lib/structured-data"
import {
  findPublishedLineageTreeSlugs,
  findPublishedLineageTreeSummaryBySlug,
  getLineageProfilesByIds,
  getLineageTreeBySlug,
} from "~/server/web/lineage/queries"

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
// Static params
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const trees = await findPublishedLineageTreeSlugs()
  return trees.map(({ slug }) => ({ treeSlug: slug }))
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { treeSlug } = await params
  const brand = await getRequestBrand()
  const tree = await findPublishedLineageTreeSummaryBySlug({ brand, slug: treeSlug })

  if (!tree) {
    return { title: "Lineage Tree Not Found" }
  }

  return getPageMetadata({
    url: `/lineage/${treeSlug}`,
    metadata: {
      title: `${tree.name} — Lineage`,
      description: tree.description ?? `Lineage tree for ${tree.name}`,
    },
  })
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

  const structuredData = createGraph([
    generateCollectionPage(
      `/lineage/${treeSlug}`,
      result.tree.name,
      result.tree.description ?? undefined,
    ),
  ])

  if (result.members.length === 0) {
    return (
      <>
        <StructuredData data={structuredData} />

        <Breadcrumbs
          items={[
            { url: "/lineage", title: "Lineage Trees" },
            { url: `/lineage/${treeSlug}`, title: result.tree.name },
          ]}
        />

        <Intro>
          <IntroTitle>{result.tree.name}</IntroTitle>
          {result.tree.description && (
            <IntroDescription>{result.tree.description}</IntroDescription>
          )}
        </Intro>

        <Section>
          <Section.Content>
            <Note>This lineage tree has no visible members.</Note>
          </Section.Content>
        </Section>
      </>
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
  const profilesById = await getLineageProfilesByIds(visibleNodeIds)

  return (
    <>
      <StructuredData data={structuredData} />

      <Breadcrumbs
        items={[
          { url: "/lineage", title: "Lineage Trees" },
          { url: `/lineage/${treeSlug}`, title: result.tree.name },
        ]}
      />

      <Intro>
        <IntroTitle>{result.tree.name}</IntroTitle>
        {result.tree.description && <IntroDescription>{result.tree.description}</IntroDescription>}
      </Intro>

      <Section>
        <Section.Content>
          <LineageTreeBoard
            members={result.members}
            visualGroups={result.visualGroups}
            defaultRootMemberId={result.defaultRootMemberId}
            profilesById={profilesById}
          />
        </Section.Content>
      </Section>
    </>
  )
}
