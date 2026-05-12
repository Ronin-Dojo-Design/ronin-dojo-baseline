import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import * as z from "zod"
import type { Role } from "~/.generated/prisma/browser"
import { getSortingStateParser } from "~/lib/parsers"

export const rolesTableParamsSchema = {
  name: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  sort: getSortingStateParser<Role>().withDefault([{ id: "createdAt", desc: true }]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}

export const rolesTableParamsCache = createSearchParamsCache(rolesTableParamsSchema)
export type RolesTableSchema = Awaited<ReturnType<typeof rolesTableParamsCache.parse>>

export const roleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().nullable().optional(),
  displayTitle: z.string().nullable().optional(),
})

export type RoleSchema = z.infer<typeof roleSchema>
