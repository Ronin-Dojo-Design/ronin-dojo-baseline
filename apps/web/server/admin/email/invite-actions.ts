"use server"

import { Brand } from "~/.generated/prisma/client"
import { EmailBblClaimYourProfile } from "~/emails/bbl-claim-your-profile"
import { getBrandOrigin } from "~/lib/brand-origin"
import { sendEmail } from "~/lib/email"
import { adminActionClient } from "~/lib/safe-actions"
import { db } from "~/services/db"
import { bindPendingClaim, buildClaimSignInUrl } from "~/server/web/lineage/mint-claim-magic-link"
import { sendBblClaimInviteSchema } from "./invite-schema"

/**
 * SESSION_0515 TASK_06 — the BBL admin invite composer now binds the claim SERVER-SIDE and
 * sends the durable, scanner-safe `/auth/login` link (PR #197 / the email-links-durable pattern),
 * mirroring `scripts/send-bbl-truelson-thankyou.ts` `send()`. The prior version emailed a free-text
 * `claimUrl` and never bound anything, so the recipient's email was NOT tied to a node — they had
 * to hunt for and manually claim their profile.
 *
 * Flow (canonical durable claim, same as the Truelson script):
 *   1. resolve the chosen node's claimable BBL membership (published + claimable tree),
 *   2. already-claimed / not-claimable guard — abort with a toastable error, NEVER silently
 *      double-bind (identity-critical: re-binding an owned node = the wrong person claims),
 *   3. `bindPendingClaim(toEmail, nodeId)` — persist the email→node pending claim (90-day TTL);
 *      `lib/auth.ts` reconciliation auto-claims it on the recipient's NEXT sign-in,
 *   4. `buildClaimSignInUrl(<BBL origin>)` — the durable public sign-in URL (no one-shot token),
 *   5. send `EmailBblClaimYourProfile` with that URL.
 */
export const sendBblClaimInvite = adminActionClient
  .inputSchema(sendBblClaimInviteSchema)
  .action(async ({ parsedInput }) => {
    const toEmail = parsedInput.toEmail.trim()

    // Resolve the node's claimable BBL membership. Mirrors the Truelson `resolveNode` guard: the
    // node's passport must be UNOWNED (`passport.userId: null`) on a PUBLISHED + claimable BBL
    // tree. A missing membership here means the node is already claimed, not BBL, or not claimable.
    const claimable = await db.lineageTreeMember.findFirst({
      where: {
        nodeId: parsedInput.nodeId,
        isClaimable: true,
        node: { passport: { userId: null } },
        tree: { brand: Brand.BBL, isPublished: true, isClaimable: true },
      },
      select: { id: true },
    })

    if (!claimable) {
      // Distinguish "already claimed" from "not a claimable BBL node" for a clearer toast.
      const node = await db.lineageNode.findUnique({
        where: { id: parsedInput.nodeId },
        select: { passport: { select: { userId: true } } },
      })
      if (!node) {
        throw new Error("That profile no longer exists. Refresh and pick another.")
      }
      if (node.passport.userId) {
        throw new Error(
          "That profile has already been claimed — no invite sent (we won't re-bind a claimed profile).",
        )
      }
      throw new Error(
        "That profile isn't a claimable Black Belt Legacy node (needs a published, claimable BBL tree).",
      )
    }

    // Bind the email→node durably, then link the email to the public sign-in URL — the binding is
    // SERVER-SIDE, not in the URL, so a mail scanner or late click can't consume it.
    // The pre-guard above and this bind are not atomic: if the node gets claimed in that window,
    // `bindPendingClaim` no-ops and returns false. Abort BEFORE sending so the recipient never gets
    // a claim email that can never reconcile (Doug LOW-1) — same toastable style as the guard.
    const bound = await bindPendingClaim(toEmail, parsedInput.nodeId)
    if (!bound) {
      throw new Error(
        "That profile has already been claimed — no invite sent (we won't re-bind a claimed profile).",
      )
    }
    const claimUrl = buildClaimSignInUrl(await getBrandOrigin())

    const result = await sendEmail({
      brand: Brand.BBL,
      to: toEmail,
      subject: "Claim your Black Belt Legacy profile",
      react: EmailBblClaimYourProfile({
        to: toEmail,
        firstName: parsedInput.firstName || null,
        profileName: parsedInput.profileName,
        claimUrl,
        compTier: "ELITE",
        isLifetime: parsedInput.isLifetime ?? false,
      }),
    })

    if (result?.error) {
      throw new Error(result.error.message)
    }

    return {
      id: result?.data?.id ?? "local-resend-disabled",
      to: toEmail,
    }
  })
