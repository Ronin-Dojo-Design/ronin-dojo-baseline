"use server"

import { Brand } from "~/.generated/prisma/client"
import { userActionClient } from "~/lib/safe-actions"
import { submitPassportClaim } from "~/server/web/claims/submit-passport-claim"
import { submitLineageClaimSchema } from "~/server/web/lineage/claim-schemas"

/**
 * Lineage claim server action — a thin DOOR ADAPTER over the unified
 * `submitPassportClaim` core (ADR 0036, SESSION_0437 P1).
 *
 * This door keeps its tree/node/membership validation (the lineage-specific
 * preconditions), then resolves the node's `passportId` and delegates to the
 * core, passing node+tree context. The claimable guard (was the SESSION_0436
 * interim already-claimed guard) and the duplicate guard now live in the core,
 * keyed on identity — so they are deleted here.
 *
 * Author: Cody / SESSION_0182 TASK_01; adapted SESSION_0437 (ADR 0036).
 */

const LINEAGE_CLAIM_ERROR = {
  TREE_NOT_FOUND: "Tree not found or not published.",
  TREE_NOT_CLAIMABLE: "This lineage tree is not currently accepting profile claims.",
  NODE_NOT_IN_TREE: "Node is not a member of this tree.",
  NODE_NOT_CLAIMABLE: "This lineage profile is not currently accepting claims.",
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

    // 2. Validate the node belongs to the tree via LineageTreeMember + resolve the
    // node's Passport (the identity the unified claim keys on).
    const member = await db.lineageTreeMember.findFirst({
      where: {
        treeId: tree.id,
        nodeId: parsedInput.nodeId,
      },
      select: { id: true, isClaimable: true, node: { select: { passportId: true } } },
    })

    if (!member) {
      throw new Error(LINEAGE_CLAIM_ERROR.NODE_NOT_IN_TREE)
    }

    if (!member.isClaimable) {
      throw new Error(LINEAGE_CLAIM_ERROR.NODE_NOT_CLAIMABLE)
    }

    // 3. Delegate to the unified core. The claimable guard (already-claimed Passport)
    // and the duplicate guard live there now, keyed on identity not door.
    return submitPassportClaim(db, {
      passportId: member.node.passportId,
      claimantUserId: user.id,
      brand: Brand.BBL,
      claimantNote: parsedInput.claimantNote ?? null,
      // FI-006: rank asserted by the claimant (stays PENDING until admin-verify mints
      // the awarded RankAward; ADR 0035 §4).
      claimedRankId: parsedInput.claimedRankId ?? null,
      nodeId: parsedInput.nodeId,
      treeId: tree.id,
      evidence: parsedInput.evidence,
    })
  })
