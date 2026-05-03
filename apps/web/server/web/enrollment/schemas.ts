import { z } from "zod"

export const enrollmentProgramUserSchema = z.object({
  programId: z.string().cuid(),
  userId: z.string().cuid(),
})

export const withdrawEnrollmentSchema = z.object({
  enrollmentId: z.string().cuid(),
})

export const promoteFromWaitlistSchema = z.object({
  programId: z.string().cuid(),
})
