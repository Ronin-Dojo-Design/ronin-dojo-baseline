import { z } from "zod"
import {
  updateDirectoryProfileSchema,
  updatePassportAndProfileSchema,
  updatePassportSchema,
} from "~/server/web/passport/schemas"

// ---------------------------------------------------------------------------
// Admin Passport / DirectoryProfile schemas (WL-P2-35, ADR 0045 D3, ADR 0025)
// ---------------------------------------------------------------------------
//
// The admin-mode field schemas = the self-serve `server/web/passport/schemas.ts`
// schemas + the target `passportId`. Kept in a plain module (NOT the `"use server"`
// actions file) because a `"use server"` file may only export async functions — a
// Zod object export there fails `next build` (see the `next-build-catches-use-server`
// memory). The `PassportEditor` imports these directly for the admin-mode resolver.
//
// CONSENT FIELDS ARE OMITTED (SESSION_0705, PR #339 Doug P2): `allowSocialCelebration`
// is the fork-F2 publicity opt-in — consent must come from the MEMBER, so only the
// self-serve owner path may write it. The admin schemas `.omit()` it, so a crafted
// admin submit is schema-stripped before it can reach the admin actions' verbatim
// `db.passport.update` writes ("manufactured consent" is structurally impossible).

/** Admin schema = the self-serve Passport schema (minus consent fields) + the target `passportId`. */
export const updatePassportAsAdminSchema = updatePassportSchema
  .omit({ allowSocialCelebration: true })
  .extend({
    passportId: z.string().min(1),
  })

/** Admin schema = the self-serve DirectoryProfile schema + the target `passportId`. */
export const updateDirectoryProfileAsAdminSchema = updateDirectoryProfileSchema.extend({
  passportId: z.string().min(1),
})

/**
 * Admin schema = the combined Passport + DirectoryProfile schema (WL-P2-45, minus
 * consent fields) + the target `passportId` — the admin-mode twin of the editor's
 * ONE-Save payload.
 */
export const updatePassportAndProfileAsAdminSchema = updatePassportAndProfileSchema
  .omit({ allowSocialCelebration: true })
  .extend({
    passportId: z.string().min(1),
  })
