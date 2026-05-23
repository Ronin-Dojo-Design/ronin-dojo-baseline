import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"
import * as z from "zod"
import { type ContentAtom, ContentAtomStatus } from "~/.generated/prisma/browser"
import { getSortingStateParser } from "~/lib/parsers"

export const contentAtomsTableParamsSchema = {
  title: parseAsString.withDefault(""),
  sort: getSortingStateParser<ContentAtom>().withDefault([{ id: "createdAt", desc: true }]),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(25),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  operator: parseAsStringEnum(["and", "or"]).withDefault("and"),
  status: parseAsArrayOf(
    parseAsStringEnum<ContentAtomStatus>(Object.values(ContentAtomStatus)),
  ).withDefault([]),
}

export const contentAtomsTableParamsCache = createSearchParamsCache(contentAtomsTableParamsSchema)
export type ContentAtomsTableSchema = Awaited<ReturnType<typeof contentAtomsTableParamsCache.parse>>

export const contentAtomSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  canonicalId: z.string().optional(),
  hook: z.string().optional(),
  longFormCopy: z.string().optional(),
  status: z.enum(ContentAtomStatus).default("INBOX"),
  disciplineId: z.string().nullish(),
  styleId: z.string().nullish(),
  organizationId: z.string().nullish(),
  tags: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
})

export type ContentAtomSchema = z.infer<typeof contentAtomSchema>
