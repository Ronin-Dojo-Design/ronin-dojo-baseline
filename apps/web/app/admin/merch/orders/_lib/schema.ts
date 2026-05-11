import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import { FulfillmentStatus } from "~/.generated/prisma/browser"
import type { MerchOrderRow } from "~/server/web/merch/queries"
import { getSortingStateParser } from "~/lib/parsers"

export const merchOrdersTableParamsSchema = {
  search: parseAsString.withDefault(""),
  sort: getSortingStateParser<MerchOrderRow>().withDefault([{ id: "createdAt", desc: true }]),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
  status: parseAsArrayOf(
    parseAsStringEnum<FulfillmentStatus>(Object.values(FulfillmentStatus)),
  ).withDefault([]),
}

export const merchOrdersTableParamsCache = createSearchParamsCache(merchOrdersTableParamsSchema)
export type MerchOrdersTableParamsSchema = Awaited<
  ReturnType<typeof merchOrdersTableParamsCache.parse>
>
