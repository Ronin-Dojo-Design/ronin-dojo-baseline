import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import * as z from "zod"
import type { LineageTree } from "~/.generated/prisma/browser"
import { getSortingStateParser } from "~/lib/parsers"

export const lineageTreesTableParamsSchema = {
  name: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  sort: getSortingStateParser<LineageTree>().withDefault([{ id: "name", desc: false }]),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}

export const lineageTreesTableParamsCache = createSearchParamsCache(lineageTreesTableParamsSchema)
export type LineageTreesTableSchema = Awaited<ReturnType<typeof lineageTreesTableParamsCache.parse>>

export const toggleLineageTreeClaimabilitySchema = z.object({
  treeId: z.string().min(1),
  isClaimable: z.boolean(),
})

export const toggleLineageTreeMemberClaimabilitySchema = z.object({
  treeId: z.string().min(1),
  memberId: z.string().min(1),
  isClaimable: z.boolean(),
})

export const updateLineageTreeMemberSelectedRankSchema = z.object({
  treeId: z.string().min(1),
  memberId: z.string().min(1),
  rankAwardId: z
    .union([z.string().min(1), z.literal("__clear__")])
    .transform(value => (value === "__clear__" ? null : value)),
})

export type ToggleLineageTreeClaimabilitySchema = z.infer<
  typeof toggleLineageTreeClaimabilitySchema
>
export type ToggleLineageTreeMemberClaimabilitySchema = z.infer<
  typeof toggleLineageTreeMemberClaimabilitySchema
>
export type UpdateLineageTreeMemberSelectedRankSchema = z.input<
  typeof updateLineageTreeMemberSelectedRankSchema
>
