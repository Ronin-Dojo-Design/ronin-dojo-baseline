import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import * as z from "zod"
import type { SkillLevel } from "~/.generated/prisma/browser"
import { getSortingStateParser } from "~/lib/parsers"

export const skillLevelsTableParamsSchema = {
  name: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  sort: getSortingStateParser<SkillLevel>().withDefault([{ id: "sortOrder", desc: false }]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}

export const skillLevelsTableParamsCache = createSearchParamsCache(skillLevelsTableParamsSchema)
export type SkillLevelsTableSchema = Awaited<ReturnType<typeof skillLevelsTableParamsCache.parse>>

export const skillLevelSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
})

export type SkillLevelSchema = z.infer<typeof skillLevelSchema>
