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

  const approvedClaim = await db.lineageClaimRequest.findFirst({
    where: {
      treeId: tree.id,
      nodeId,
      claimantUserId: userId,
      status: "APPROVED",
    },
    select: { id: true },
  })

  if (!approvedClaim) {
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
