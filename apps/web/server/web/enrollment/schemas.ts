import { z } from "zod"
import { databaseIdSchema } from "~/lib/validation/id"

export const enrollmentProgramUserSchema = z.object({
  programId: databaseIdSchema,
  userId: databaseIdSchema,
})

export const withdrawEnrollmentSchema = z.object({
  enrollmentId: databaseIdSchema,
})

export const promoteFromWaitlistSchema = z.object({
  programId: databaseIdSchema,
})
