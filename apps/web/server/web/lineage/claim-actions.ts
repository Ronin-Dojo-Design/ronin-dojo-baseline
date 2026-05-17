"use server"

import { getRequestBrand } from "~/lib/brand-context"
import { userActionClient } from "~/lib/safe-actions"
import { submitLineageClaimSchema } from "~/server/web/lineage/claim-schemas"

/**
 * Lineage claim server actions.
 *
 * Author: Cody / SESSION_0182 TASK_01.
 */

export const LINEAGE_CLAIM_ERROR = {
  TREE_NOT_FOUND: "Tree not found or not published.",
  NODE_NOT_IN_TREE: "Node is not a member of this tree.",
  DUPLICATE_CLAIM: "You already have a pending or approved claim on this node.",
} as const

export const submitLineageClaimRequest = userActionClient
  .inputSchema(submitLineageClaimSchema)
  .action(async ({ parsedInput, ctx: { user, db } }) => {
    const brand = await getRequestBrand()

    // 1. Validate the tree exists, is published, and belongs to the brand.
    const tree = await db.lineageTree.findFirst({
      where: {
        id: parsedInput.treeId,
        brand,
        isPublished: true,
      },
      select: { id: true },
    })

    if (!tree) {
      throw new Error(LINEAGE_CLAIM_ERROR.TREE_NOT_FOUND)
    }

    // 2. Validate the node belongs to the tree via LineageTreeMember.
    const member = await db.lineageTreeMember.findFirst({
      where: {
        treeId: tree.id,
        nodeId: parsedInput.nodeId,
      },
      select: { id: true },
    })

    if (!member) {
      throw new Error(LINEAGE_CLAIM_ERROR.NODE_NOT_IN_TREE)
    }

    // 3. Duplicate guard: PENDING or APPROVED claim by same user on same node+tree.
    const existingClaim = await db.lineageClaimRequest.findFirst({
      where: {
        treeId: tree.id,
        nodeId: parsedInput.nodeId,
        claimantUserId: user.id,
        status: { in: ["PENDING", "APPROVED"] },
      },
      select: { id: true },
    })

    if (existingClaim) {
      throw new Error(LINEAGE_CLAIM_ERROR.DUPLICATE_CLAIM)
    }

    // 4. Create the claim request with optional evidence.
    const claim = await db.lineageClaimRequest.create({
      data: {
        treeId: tree.id,
        nodeId: parsedInput.nodeId,
        claimantUserId: user.id,
        claimantNote: parsedInput.claimantNote ?? null,
        ...(parsedInput.evidence?.length
          ? {
              evidence: {
                create: parsedInput.evidence.map(item => ({
                  label: item.label ?? null,
                  url: item.url ?? null,
                  text: item.text ?? null,
                })),
              },
            }
          : {}),
      },
      select: { id: true },
    })

    return { claimId: claim.id }
  })
