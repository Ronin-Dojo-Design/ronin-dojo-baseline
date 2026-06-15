import { z } from "zod"
import { databaseIdSchema } from "~/lib/validation/id"

export const signWaiverSchema = z.object({
  organizationId: databaseIdSchema,
  waiverId: databaseIdSchema,
  programId: databaseIdSchema.optional(),
  signedOnBehalfId: databaseIdSchema.optional(),
})

export const revokeWaiverSignatureSchema = z.object({
  organizationId: databaseIdSchema,
  signatureId: databaseIdSchema,
})
