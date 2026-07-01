import type { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"

/**
 * Claimant-scoped lineage node profile reads.
 *
 * Author: Cody / SESSION_0184 TASK_01.
 */

export type EditableLineageNodeProfile = {
  tree: {
    id: string
    name: string
    slug: string
  }
  node: {
    id: string
    bio: string | null
    passport: {
      displayName: string | null
      avatarUrl: string | null
    }
  }
  member: {
    id: string
    /** The member's shown (highest awarded) rank award — awarded truth, ADR 0035. */
    currentRankAward: {
      id: string
      awardedAt: Date | null
    } | null
  }
}

type LineageNodeProfileAccessDb = Pick<typeof db, "lineageTreeAccess">

export const findActiveLineageNodeProfileAccess = async ({
  db: dbClient = db,
  treeId,
  nodeId,
  memberId,
  userId,
}: {
  db?: LineageNodeProfileAccessDb
  treeId: string
  nodeId: string
  memberId: string
  userId: string
}) => {
  return dbClient.lineageTreeAccess.findFirst({
    where: {
      treeId,
      userId,
      revokedAt: null,
      OR: [
        { role: { in: ["TREE_ADMIN", "TREE_EDITOR"] } },
        {
          role: "NODE_EDITOR",
          OR: [{ nodeId }, { memberId }],
        },
      ],
    },
    select: { id: true, role: true },
  })
}

export const getEditableLineageNodeProfile = async ({
  brand,
  treeSlug,
  nodeId,
  userId,
}: {
  brand: Brand
  treeSlug: string
  nodeId: string
  userId: string
}): Promise<EditableLineageNodeProfile | null> => {
  const tree = await db.lineageTree.findUnique({
    where: { brand_slug: { brand, slug: treeSlug } },
    select: {
      id: true,
      name: true,
      slug: true,
      // This tree is a discipline-scoped surface — the editable "promotion date" is the
      // awardedAt of the member's shown rank IN THIS DISCIPLINE (ADR 0035 §3), not the
      // global highest across rank systems.
      disciplineId: true,
      members: {
        where: { nodeId },
        take: 1,
        select: {
          id: true,
          node: {
            select: {
              id: true,
              bio: true,
              passport: {
                select: {
                  displayName: true,
                  avatarUrl: true,
                  // Pre-ordered by Rank.sortOrder desc; the discipline filter happens in JS
                  // (Prisma can't reference the sibling `tree.disciplineId` in a nested where).
                  rankAwardsEarned: {
                    select: {
                      id: true,
                      awardedAt: true,
                      rank: { select: { rankSystem: { select: { disciplineId: true } } } },
                    },
                    orderBy: [{ rank: { sortOrder: "desc" } }, { awardedAt: "desc" }],
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  const member = tree?.members[0]
  if (!tree || !member) {
    return null
  }

  const awards = member.node.passport.rankAwardsEarned
  const currentRankAward = tree.disciplineId
    ? (awards.find(award => award.rank.rankSystem?.disciplineId === tree.disciplineId) ?? null)
    : (awards[0] ?? null)

  const accessGrant = await findActiveLineageNodeProfileAccess({
    treeId: tree.id,
    nodeId,
    memberId: member.id,
    userId,
  })

  if (!accessGrant) {
    return null
  }

  return {
    tree: {
      id: tree.id,
      name: tree.name,
      slug: tree.slug,
    },
    node: {
      id: member.node.id,
      bio: member.node.bio,
      passport: {
        displayName: member.node.passport.displayName,
        avatarUrl: member.node.passport.avatarUrl,
      },
    },
    member: {
      id: member.id,
      currentRankAward: currentRankAward
        ? { id: currentRankAward.id, awardedAt: currentRankAward.awardedAt }
        : null,
    },
  }
}
