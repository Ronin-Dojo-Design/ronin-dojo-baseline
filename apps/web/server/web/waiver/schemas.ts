import { z } from "zod"

export const signWaiverSchema = z.object({
  organizationId: z.string().cuid(),
  waiverId: z.string().cuid(),
  programId: z.string().cuid().optional(),
  signedOnBehalfOfId: z.string().cuid().optional(),
})

export const revokeWaiverSignatureSchema = z.object({
  organizationId: z.string().cuid(),
  signatureId: z.string().cuid(),
})
