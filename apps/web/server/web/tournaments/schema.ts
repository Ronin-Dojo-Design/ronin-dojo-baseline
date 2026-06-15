import { z } from "zod"
import { databaseIdSchema } from "~/lib/validation/id"

/**
 * Input schema for tournament registration checkout.
 * User picks one or more divisions from a single tournament.
 */
export const registrationCheckoutSchema = z.object({
  tournamentId: databaseIdSchema,
  divisionIds: z.array(databaseIdSchema).min(1, "Select at least one division"),
  /** The TournamentRole code the user is registering under (e.g. "COMPETITOR") */
  roleCode: z.string().min(1),
  /** Optional: membership they're representing */
  representingMembershipId: databaseIdSchema.optional(),
})

export type RegistrationCheckoutInput = z.infer<typeof registrationCheckoutSchema>

/**
 * Input schema for cancelling a tournament registration.
 */
export const registrationCancelSchema = z.object({
  registrationId: databaseIdSchema,
})

export type RegistrationCancelInput = z.infer<typeof registrationCancelSchema>
