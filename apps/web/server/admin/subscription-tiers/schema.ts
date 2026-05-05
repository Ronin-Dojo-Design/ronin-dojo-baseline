import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import * as z from "zod"
import type { SubscriptionTier } from "~/.generated/prisma/browser"
import { getSortingStateParser } from "~/lib/parsers"

export const subscriptionTiersTableParamsSchema = {
  name: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  sort: getSortingStateParser<SubscriptionTier>().withDefault([{ id: "level", desc: false }]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}

export const subscriptionTiersTableParamsCache = createSearchParamsCache(
  subscriptionTiersTableParamsSchema,
)
export type SubscriptionTiersTableSchema = Awaited<
  ReturnType<typeof subscriptionTiersTableParamsCache.parse>
>

export const subscriptionTierSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  level: z.coerce.number().int().min(0, "Level must be 0 or greater"),
  isSystem: z.boolean().default(false),
})

export type SubscriptionTierSchema = z.infer<typeof subscriptionTierSchema>
