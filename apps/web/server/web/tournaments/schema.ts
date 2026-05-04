"use server"

import { z } from "zod"

/**
 * Input schema for tournament registration checkout.
 * User picks one or more divisions from a single tournament.
 */
export const registrationCheckoutSchema = z.object({
  tournamentId: z.string().cuid(),
  divisionIds: z.array(z.string().cuid()).min(1, "Select at least one division"),
  /** The TournamentRole code the user is registering under (e.g. "COMPETITOR") */
  roleCode: z.string().min(1),
  /** Optional: membership they're representing */
  representingMembershipId: z.string().cuid().optional(),
})

export type RegistrationCheckoutInput = z.infer<typeof registrationCheckoutSchema>

/**
 * Input schema for cancelling a tournament registration.
 */
export const registrationCancelSchema = z.object({
  registrationId: z.string().cuid(),
})

export type RegistrationCancelInput = z.infer<typeof registrationCancelSchema>
