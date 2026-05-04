import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import * as z from "zod"
import type { Entitlement } from "~/.generated/prisma/browser"
import { getSortingStateParser } from "~/lib/parsers"

export const entitlementsTableParamsSchema = {
  name: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  sort: getSortingStateParser<Entitlement>().withDefault([{ id: "createdAt", desc: true }]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}

export const entitlementsTableParamsCache = createSearchParamsCache(entitlementsTableParamsSchema)
export type EntitlementsTableSchema = Awaited<ReturnType<typeof entitlementsTableParamsCache.parse>>

export const entitlementSchema = z.object({
  id: z.string().optional(),
  key: z.string().min(1, "Key is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
})

export type EntitlementSchema = z.infer<typeof entitlementSchema>
