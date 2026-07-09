import { z } from "zod"
import { updateDirectoryProfileSchema, updatePassportSchema } from "~/server/web/passport/schemas"

// ---------------------------------------------------------------------------
// Admin Passport / DirectoryProfile schemas (WL-P2-35, ADR 0045 D3, ADR 0025)
// ---------------------------------------------------------------------------
//
// The admin-mode field schemas = the self-serve `server/web/passport/schemas.ts`
// schemas + the target `passportId`. Kept in a plain module (NOT the `"use server"`
// actions file) because a `"use server"` file may only export async functions — a
// Zod object export there fails `next build` (see the `next-build-catches-use-server`
// memory). The `PassportEditor` imports these directly for the admin-mode resolver.

/** Admin schema = the self-serve Passport schema + the target `passportId`. */
export const updatePassportAsAdminSchema = updatePassportSchema.extend({
  passportId: z.string().min(1),
})

/** Admin schema = the self-serve DirectoryProfile schema + the target `passportId`. */
export const updateDirectoryProfileAsAdminSchema = updateDirectoryProfileSchema.extend({
  passportId: z.string().min(1),
})
