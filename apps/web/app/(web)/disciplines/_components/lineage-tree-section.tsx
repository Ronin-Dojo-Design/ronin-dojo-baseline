import { Brand } from "~/.generated/prisma/client"
import { Button } from "~/components/common/button"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { LineageTreeBoard } from "~/components/web/lineage/lineage-tree-board"
import { getServerSession } from "~/lib/auth"
import { getLineageListingRenderPolicyForUser } from "~/server/web/entitlements/lineage-tier-policy"
import { getLineageProfilesByIds, getLineageTreeBySlug } from "~/server/web/lineage/queries"

/**
 * Lineage tree + profile drawer section on the discipline detail page.
 *
 * Server component — fetches the seeded Baseline-org owner's lineage tree,
 * pre-fetches every visible node's profile, then hands everything to a
 * client island (`LineageTreeBoard`) that owns drawer state.
 *
 * Brand-guard: Baseline + BBL for MVP. Other brands render nothing —
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
  disciplineCode?: string | null
}

// ADR 0037 (SESSION_0443): BBL collapsed its two bjj trees into the canonical full-roster
// `rigan-machado-lineage`. Single-brand collapse is in flight (Baseline serves BBL content), so the
// map is brand-agnostic — no per-brand override needed.
const LINEAGE_TREE_SLUG_BY_DISCIPLINE_CODE: Record<string, string> = {
  bjj: "rigan-machado-lineage",
  eskrima: "doce-pares-eskrima-lineage",
  "muay-thai": "muay-thai-lineage",
  kajukenbo: "kajukenbo-lineage",
  karate: "karate-lineage",
}

const LINEAGE_TREE_SECTION_BRANDS = new Set<Brand>([Brand.BASELINE_MARTIAL_ARTS, Brand.BBL])

export async function LineageTreeSection({ brand, disciplineCode }: LineageTreeSectionProps) {
  // Brand-guard: skip entirely for brands without a seeded public lineage tree.
  if (!LINEAGE_TREE_SECTION_BRANDS.has(brand) || !disciplineCode) {
    return null
  }

  const treeSlug = LINEAGE_TREE_SLUG_BY_DISCIPLINE_CODE[disciplineCode]
  if (!treeSlug) {
    return null
  }

  const session = await getServerSession()
  const [result, renderPolicy] = await Promise.all([
    getLineageTreeBySlug({ brand, slug: treeSlug }),
    getLineageListingRenderPolicyForUser({ brand, userId: session?.user?.id ?? null }),
  ])
  if (!result || result.members.length === 0) {
    return null
  }

  /**
   * Eager-load profiles for drawer. Tree members are already materialized and
   * visibility-filtered by the v1 LineageTree read model.
   */
  const visibleNodeIds = Array.from(new Set(result.members.map(member => member.nodeId)))
  const profilesById = await getLineageProfilesByIds(visibleNodeIds)

  return (
    <section className="w-full">
      <Stack size="xs" direction="column" className="mb-4">
        <H4>Lineage</H4>
        <Note>{result.tree.name}. Click any tile to open the profile drawer.</Note>
      </Stack>

      {result.tree.isClaimable && (
        <Stack size="sm" wrap className="mb-4">
          <Button
            variant="secondary"
            size="sm"
            render={<Link href={`/lineage/${treeSlug}/claim`} />}
          >
            Claim a profile
          </Button>
          <Note>Open a profile to see if it can be claimed.</Note>
        </Stack>
      )}

      <LineageTreeBoard
        members={result.members}
        visualGroups={result.visualGroups}
        defaultRootMemberId={result.defaultRootMemberId}
        profilesById={profilesById}
        treeSlug={treeSlug}
        isTreeClaimable={result.tree.isClaimable}
        renderPolicy={renderPolicy}
      />
    </section>
  )
}
