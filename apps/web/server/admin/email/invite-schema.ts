import { z } from "zod"

/**
 * SESSION_0515 TASK_06 — input schema for `sendBblClaimInvite`, kept in a sibling
 * (non-"use server") module so the "use server" action file exports only async functions
 * (the `next-build-catches-use-server` gotcha — a non-fn export from a "use server" file
 * fails `next build`). Mirrors the TASK_02 `server/admin/people` schema split.
 *
 * The composer no longer accepts a free-text `claimUrl`: the claim is bound SERVER-SIDE to a
 * chosen lineage node (`nodeId`), then the email links to the durable public sign-in URL that
 * `buildClaimSignInUrl` produces. So the input carries a `nodeId`, not a URL.
 */
export const sendBblClaimInviteSchema = z.object({
  toEmail: z.string().trim().email(),
  firstName: z.string().trim().max(80).optional().or(z.literal("")),
  profileName: z.string().trim().min(1).max(120),
  /** The BBL LineageNode to bind the email→node pending claim to (durable claim primitive). */
  nodeId: z.string().trim().min(1, "Choose the profile to claim"),
  isLifetime: z.boolean().optional(),
})

export type SendBblClaimInviteInput = z.infer<typeof sendBblClaimInviteSchema>
