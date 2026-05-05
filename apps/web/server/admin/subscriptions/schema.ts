import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import * as z from "zod"
import type { UserBrandSubscription } from "~/.generated/prisma/browser"
import { getSortingStateParser } from "~/lib/parsers"

export const subscriptionsTableParamsSchema = {
  name: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  sort: getSortingStateParser<UserBrandSubscription>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}

export const subscriptionsTableParamsCache = createSearchParamsCache(
  subscriptionsTableParamsSchema,
)
export type SubscriptionsTableSchema = Awaited<
  ReturnType<typeof subscriptionsTableParamsCache.parse>
>

export const subscriptionSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1, "User is required"),
  tierId: z.string().min(1, "Tier is required"),
  status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED", "PAST_DUE"]).default("ACTIVE"),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional().nullable(),
})

export type SubscriptionSchema = z.infer<typeof subscriptionSchema>
