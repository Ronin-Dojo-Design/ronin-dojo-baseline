import { z } from "zod"

export const enrollInCourseSchema = z.object({
  courseId: z.string().cuid(),
})

export const unenrollFromCourseSchema = z.object({
  enrollmentId: z.string().cuid(),
})

export const markItemCompleteSchema = z.object({
  enrollmentId: z.string().cuid(),
  curriculumItemId: z.string().cuid(),
  notes: z.string().max(1000).optional(),
})

export const markItemIncompleteSchema = z.object({
  completionId: z.string().cuid(),
})
