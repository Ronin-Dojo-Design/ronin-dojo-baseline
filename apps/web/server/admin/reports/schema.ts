import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import { z } from "zod"
import type { Report } from "~/.generated/prisma/browser"
import { getSortingStateParser } from "~/lib/parsers"

export const reportsTableParamsSchema = {
  message: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(50),
  sort: getSortingStateParser<Report>().withDefault([{ id: "createdAt", desc: true }]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
  type: parseAsArrayOf(parseAsString).withDefault([]),
}

export const reportsTableParamsCache = createSearchParamsCache(reportsTableParamsSchema)
export type ReportsTableSchema = Awaited<ReturnType<typeof reportsTableParamsCache.parse>>

export const reportSchema = z.object({
  id: z.string().optional(),
  email: z.email().optional(),
  type: z.string(),
  message: z.string().optional(),
  toolId: z.string().optional(),
})

export type ReportSchema = z.infer<typeof reportSchema>
