import { z } from "zod"
import { databaseIdSchema } from "~/lib/validation/id"

export const enrollInCourseSchema = z.object({
  courseId: databaseIdSchema,
})

export const unenrollFromCourseSchema = z.object({
  enrollmentId: databaseIdSchema,
})

export const markItemCompleteSchema = z.object({
  enrollmentId: databaseIdSchema,
  curriculumItemId: databaseIdSchema,
  notes: z.string().max(1000).optional(),
})

export const markItemIncompleteSchema = z.object({
  completionId: databaseIdSchema,
})
