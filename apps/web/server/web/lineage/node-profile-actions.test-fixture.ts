/**
 * @added   SESSION_0731 (2026-07-31)
 * @why     Share the canonical award-plus-entry lineage editor fixture across helper and wrapper tests
 * @wired   server/web/lineage/node-profile-actions.test.ts, server/web/lineage/node-profile-actions.safe-action.test.ts
 */
import type { Brand } from "~/.generated/prisma/client"
import { syncRankEntryFromAward } from "~/server/belt/rank-entry-compatibility"
import { db } from "~/services/db"

export async function seedNodeProfileActionCoreFixture({
  brand,
  tag,
}: {
  brand: Brand
  tag: (name: string) => string
}) {
  const approvedClaimant = await db.user.create({
    data: {
      id: tag("approved-claimant"),
      name: tag("Approved Claimant"),
      email: `${tag("approved-claimant")}@test.local`,
    },
  })

  await db.passport.create({
    data: {
      userId: approvedClaimant.id,
      displayName: "Original Display Name",
      avatarUrl: "https://example.com/original-avatar.jpg",
    },
  })

  const discipline = await db.discipline.create({
    data: {
      id: tag("discipline"),
      brand,
      name: tag("Discipline"),
      slug: tag("discipline"),
      code: tag("DISC").slice(0, 16),
    },
  })

  const rankSystem = await db.rankSystem.create({
    data: {
      id: tag("rank-system"),
      brand,
      name: tag("Rank System"),
      disciplineId: discipline.id,
    },
  })

  const rank = await db.rank.create({
    data: {
      id: tag("rank"),
      brand,
      rankSystemId: rankSystem.id,
      sortOrder: 1,
      name: tag("Black Belt"),
      shortName: "BB",
    },
  })

  const rankAward = await db.rankAward.create({
    data: {
      id: tag("rank-award"),
      passport: {
        connectOrCreate: {
          where: { userId: approvedClaimant.id },
          create: { userId: approvedClaimant.id },
        },
      },
      rank: { connect: { id: rank.id } },
      awardedAt: new Date(Date.UTC(2020, 0, 1)),
    },
  })
  await syncRankEntryFromAward(db, rankAward.id)

  const node = await db.lineageNode.create({
    data: {
      id: tag("node"),
      passport: {
        connectOrCreate: {
          where: { userId: approvedClaimant.id },
          create: { userId: approvedClaimant.id },
        },
      },
      slug: tag("node-slug"),
      bio: "Original lineage bio",
      visibility: "PUBLIC",
      verificationStatus: "PENDING",
    },
  })

  const treeId = tag("tree")
  const [tree, member] = await db.$transaction([
    db.lineageTree.create({
      data: {
        id: treeId,
        brand,
        slug: tag("tree-slug"),
        name: tag("Test Lineage Tree"),
        visibility: "PUBLIC",
        isPublished: true,
        scopeType: "DISCIPLINE",
      },
    }),
    db.lineageTreeMember.create({
      data: {
        id: tag("member"),
        treeId,
        nodeId: node.id,
        visualSortOrder: 0,
      },
    }),
  ])

  await db.lineageTreeAccess.create({
    data: {
      id: tag("node-editor-grant"),
      treeId: tree.id,
      userId: approvedClaimant.id,
      role: "NODE_EDITOR",
      nodeId: node.id,
      memberId: member.id,
    },
  })

  return { approvedClaimant, discipline, rankSystem, rank, rankAward, node, tree, member }
}
