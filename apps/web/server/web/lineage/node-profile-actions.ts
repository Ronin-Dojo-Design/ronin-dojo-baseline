"use server"

import { Brand } from "~/.generated/prisma/client"
import { userActionClient } from "~/lib/safe-actions"
import { LINEAGE_NODE_PROFILE_ERROR } from "~/server/web/lineage/node-profile-errors"
import {
  findActiveLineageNodeProfileAccess,
  pickTopAwardInDiscipline,
} from "~/server/web/lineage/node-profile-queries"
import {
  type UpdateLineageNodeProfileInput,
  updateLineageNodeProfileSchema,
} from "~/server/web/lineage/node-profile-schemas"
import type { db as appDb } from "~/services/db"

/**
 * Durable-access lineage node profile server action.
 *
 * LineageTreeAccess rows are the editor proof. Approved claims create those
 * grants during admin review.
 *
 * Author: Cody / SESSION_0184 TASK_01.
 */

type AppDb = typeof appDb

export type UpdateLineageNodeProfileResult = {
  treeId: string
  treeSlug: string
  nodeId: string
  memberId: string
}

export const applyLineageNodeProfileUpdate = async ({
  db,
  brand,
  userId,
  input,
}: {
  db: AppDb
  brand: Brand
  userId: string
  input: UpdateLineageNodeProfileInput
}): Promise<UpdateLineageNodeProfileResult> => {
  const tree = await db.lineageTree.findFirst({
    where: {
      id: input.treeId,
      brand,
    },
    select: {
      id: true,
      slug: true,
      // Discipline-scoped surface — the promotion date edits the member's shown rank IN
      // THIS DISCIPLINE (ADR 0035 §3), not the global highest.
      disciplineId: true,
      members: {
        where: { nodeId: input.nodeId },
        take: 1,
        select: {
          id: true,
          node: {
            select: {
              id: true,
              passportId: true,
              passport: {
                select: {
                  // Pre-ordered by Rank.sortOrder desc; discipline filter applied in JS below.
                  rankAwardsEarned: {
                    select: {
                      id: true,
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

  if (!tree) {
    throw new Error(LINEAGE_NODE_PROFILE_ERROR.TREE_NOT_FOUND)
  }

  const member = tree.members[0]
  if (!member) {
    throw new Error(LINEAGE_NODE_PROFILE_ERROR.NODE_NOT_IN_TREE)
  }

  const accessGrant = await findActiveLineageNodeProfileAccess({
    db,
    treeId: tree.id,
    nodeId: input.nodeId,
    memberId: member.id,
    userId,
  })

  if (!accessGrant) {
    throw new Error(LINEAGE_NODE_PROFILE_ERROR.ACCESS_GRANT_REQUIRED)
  }

  await db.$transaction(async tx => {
    // Phase 3c: the node is Passport-rooted; update its Passport identity directly by id.
    await tx.passport.update({
      where: { id: member.node.passportId },
      data: {
        displayName: input.displayName,
        avatarUrl: input.avatarUrl,
      },
    })

    await tx.lineageNode.update({
      where: { id: member.node.id },
      data: { bio: input.bio },
    })

    const shownRankAward = pickTopAwardInDiscipline(
      member.node.passport.rankAwardsEarned,
      tree.disciplineId,
    )
    if (input.promotionDate !== undefined && shownRankAward) {
      await tx.rankAward.update({
        where: { id: shownRankAward.id },
        data: { awardedAt: input.promotionDate },
      })
    }
  })

  return {
    treeId: tree.id,
    treeSlug: tree.slug,
    nodeId: member.node.id,
    memberId: member.id,
  }
}

export const updateLineageNodeProfile = userActionClient
  .inputSchema(updateLineageNodeProfileSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const result = await applyLineageNodeProfileUpdate({
      db,
      brand: Brand.BBL,
      userId: user.id,
      input: parsedInput,
    })

    revalidate({
      paths: [`/lineage/${result.treeSlug}`, `/lineage/${result.treeSlug}/edit/${result.nodeId}`],
    })

    return result
  })
