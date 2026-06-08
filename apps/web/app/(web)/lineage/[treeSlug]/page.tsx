import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { QrShareButton } from "~/components/common/qr-share-button"
import { Stack } from "~/components/common/stack"
import { LineageTreeBoard } from "~/components/web/lineage/lineage-tree-board"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import { buildAbsoluteUrl, getRequestOrigin } from "~/lib/request-url"
import {
  createGraph,
  generateBreadcrumbs,
  generateCollectionPage,
  generateSchemaReference,
  generateStructuredDataEntity,
} from "~/lib/structured-data"
import { getLineageListingRenderPolicyForUser } from "~/server/web/entitlements/lineage-tier-policy"
import {
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

export const dynamic = "force-dynamic"

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

  return await getPageMetadata({
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
  const session = await getServerSession()
  const [result, renderPolicy] = await Promise.all([
    getLineageTreeBySlug({ brand, slug: treeSlug }),
    getLineageListingRenderPolicyForUser({ brand, userId: session?.user?.id ?? null }),
  ])

  if (!result) {
    notFound()
  }

  const treeUrl = `/lineage/${treeSlug}`
  const origin = await getRequestOrigin()
  const absoluteTreeUrl = buildAbsoluteUrl(treeUrl, origin)
  const treeReference = generateSchemaReference(
    "CreativeWork",
    treeUrl,
    result.tree.name,
    "lineage-tree",
  )
  const breadcrumbItems = [
    { url: "/lineage", title: "Lineage Trees" },
    { url: treeUrl, title: result.tree.name },
  ]
  const structuredData = createGraph([
    generateBreadcrumbs(breadcrumbItems),
    generateCollectionPage(treeUrl, result.tree.name, result.tree.description ?? undefined, {
      mainEntity: treeReference,
      about: treeReference,
    }),
    generateStructuredDataEntity({
      type: "CreativeWork",
      url: treeUrl,
      name: result.tree.name,
      description: result.tree.description,
      id: treeReference["@id"],
    }),
  ])

  if (result.members.length === 0) {
    return (
      <>
        <StructuredData data={structuredData} />

        <Breadcrumbs items={breadcrumbItems} />

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

      <Breadcrumbs items={breadcrumbItems} />

      <Intro>
        <Stack size="sm" wrap className="items-start justify-between">
          <IntroTitle>{result.tree.name}</IntroTitle>
          <QrShareButton
            url={absoluteTreeUrl}
            title="Lineage QR Code"
            description="Scan to open this public lineage page."
            fileName={`lineage-${treeSlug}`}
          />
        </Stack>
        {result.tree.description && <IntroDescription>{result.tree.description}</IntroDescription>}
      </Intro>

      {result.tree.isClaimable && (
        <Stack size="sm" wrap>
          <Button
            variant="secondary"
            size="sm"
            render={<Link href={`/lineage/${treeSlug}/claim`} />}
          >
            Claim a profile
          </Button>
          <Note>Claimable profiles are marked on the tree.</Note>
        </Stack>
      )}

      <Section>
        <Section.Content>
          <LineageTreeBoard
            members={result.members}
            visualGroups={result.visualGroups}
            defaultRootMemberId={result.defaultRootMemberId}
            profilesById={profilesById}
            treeSlug={treeSlug}
            isTreeClaimable={result.tree.isClaimable}
            renderPolicy={renderPolicy}
          />
        </Section.Content>
      </Section>
    </>
  )
}
