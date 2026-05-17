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
    user: {
      passport: {
        displayName: string | null
        avatarUrl: string | null
      } | null
    }
  }
  member: {
    id: string
    selectedRankAward: {
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
      members: {
        where: { nodeId },
        take: 1,
        select: {
          id: true,
          selectedRankAward: {
            select: {
              id: true,
              awardedAt: true,
            },
          },
          node: {
            select: {
              id: true,
              bio: true,
              user: {
                select: {
                  passport: {
                    select: {
                      displayName: true,
                      avatarUrl: true,
                    },
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
    node: member.node,
    member: {
      id: member.id,
      selectedRankAward: member.selectedRankAward,
    },
  }
}
