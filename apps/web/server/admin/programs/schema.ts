import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import * as z from "zod"
import { Brand, type Program, ProgramStatus } from "~/.generated/prisma/browser"
import { getSortingStateParser } from "~/lib/parsers"

export const programsTableParamsSchema = {
  name: parseAsString.withDefault(""),
  status: parseAsString.withDefault(""),
  sort: getSortingStateParser<Program>().withDefault([{ id: "createdAt", desc: true }]),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}

export const programsTableParamsCache = createSearchParamsCache(programsTableParamsSchema)
export type ProgramsTableSchema = Awaited<ReturnType<typeof programsTableParamsCache.parse>>

export const programSchema = z.object({
  id: z.string().optional(),
  brand: z.enum(Brand),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(ProgramStatus).default("DRAFT"),
  ageMin: z.number().int().nullish(),
  ageMax: z.number().int().nullish(),
  enforceAgeCap: z.boolean().default(false),
  maxEnrollment: z.number().int().nullish(),
  minEnrollment: z.number().int().nullish(),
  sortOrder: z.number().int().default(0),
  imageUrl: z.string().optional(),
  organizationId: z.string().min(1, "Organization is required"),
  disciplineId: z.string().optional().or(z.literal("")),
  ageGroupIds: z.array(z.string()).optional(),
  skillLevelIds: z.array(z.string()).optional(),
})

export type ProgramSchema = z.infer<typeof programSchema>

export const programCourseSchema = z.object({
  programId: z.string().min(1),
  courseId: z.string().min(1),
})

export const programCourseRemoveSchema = z.object({
  programId: z.string().min(1),
  courseIds: z.array(z.string().min(1)).min(1),
})

export const programWaiverSchema = z.object({
  programId: z.string().min(1),
  waiverId: z.string().min(1),
  required: z.boolean().default(true),
})

export const programWaiverRemoveSchema = z.object({
  programId: z.string().min(1),
  waiverIds: z.array(z.string().min(1)).min(1),
})
