/**
 * Backfill INSTRUCTOR_STUDENT provenance edges from the visual tree (SESSION_0493).
 *
 * WHY: 64 PUBLIC members (incl. Tony Hua) have a `LineageTreeMember.primaryVisualParentMemberId`
 * (visual placement) but NO `LineageRelationship` INSTRUCTOR_STUDENT edge — so the ancestry
 * timeline (`getLineageAncestryForPassport`) renders empty for them. The visual tree was built
 * from the real lineage import (parent = instructor in this dataset), so minting the provenance
 * edge from the visual parent is a faithful backfill, operator-ratified in the SESSION_0493 grill.
 *
 * RULES:
 *  - Only nodes with a visual parent and ZERO existing INSTRUCTOR_STUDENT edges pointing at them
 *    (a node already linked to ANY instructor is not gapped — never second-guess real edges).
 *  - Edge verification mirrors the endpoints: both nodes isVerified → edge VERIFIED, else PENDING
 *    (node-level "everyone imported = Verified" provenance carries to the imported structure).
 *  - Self-loops and duplicate (from,to) pairs are skipped. Idempotent: re-run finds 0 gaps.
 *
 * USAGE (local):  cd apps/web && bun scripts/backfill-lineage-instructor-edges.ts [--apply]
 * USAGE (prod):   cd apps/web && bun --env-file=.env.prod scripts/backfill-lineage-instructor-edges.ts [--apply]
 *   (dotenv/config imports FIRST — `--env-file` REPLACES the env, see env-prod-overlay memory)
 */
import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../.generated/prisma/client"

const APPLY = process.argv.includes("--apply")

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 5 }),
})

const main = async () => {
  // Every tree member with a visual parent, plus what we need to judge the gap.
  const members = await db.lineageTreeMember.findMany({
    where: { primaryVisualParentMemberId: { not: null } },
    select: {
      id: true,
      primaryVisualParentMemberId: true,
      tree: { select: { slug: true } },
      node: {
        select: {
          id: true,
          isVerified: true,
          visibility: true,
          passport: { select: { displayName: true } },
          // Any existing instructor edge (any visibility) → not gapped.
          relationshipsTo: {
            where: { type: "INSTRUCTOR_STUDENT" },
            select: { id: true },
            take: 1,
          },
        },
      },
    },
  })

  // Resolve visual parents in one batch.
  const parentMemberIds = [
    ...new Set(members.map(m => m.primaryVisualParentMemberId).filter((v): v is string => !!v)),
  ]
  const parents = await db.lineageTreeMember.findMany({
    where: { id: { in: parentMemberIds } },
    select: {
      id: true,
      node: {
        select: { id: true, isVerified: true, passport: { select: { displayName: true } } },
      },
    },
  })
  const parentByMemberId = new Map(parents.map(p => [p.id, p.node]))

  type Mint = {
    fromNodeId: string
    toNodeId: string
    isVerified: boolean
    childName: string
    parentName: string
    tree: string
    childVisibility: string
  }
  const mints: Mint[] = []
  const seenPairs = new Set<string>()

  for (const member of members) {
    const child = member.node
    if (child.relationshipsTo.length > 0) continue // already has a real instructor edge
    const parent = parentByMemberId.get(member.primaryVisualParentMemberId as string)
    if (!parent) continue
    if (parent.id === child.id) continue // self-loop guard
    const pairKey = `${parent.id}->${child.id}`
    if (seenPairs.has(pairKey)) continue // same pair via multiple trees
    seenPairs.add(pairKey)

    mints.push({
      fromNodeId: parent.id, // from = instructor, to = student (walk contract)
      toNodeId: child.id,
      isVerified: child.isVerified && parent.isVerified,
      childName: child.passport?.displayName ?? child.id,
      parentName: parent.passport?.displayName ?? parent.id,
      tree: member.tree.slug ?? "?",
      childVisibility: child.visibility,
    })
  }

  console.log(`${APPLY ? "APPLY" : "DRY-RUN"} — ${mints.length} INSTRUCTOR_STUDENT edges to mint\n`)
  for (const m of mints) {
    console.log(
      `  ${m.childName}  ←  ${m.parentName}   [${m.tree}] ${m.childVisibility}${m.isVerified ? " VERIFIED" : " PENDING"}`,
    )
  }
  const byVis = mints.reduce<Record<string, number>>((acc, m) => {
    acc[m.childVisibility] = (acc[m.childVisibility] ?? 0) + 1
    return acc
  }, {})
  console.log(`\nBy visibility: ${JSON.stringify(byVis)}`)

  if (!APPLY) {
    console.log("\nDry-run only. Re-run with --apply to write.")
    return
  }

  const result = await db.lineageRelationship.createMany({
    data: mints.map(m => ({
      type: "INSTRUCTOR_STUDENT" as const,
      fromNodeId: m.fromNodeId,
      toNodeId: m.toNodeId,
      isVerified: m.isVerified,
      verificationStatus: m.isVerified ? ("VERIFIED" as const) : ("PENDING" as const),
    })),
    skipDuplicates: true,
  })
  console.log(`\nCreated ${result.count} edges.`)
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
