import "dotenv/config"

import { db } from "~/services/db"

/**
 * SESSION_0457 (WL-P2-21, Slice A1) — STRICTLY READ-ONLY coverage check.
 *
 * For the 2 unpublished `rigan-machado-bjj-lineage` clone trees (the delete candidates), report —
 * per member node — whether that node ALSO has a membership on some OTHER tree (so it keeps a
 * placement after the clones are deleted) vs whether the clone is its LAST/only tree placement
 * (would be fully removed from all trees). This is the orphan test that must pass before any
 * "delete the whole tree" path is recommended.
 *
 * NO WRITES. Run vs PROD:
 *   cd apps/web
 *   SKIP_ENV_VALIDATION=1 bun --env-file=.env.prod scripts/audit-clone-member-coverage.ts
 */

const CLONE_SLUG = "rigan-machado-bjj-lineage"
const CANONICAL_SLUG = "rigan-machado-lineage"

async function main() {
  const cloneTrees = await db.lineageTree.findMany({
    where: { slug: CLONE_SLUG, isPublished: false },
    select: { id: true, brand: true, slug: true },
  })
  const deleteTreeIds = new Set<string>(cloneTrees.map((t: { id: string }) => t.id))

  const canonical = await db.lineageTree.findFirst({
    where: { slug: CANONICAL_SLUG, isPublished: true },
    select: { id: true, brand: true },
  })

  console.log("\n══ DELETE-CANDIDATE TREES ════════════════════════════════════════════")
  console.table(
    cloneTrees.map((t: { brand: string; slug: string; id: string }) => ({
      brand: t.brand,
      slug: t.slug,
      treeId: t.id,
    })),
  )
  console.log(`Canonical published tree: ${canonical?.id ?? "(none)"} (${canonical?.brand ?? "?"})`)

  for (const tree of cloneTrees) {
    const members = await db.lineageTreeMember.findMany({
      where: { treeId: tree.id },
      select: {
        nodeId: true,
        node: { select: { slug: true, passport: { select: { displayName: true } } } },
      },
    })

    const rows: Array<{
      name: string
      slug: string
      onCanonical: boolean
      otherTreePlacements: number
      lastPlacement: boolean
    }> = []

    for (const m of members) {
      // Every membership this node has on a tree NOT in the delete set.
      const otherMemberships = await db.lineageTreeMember.findMany({
        where: { nodeId: m.nodeId, treeId: { notIn: [...deleteTreeIds] } },
        select: { tree: { select: { slug: true, isPublished: true } } },
      })
      const onCanonical = otherMemberships.some(
        (om: { tree: { slug: string } }) => om.tree.slug === CANONICAL_SLUG,
      )
      rows.push({
        name: m.node?.passport?.displayName ?? "(unknown)",
        slug: m.node?.slug ?? "(no slug)",
        onCanonical,
        otherTreePlacements: otherMemberships.length,
        lastPlacement: otherMemberships.length === 0,
      })
    }

    const orphans = rows.filter(r => r.lastPlacement)
    const notOnCanonical = rows.filter(r => !r.onCanonical)

    console.log(`\n══ ${tree.brand} / ${tree.slug} — ${members.length} member(s) ══════════════`)
    console.table(rows)
    console.log(
      `  covered-on-canonical: ${rows.length - notOnCanonical.length}/${rows.length} · ` +
        `not-on-canonical: ${notOnCanonical.length} · ` +
        `WOULD-BE-ORPHANED (no other tree at all): ${orphans.length}`,
    )
    if (orphans.length) {
      console.log("  ⚠ Nodes that would lose their LAST tree placement if this tree is deleted:")
      console.table(orphans.map(o => ({ name: o.name, slug: o.slug })))
    }
  }

  await db.$disconnect()
}

main().catch(async error => {
  console.error(error)
  await db.$disconnect()
  process.exit(1)
})
