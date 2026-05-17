"use server"

import type { Brand } from "~/.generated/prisma/client"
import { getRequestBrand } from "~/lib/brand-context"
import { userActionClient } from "~/lib/safe-actions"
import {
  type UpdateLineageNodeProfileInput,
  updateLineageNodeProfileSchema,
} from "~/server/web/lineage/node-profile-schemas"
import { db as appDb } from "~/services/db"

/**
 * Approved-claim lineage node profile server action.
 *
 * Approved LineageClaimRequest rows remain the ownership proof; this action
 * does not grant whole-tree edit rights.
 *
 * Author: Cody / SESSION_0184 TASK_01.
 */

type AppDb = typeof appDb

export const LINEAGE_NODE_PROFILE_ERROR = {
  TREE_NOT_FOUND: "Tree not found or does not belong to this brand.",
  NODE_NOT_IN_TREE: "Node is not a member of this tree.",
  APPROVED_CLAIM_REQUIRED: "Approved claim required to edit this lineage node profile.",
} as const

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
      members: {
        where: { nodeId: input.nodeId },
        take: 1,
        select: {
          id: true,
          rankAwardId: true,
          node: {
            select: {
              id: true,
              userId: true,
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

  const approvedClaim = await db.lineageClaimRequest.findFirst({
    where: {
      treeId: tree.id,
      nodeId: input.nodeId,
      claimantUserId: userId,
      status: "APPROVED",
    },
    select: { id: true },
  })

  if (!approvedClaim) {
    throw new Error(LINEAGE_NODE_PROFILE_ERROR.APPROVED_CLAIM_REQUIRED)
  }

  await db.$transaction(async tx => {
    await tx.passport.upsert({
      where: { userId: member.node.userId },
      update: {
        displayName: input.displayName,
        avatarUrl: input.avatarUrl,
      },
      create: {
        userId: member.node.userId,
        displayName: input.displayName,
        avatarUrl: input.avatarUrl,
      },
    })

    await tx.lineageNode.update({
      where: { id: member.node.id },
      data: { bio: input.bio },
    })

    if (input.promotionDate !== undefined && member.rankAwardId) {
      await tx.rankAward.update({
        where: { id: member.rankAwardId },
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
    const brand = await getRequestBrand()
    const result = await applyLineageNodeProfileUpdate({
      db,
      brand,
      userId: user.id,
      input: parsedInput,
    })

    revalidate({
      paths: [`/lineage/${result.treeSlug}`, `/lineage/${result.treeSlug}/edit/${result.nodeId}`],
    })

    return result
  })
