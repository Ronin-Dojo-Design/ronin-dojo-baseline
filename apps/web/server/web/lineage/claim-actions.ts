"use server"

import { Brand } from "~/.generated/prisma/client"
import { userActionClient } from "~/lib/safe-actions"
import { submitLineageClaimSchema } from "~/server/web/lineage/claim-schemas"

/**
 * Lineage claim server actions.
 *
 * Author: Cody / SESSION_0182 TASK_01.
 */

const LINEAGE_CLAIM_ERROR = {
  TREE_NOT_FOUND: "Tree not found or not published.",
  TREE_NOT_CLAIMABLE: "This lineage tree is not currently accepting profile claims.",
  NODE_NOT_IN_TREE: "Node is not a member of this tree.",
  NODE_NOT_CLAIMABLE: "This lineage profile is not currently accepting claims.",
  NODE_ALREADY_CLAIMED: "This lineage profile has already been claimed by an account.",
  DUPLICATE_CLAIM: "You already have a pending or approved claim on this node.",
} as const

export const submitLineageClaimRequest = userActionClient
  .inputSchema(submitLineageClaimSchema)
  .action(async ({ parsedInput, ctx: { user, db } }) => {
    // 1. Validate the tree exists, is published, and belongs to the brand.
    const tree = await db.lineageTree.findFirst({
      where: {
        id: parsedInput.treeId,
        brand: Brand.BBL,
        isPublished: true,
      },
      select: { id: true, isClaimable: true },
    })

    if (!tree) {
      throw new Error(LINEAGE_CLAIM_ERROR.TREE_NOT_FOUND)
    }

    if (!tree.isClaimable) {
      throw new Error(LINEAGE_CLAIM_ERROR.TREE_NOT_CLAIMABLE)
    }

    // 2. Validate the node belongs to the tree via LineageTreeMember.
    const member = await db.lineageTreeMember.findFirst({
      where: {
        treeId: tree.id,
        nodeId: parsedInput.nodeId,
      },
      select: { id: true, isClaimable: true },
    })

    if (!member) {
      throw new Error(LINEAGE_CLAIM_ERROR.NODE_NOT_IN_TREE)
    }

    if (!member.isClaimable) {
      throw new Error(LINEAGE_CLAIM_ERROR.NODE_NOT_CLAIMABLE)
    }

    // 2b. Already-claimed guard (SESSION_0436): a node whose Passport already has an
    // attached account has been claimed (e.g. auto-claimed via the email/magic-link
    // reconcile in `claim-node-for-user`). `member.isClaimable` is a per-membership flag
    // that the reconcile path does NOT flip, so without this check a tree-claim could be
    // filed against an already-owned node and dead-end at admin review with
    // NODE_ALREADY_APPROVED. Mirrors the generic profile-claim PERSON_NOT_CLAIMABLE guard.
    const node = await db.lineageNode.findUnique({
      where: { id: parsedInput.nodeId },
      select: { passport: { select: { userId: true } } },
    })

    if (node?.passport?.userId != null) {
      throw new Error(LINEAGE_CLAIM_ERROR.NODE_ALREADY_CLAIMED)
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

    // 4. Create the claim request with optional evidence + optional claimed rank.
    const claim = await db.lineageClaimRequest.create({
      data: {
        treeId: tree.id,
        nodeId: parsedInput.nodeId,
        claimantUserId: user.id,
        claimantNote: parsedInput.claimantNote ?? null,
        // FI-006: store the rank the claimant asserts (stays PENDING until admin-verify
        // creates the awarded RankAward). SetNull FK — safe if the Rank is ever deleted.
        claimedRankId: parsedInput.claimedRankId ?? null,
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
