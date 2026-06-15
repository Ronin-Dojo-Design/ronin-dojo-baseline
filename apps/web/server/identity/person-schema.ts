import { z } from "zod"

/**
 * Identity service input schemas (SOT-ADR D1 — Passport is the person-rooted SoT).
 *
 * `server/identity/` is the ONE door for person creation + account attachment, collapsing the 4
 * hand-rolled shell minters (`lib/auth.ts`, `server/admin/users/actions.ts`,
 * `server/web/lead/actions.ts`, `server/web/lineage/node-profile-actions.ts`). Those call sites are
 * repointed at the service in Phase 3c; this module is the contract they converge on.
 *
 * @added SESSION_0390 (Phase 3a)
 */

/**
 * Input to `createPassport` — an **accountless** identity row (NO synthetic `@placeholder.invalid`
 * email; that hack is killed by D1). At least one name source is required: `displayName` (the
 * user-pickable label) or `legalFirstName` (the legal SoT). `displayName` defaults to
 * `"<legalFirstName> <legalLastName>"` via `derivePersonName` when omitted.
 */
export const createPassportSchema = z
  .object({
    legalFirstName: z.string().trim().min(1).optional(),
    legalLastName: z.string().trim().min(1).optional(),
    displayName: z.string().trim().min(1).optional(),
    dob: z.coerce.date().optional(),
    phoneE164: z.string().trim().min(1).optional(),
    avatarUrl: z.string().url().optional(),
    bio: z.string().trim().min(1).optional(),
    placeOfBirth: z.string().trim().min(1).optional(),
  })
  .refine(input => Boolean(input.displayName ?? input.legalFirstName), {
    message: "A name is required: provide displayName or legalFirstName.",
    path: ["displayName"],
  })

export type CreatePassportInput = z.infer<typeof createPassportSchema>

/**
 * Input to `attachAccount` — bind a Better-Auth account (`User`) to an existing `Passport`. This is
 * the D1 claim primitive: an approved claim sets `Passport.userId = claimant`, lighting up every
 * satellite at once (sign-up also attaches the account to the Passport minted for it).
 */
export const attachAccountSchema = z.object({
  passportId: z.string().min(1),
  userId: z.string().min(1),
})

export type AttachAccountInput = z.infer<typeof attachAccountSchema>
