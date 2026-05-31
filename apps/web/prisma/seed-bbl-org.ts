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
 *   5. A BBL-scoped Rigan Machado BJJ Lineage tree cloned from the
 *      Baseline public Rigan tree projection when that seed is present.
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
const BASELINE_BRAND = "BASELINE_MARTIAL_ARTS" as const
const RIGAN_TREE_SLUG = "rigan-machado-bjj-lineage"

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

  // 6. BBL-scoped public Rigan Machado BJJ tree.
  //
  // LineageNode and RankAward are global facts; LineageTree is the
  // brand-scoped presentation projection. BBL gets its own tree row and member
  // projection so runtime reads can stay strict on { brand, slug }.
  const sourceTree = await db.lineageTree.findUnique({
    where: { brand_slug: { brand: BASELINE_BRAND, slug: RIGAN_TREE_SLUG } },
    select: {
      name: true,
      description: true,
      visibility: true,
      isPublished: true,
      isClaimable: true,
      disciplineId: true,
      defaultRootMemberId: true,
      members: {
        orderBy: { visualSortOrder: "asc" },
        select: {
          id: true,
          nodeId: true,
          visualSortOrder: true,
          showPromotionDatePublic: true,
          showRankPublic: true,
          isClaimable: true,
          isCollapsedDefault: true,
          rankAwardId: true,
          primaryVisualParentMemberId: true,
        },
      },
    },
  })

  if (!sourceTree) {
    console.log(
      `  ⚠️  Baseline ${RIGAN_TREE_SLUG} not found; run seed-baseline-lineage.ts before cloning the BBL Rigan tree.`,
    )
  } else {
    let bblRiganTree = await db.lineageTree.findUnique({
      where: { brand_slug: { brand: BRAND, slug: RIGAN_TREE_SLUG } },
      select: { id: true, defaultRootMemberId: true },
    })

    if (!bblRiganTree) {
      bblRiganTree = await db.lineageTree.create({
        data: {
          brand: BRAND,
          slug: RIGAN_TREE_SLUG,
          name: sourceTree.name,
          description: sourceTree.description,
          visibility: sourceTree.visibility,
          isPublished: sourceTree.isPublished,
          isClaimable: sourceTree.isClaimable,
          disciplineId: sourceTree.disciplineId,
          organizationId: org.id,
        },
        select: { id: true, defaultRootMemberId: true },
      })
      console.log(`  ✅ Created BBL Rigan Machado tree: ${bblRiganTree.id}`)
    } else {
      bblRiganTree = await db.lineageTree.update({
        where: { id: bblRiganTree.id },
        data: {
          name: sourceTree.name,
          description: sourceTree.description,
          visibility: sourceTree.visibility,
          isPublished: sourceTree.isPublished,
          isClaimable: sourceTree.isClaimable,
          disciplineId: sourceTree.disciplineId,
          organizationId: org.id,
        },
        select: { id: true, defaultRootMemberId: true },
      })
      console.log(`  ⏭️  BBL Rigan Machado tree already exists: ${bblRiganTree.id}`)
    }

    const targetMemberIdBySourceMemberId = new Map<string, string>()

    for (const sourceMember of sourceTree.members) {
      let targetMember = await db.lineageTreeMember.findUnique({
        where: { treeId_nodeId: { treeId: bblRiganTree.id, nodeId: sourceMember.nodeId } },
        select: { id: true },
      })

      const memberData = {
        visualSortOrder: sourceMember.visualSortOrder,
        showPromotionDatePublic: sourceMember.showPromotionDatePublic,
        showRankPublic: sourceMember.showRankPublic,
        isClaimable: sourceMember.isClaimable,
        isCollapsedDefault: sourceMember.isCollapsedDefault,
        rankAwardId: sourceMember.rankAwardId,
      }

      if (!targetMember) {
        targetMember = await db.lineageTreeMember.create({
          data: {
            treeId: bblRiganTree.id,
            nodeId: sourceMember.nodeId,
            ...memberData,
          },
          select: { id: true },
        })
      } else {
        targetMember = await db.lineageTreeMember.update({
          where: { id: targetMember.id },
          data: memberData,
          select: { id: true },
        })
      }

      targetMemberIdBySourceMemberId.set(sourceMember.id, targetMember.id)
    }

    for (const sourceMember of sourceTree.members) {
      const targetMemberId = targetMemberIdBySourceMemberId.get(sourceMember.id)
      if (!targetMemberId) {
        continue
      }

      await db.lineageTreeMember.update({
        where: { id: targetMemberId },
        data: {
          primaryVisualParentMemberId: sourceMember.primaryVisualParentMemberId
            ? (targetMemberIdBySourceMemberId.get(sourceMember.primaryVisualParentMemberId) ?? null)
            : null,
        },
      })
    }

    const defaultRootMemberId = sourceTree.defaultRootMemberId
      ? (targetMemberIdBySourceMemberId.get(sourceTree.defaultRootMemberId) ?? null)
      : (targetMemberIdBySourceMemberId.get(sourceTree.members[0]?.id ?? "") ?? null)

    if (defaultRootMemberId !== bblRiganTree.defaultRootMemberId) {
      await db.lineageTree.update({
        where: { id: bblRiganTree.id },
        data: { defaultRootMemberId },
      })
    }

    console.log(
      `  ✅ Synced BBL ${RIGAN_TREE_SLUG}: ${sourceTree.members.length} members from Baseline projection.`,
    )
  }

  console.log("[seed-bbl-org] Done.")
  await db.$disconnect()
}

main().catch(async e => {
  console.error(e)
  await db.$disconnect()
  process.exit(1)
})
