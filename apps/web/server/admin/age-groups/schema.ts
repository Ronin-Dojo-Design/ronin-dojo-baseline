import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import * as z from "zod"
import type { AgeGroup } from "~/.generated/prisma/browser"
import { getSortingStateParser } from "~/lib/parsers"

export const ageGroupsTableParamsSchema = {
  name: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  sort: getSortingStateParser<AgeGroup>().withDefault([{ id: "sortOrder", desc: false }]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}

export const ageGroupsTableParamsCache = createSearchParamsCache(ageGroupsTableParamsSchema)
export type AgeGroupsTableSchema = Awaited<ReturnType<typeof ageGroupsTableParamsCache.parse>>

export const ageGroupSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  ageMin: z.coerce.number().int().min(0, "Minimum age must be 0 or greater"),
  ageMax: z.coerce.number().int().min(0).nullable().optional(),
  sortOrder: z.coerce.number().int().default(0),
})

export type AgeGroupSchema = z.infer<typeof ageGroupSchema>
