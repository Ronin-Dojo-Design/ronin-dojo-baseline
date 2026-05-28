import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "~/.generated/prisma/client"

/**
 * seed-bbl-org.ts
 *
 * Idempotent seed for the BBL (Black Belt Legacy) organization and a
 * minimal claimable lineage tree so `/lineage/join` can be smoke-tested.
 *
 * Creates:
 *   1. A BBL Organization (skips if one already exists).
 *   2. A placeholder User for a claimable lineage node.
 *   3. A LineageNode for that user.
 *   4. A published, claimable LineageTree with one claimable member.
 *
 * Idempotency: every insert uses findFirst + create. Safe to re-run.
 *
 * Usage (LOCAL DEV ONLY):
 *   bun run apps/web/prisma/seed-bbl-org.ts
 *
 * @see docs/sprints/SESSION_0280.md
 * @see apps/web/prisma/seed-baseline-lineage.ts (pattern reference)
 */

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

const BRAND = "BBL" as const

async function main() {
  console.log("[seed-bbl-org] Starting BBL org + lineage tree seed...")

  // 1. BBL Organization
  let org = await db.organization.findFirst({ where: { brand: BRAND } })
  if (!org) {
    org = await db.organization.create({
      data: {
        name: "Black Belt Legacy",
        brand: BRAND,
        slug: "black-belt-legacy",
      },
    })
    console.log(`  ✅ Created BBL Organization: ${org.id}`)
  } else {
    console.log(`  ⏭️  BBL Organization already exists: ${org.id}`)
  }

  // 2. Placeholder user for claimable lineage node
  const placeholderEmail = "bbl-claimable@placeholder.lineage"
  let placeholderUser = await db.user.findFirst({ where: { email: placeholderEmail } })
  if (!placeholderUser) {
    placeholderUser = await db.user.create({
      data: {
        name: "BBL Claimable Profile",
        email: placeholderEmail,
        emailVerified: false,
      },
    })
    console.log(`  ✅ Created placeholder user: ${placeholderUser.id}`)
  } else {
    console.log(`  ⏭️  Placeholder user already exists: ${placeholderUser.id}`)
  }

  // 3. LineageNode for the placeholder
  let node = await db.lineageNode.findFirst({ where: { userId: placeholderUser.id } })
  if (!node) {
    node = await db.lineageNode.create({
      data: {
        userId: placeholderUser.id,
        slug: "bbl-claimable-profile",
        bio: "Placeholder lineage profile for BBL smoke testing.",
      },
    })
    console.log(`  ✅ Created LineageNode: ${node.id}`)
  } else {
    console.log(`  ⏭️  LineageNode already exists: ${node.id}`)
  }

  // 4. Published, claimable LineageTree with one member
  let tree = await db.lineageTree.findFirst({
    where: { brand: BRAND, name: "BBL Smoke Test Tree" },
  })
  if (!tree) {
    tree = await db.lineageTree.create({
      data: {
        brand: BRAND,
        name: "BBL Smoke Test Tree",
        slug: "bbl-smoke-test-tree",
        isPublished: true,
        isClaimable: true,
      },
    })
    console.log(`  ✅ Created LineageTree: ${tree.id}`)
  } else {
    console.log(`  ⏭️  LineageTree already exists: ${tree.id}`)
  }

  // 5. TreeMember linking node to tree
  let member = await db.lineageTreeMember.findFirst({
    where: { treeId: tree.id, nodeId: node.id },
  })
  if (!member) {
    member = await db.lineageTreeMember.create({
      data: {
        treeId: tree.id,
        nodeId: node.id,
        isClaimable: true,
        visualSortOrder: 1,
      },
    })
    console.log(`  ✅ Created LineageTreeMember: ${member.id}`)
  } else {
    console.log(`  ⏭️  LineageTreeMember already exists: ${member.id}`)
  }

  console.log("[seed-bbl-org] Done.")
  await db.$disconnect()
}

main().catch(async e => {
  console.error(e)
  await db.$disconnect()
  process.exit(1)
})
