import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { QrShareButton } from "~/components/common/qr-share-button"
import { Stack } from "~/components/common/stack"
import { LineageTreeBoard } from "~/components/web/lineage/lineage-tree-board"
import { LineageViewAIsland } from "~/components/web/lineage/lineage-view-a-island"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { hasLineageAdminAccess } from "~/components/admin/auth-hoc"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { bblBodyFont, bblHeadingFont } from "~/lib/fonts"
import { cx } from "~/lib/utils"
import { rsc } from "~/lib/orpc-server"
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
  searchParams: Promise<{ view?: string; focus?: string }>
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

export default async function LineageTreePage({ params, searchParams }: Props) {
  const { treeSlug } = await params
  const { view, focus } = await searchParams
  // SESSION_0393: the cinematic focal explorer is the default public lineage view;
  // the practical board/tree view is the labelled `?view=board` fallback.
  const isExploreView = view !== "board"
  const brand = await getRequestBrand()
  const session = await getServerSession()
  // Phase 1c (SESSION_0364): the primary tree read now travels through oRPC
  // (`lineage.bySlug`) instead of a direct query import. The handler calls the
  // same `getLineageTreeBySlug` with `context.brand`, so the brand scope and
  // public-payload shape are byte-identical — only the transport changed. The
  // sibling render-policy query stays a direct call (Phase 1c migrates the
  // primary read only).
  const api = await rsc()
  const [result, renderPolicy, canManage] = await Promise.all([
    api.lineage.bySlug({ slug: treeSlug }),
    getLineageListingRenderPolicyForUser({ brand, userId: session?.user?.id ?? null }),
    session?.user
      ? hasLineageAdminAccess(session.user.id, session.user.role)
      : Promise.resolve(false),
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
          <Stack size="sm" wrap>
            <QrShareButton
              url={absoluteTreeUrl}
              title="Lineage QR Code"
              description="Scan to open this public lineage page."
              fileName={`lineage-${treeSlug}`}
            />
            {isExploreView ? (
              <Button
                variant="secondary"
                size="sm"
                render={<Link href={`/lineage/${treeSlug}?view=board`} />}
                prefix={<ArrowLeftIcon size={14} />}
              >
                Board view
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                render={
                  <Link
                    href={`/lineage/${treeSlug}?view=explore${result.defaultRootMemberId ? `&focus=${result.defaultRootMemberId}` : ""}`}
                  />
                }
              >
                Cinematic explorer
              </Button>
            )}
          </Stack>
        </Stack>
        {result.tree.description && <IntroDescription>{result.tree.description}</IntroDescription>}
      </Intro>

      {result.tree.isClaimable && (
        <Stack size="sm" wrap>
          <Button variant="secondary" size="sm" render={<Link href="/lineage/join" />}>
            Claim a profile
          </Button>
          <Note>Claimable profiles are marked on the tree.</Note>
        </Stack>
      )}

      <Section>
        {/* Full-bleed: the lineage views have no sidebar, so span all 3 grid columns.
            Default col-span-2 trapped the focal explorer in 2/3 width. `min-w-0` stops
            the focal tree's min-content width (min-w-fit) from blowing this grid item
            past the viewport — without it the inner overflow-x-auto never scrolls. */}
        <Section.Content className="md:col-span-3 min-w-0">
          {isExploreView ? (
            // Brand type seam (SESSION_0394): the explorer inherits BBL Poppins
            // (headings) + Inter (body) via these font vars; the LineageCohortTimeline
            // React cards apply the heading font directly (SESSION_0395, ADR 0027).
            // `w-full min-w-0`: this flex child must not grow to the tree's content
            // width (the blowout) — it stays at column width so the tree scrolls inside.
            <div className={cx("w-full min-w-0", bblHeadingFont.variable, bblBodyFont.variable)}>
              <LineageViewAIsland
                members={result.members}
                relationships={result.members.flatMap(m => m.node.relationshipsTo)}
                visualGroups={result.visualGroups}
                defaultRootMemberId={result.defaultRootMemberId}
                profilesById={profilesById}
                treeSlug={treeSlug}
                isTreeClaimable={result.tree.isClaimable}
                initialFocusId={focus ?? null}
                canManage={canManage}
              />
            </div>
          ) : (
            <LineageTreeBoard
              members={result.members}
              visualGroups={result.visualGroups}
              defaultRootMemberId={result.defaultRootMemberId}
              profilesById={profilesById}
              treeSlug={treeSlug}
              isTreeClaimable={result.tree.isClaimable}
              renderPolicy={renderPolicy}
            />
          )}
        </Section.Content>
      </Section>
    </>
  )
}
