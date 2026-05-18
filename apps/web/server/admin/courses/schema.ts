import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import * as z from "zod"
import { Brand, CertificationType, type Course } from "~/.generated/prisma/browser"
import { getSortingStateParser } from "~/lib/parsers"

export const coursesTableParamsSchema = {
  title: parseAsString.withDefault(""),
  sort: getSortingStateParser<Course>().withDefault([{ id: "createdAt", desc: true }]),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}

export const coursesTableParamsCache = createSearchParamsCache(coursesTableParamsSchema)
export type CoursesTableSchema = Awaited<ReturnType<typeof coursesTableParamsCache.parse>>

export const courseSchema = z.object({
  id: z.string().optional(),
  brand: z.enum(Brand),
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  certificationType: z.enum(CertificationType),
  isPublished: z.boolean().default(false),
  publishedAt: z.coerce.date().nullish(),
  organizationId: z.string().min(1, "Organization is required"),
  disciplineId: z.string().optional().or(z.literal("")),
  rankId: z.string().optional().or(z.literal("")),
})

export type CourseSchema = z.infer<typeof courseSchema>

export const curriculumItemSchema = z.object({
  id: z.string().optional(),
  courseId: z.string().min(1, "Course is required"),
  order: z.number().int().min(1),
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional(),
  mediaUrl: z.string().optional(),
  mediaType: z.string().optional(),
})

export type CurriculumItemSchema = z.infer<typeof curriculumItemSchema>

export const reorderCurriculumItemsSchema = z.object({
  courseId: z.string(),
  itemIds: z.array(z.string()),
})
