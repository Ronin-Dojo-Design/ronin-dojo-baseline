"use server"

import { z } from "zod"
import { getRequestBrand } from "~/lib/brand-context"
import { userActionClient } from "~/lib/safe-actions"
import { databaseIdSchema } from "~/lib/validation/id"
import { scheduleClaimApprovedEmail } from "./claim-approved-email"
import { claimNodeForUser, type ClaimNodeResult } from "./claim-node-for-user"

/**
 * BBL one-click token-bound claim accept (SESSION_0412 FIX #3; core extracted SESSION_0419).
 *
 * This is the landing action of the emailed magic-link's `callbackURL`. Better Auth's
 * `/api/auth/magic-link/verify` verifies the token, sets the session cookie, then redirects
 * (via the preview hop) to `/lineage/claim/accept?node=…`, whose route calls this action.
 *
 * Guard (a) — a signed-in session — is enforced here by `userActionClient`. The actual claim
 * (guards b–d, auto-approve, finalize side-effects, audit, idempotency) lives in the shared
 * `claimNodeForUser` core so the social-sign-in reconciler runs the IDENTICAL logic.
 */

const acceptLineageClaimSchema = z.object({
  nodeId: databaseIdSchema,
})

export const acceptLineageClaimByToken = userActionClient
  .inputSchema(acceptLineageClaimSchema)
  .action(async ({ parsedInput, ctx: { user, db } }): Promise<ClaimNodeResult> => {
    const brand = await getRequestBrand()

    const result = await db.$transaction(
      (tx: unknown): Promise<ClaimNodeResult> =>
        claimNodeForUser(tx, { userId: user.id, nodeId: parsedInput.nodeId, brand }),
      { isolationLevel: "Serializable", maxWait: 30000, timeout: 30000 },
    )

    // A fresh claim just committed — fire the lifecycle "profile-claim-approved" email.
    if (result.outcome === "claimed") {
      scheduleClaimApprovedEmail({ userId: user.id, brand, nodeId: result.nodeId })
    }

    return result
  })
