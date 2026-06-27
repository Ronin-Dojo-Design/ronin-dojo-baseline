import "dotenv/config"

import { db } from "~/services/db"

/**
 * SESSION_0457 (WL-P2-21, Slice A1) — STRICTLY READ-ONLY audit of prod lineage topology.
 *
 * Enumerates every LineageTree (member count, isPublished, isClaimable, has-root) and every
 * LineageTreeMember row for Brian Truelson's node, so we can SEE — before any mutation — the 2
 * leftover unpublished `rigan-machado-bjj-lineage` clone trees + Brian's redundant clone
 * memberships, and confirm his ONE published canonical membership.
 *
 * NO WRITES. Only findUnique / findMany / count / groupBy. Run vs PROD:
 *   cd apps/web
 *   SKIP_ENV_VALIDATION=1 bun --env-file=.env.prod scripts/audit-residual-lineage-clones.ts
 */

const TARGET_NODE_SLUG = "brian-truelson"
const CLONE_SLUG = "rigan-machado-bjj-lineage"
const CANONICAL_SLUG = "rigan-machado-lineage"

async function main() {
  // 1. Every tree, with member count + key flags.
  const trees = await db.lineageTree.findMany({
    select: {
      id: true,
      brand: true,
      slug: true,
      isPublished: true,
      isClaimable: true,
      defaultRootMemberId: true,
      disciplineId: true,
    },
    orderBy: [{ brand: "asc" }, { slug: "asc" }],
  })

  const memberCounts = await db.lineageTreeMember.groupBy({
    by: ["treeId"],
    _count: { _all: true },
  })
  const countByTree = new Map<string, number>(
    memberCounts.map((m: { treeId: string; _count: { _all: number } }) => [
      m.treeId,
      m._count._all,
    ]),
  )

  console.log("\n══ ALL LINEAGE TREES (prod) ══════════════════════════════════════════")
  console.table(
    trees.map((t: (typeof trees)[number]) => ({
      brand: t.brand,
      slug: t.slug,
      published: t.isPublished,
      claimable: t.isClaimable,
      hasRoot: t.defaultRootMemberId ? "yes" : "NO",
      members: countByTree.get(t.id) ?? 0,
      treeId: t.id,
    })),
  )

  // 2. Resolve Brian's node (node slug → fallback via directory profile, like the send script).
  const select = {
    id: true,
    slug: true,
    passportId: true,
    passport: { select: { displayName: true, userId: true } },
  } as const
  let node = await db.lineageNode.findUnique({ where: { slug: TARGET_NODE_SLUG }, select })
  if (!node) {
    const profile = await db.directoryProfile.findUnique({
      where: { slug: TARGET_NODE_SLUG },
      select: { passport: { select: { lineageNode: { select } } } },
    })
    node = profile?.passport?.lineageNode ?? null
  }

  if (!node) {
    console.error(`\n❌ No lineage node resolved for slug "${TARGET_NODE_SLUG}".`)
    await db.$disconnect()
    process.exitCode = 1
    return
  }

  console.log("\n══ BRIAN TRUELSON — NODE ═════════════════════════════════════════════")
  console.table({
    displayName: node.passport?.displayName ?? "(none)",
    nodeSlug: node.slug,
    nodeId: node.id,
    passportId: node.passportId,
    passportUserId: node.passport?.userId ?? "(unclaimed — null)",
  })

  // 3. EVERY membership Brian's node has, across all trees.
  const memberships = await db.lineageTreeMember.findMany({
    where: { nodeId: node.id },
    select: {
      id: true,
      isClaimable: true,
      primaryVisualParentMemberId: true,
      visualGroup: { select: { label: true } },
      tree: {
        select: { slug: true, brand: true, isPublished: true, isClaimable: true, id: true },
      },
    },
    orderBy: { tree: { slug: "asc" } },
  })

  console.log("\n══ BRIAN'S MEMBERSHIPS (every tree) ══════════════════════════════════")
  console.table(
    memberships.map((m: (typeof memberships)[number]) => ({
      treeSlug: m.tree.slug,
      brand: m.tree.brand,
      treePublished: m.tree.isPublished,
      treeClaimable: m.tree.isClaimable,
      memberClaimable: m.isClaimable,
      visualGroup: m.visualGroup?.label ?? "(none)",
      hasVisualParent: m.primaryVisualParentMemberId ? "yes" : "no (root)",
      memberId: m.id,
    })),
  )

  // 4. Summary — the cleanup target.
  const cloneTrees = trees.filter((t: (typeof trees)[number]) => t.slug === CLONE_SLUG)
  const canonicalMemberships = memberships.filter(
    (m: (typeof memberships)[number]) => m.tree.slug === CANONICAL_SLUG && m.tree.isPublished,
  )
  const cloneMemberships = memberships.filter(
    (m: (typeof memberships)[number]) => m.tree.slug === CLONE_SLUG,
  )

  console.log("\n══ CLEANUP TARGET SUMMARY ════════════════════════════════════════════")
  console.table({
    cloneTreeRows: cloneTrees.length,
    cloneTreesAllUnpublished: cloneTrees.every((t: (typeof trees)[number]) => !t.isPublished),
    brianPublishedCanonicalMemberships: canonicalMemberships.length,
    brianCloneMemberships: cloneMemberships.length,
    brianTotalMemberships: memberships.length,
  })
  console.log("\nClone trees (candidates for removal):")
  console.table(
    cloneTrees.map((t: (typeof trees)[number]) => ({
      slug: t.slug,
      brand: t.brand,
      published: t.isPublished,
      members: countByTree.get(t.id) ?? 0,
      treeId: t.id,
    })),
  )

  await db.$disconnect()
}

main().catch(async error => {
  console.error(error)
  await db.$disconnect()
  process.exit(1)
})
